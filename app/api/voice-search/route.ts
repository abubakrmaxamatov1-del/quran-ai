import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioBlob = formData.get('audio') as Blob;
    
    if (!audioBlob) {
      return NextResponse.json({ error: 'Audio ma\'lumotlari topilmadi' }, { status: 400 });
    }

    const arrayBuffer = await audioBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const prompt = `Ushbu audio faylda Qur'on surasi va oyati qiroat qilingan. 
Iltimos, qaysi sura va oyat o'qilganini aniqlang va javobni FAQAT quyidagi formatda bering:
[SURA_NUMBER]:[AYAH_NUMBER]

Masalan, agar Baqara surasining 255-oyati bo'lsa: 2:255 deb javob bering.
Agar qaysi oyat ekanligini aniqlay olmasangiz, faqat "NOT_FOUND" deb yozing.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: buffer.toString('base64'),
          mimeType: audioBlob.type || 'audio/webm'
        }
      }
    ]);

    const identification = result.response.text().trim();
    console.log(`[Voice Search API] Gemini identified: ${identification}`);

    if (identification === "NOT_FOUND" || !identification.includes(':')) {
       return NextResponse.json({ success: false, message: 'Qiroatni aniqlab bo\'lmadi' });
    }

    const [suraStr, ayaStr] = identification.split(':');
    const sura = parseInt(suraStr.replace(/[^0-9]/g, ''));
    const aya = parseInt(ayaStr.replace(/[^0-9]/g, ''));

    if (isNaN(sura) || isNaN(aya)) {
      return NextResponse.json({ success: false, message: 'Natija raqam formatida emas' });
    }

    // Database lookup in quran_mansour table
    const { data: verseData, error } = await supabase
      .from('quran_mansour')
      .select('arabic_text, translation, footnotes')
      .eq('sura_number', sura)
      .eq('aya_number', aya)
      .single();

    if (error || !verseData) {
       return NextResponse.json({ 
         success: true, 
         found: false,
         sura, 
         aya,
         message: 'Oyat aniqlandi, lekin bazadan ma\'lumot topilmadi' 
       });
    }

    return NextResponse.json({
      success: true,
      found: true,
      sura,
      aya,
      arabic: verseData.arabic_text,
      translation: verseData.translation,
      footnotes: verseData.footnotes
    });

  } catch (error: any) {
    console.error('Voice search error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
