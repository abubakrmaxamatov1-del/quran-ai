import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBAPP_URL =
  process.env.TELEGRAM_WEBAPP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://quran-ai-tau.vercel.app";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

export async function GET() {
  const { data: dbCheck, error: dbError } = await supabase.from('surahs').select('count', { count: 'exact', head: true }).limit(1);
  
  return NextResponse.json({
    status: 'online',
    database: dbError ? 'error' : 'connected',
    db_error: dbError?.message,
    env: {
      has_bot_token: !!BOT_TOKEN,
      has_gemini_key: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      has_service_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      site_url: process.env.NEXT_PUBLIC_SITE_URL || 'not_set'
    }
  });
}

async function sendMessage(chatId: number, text: string, replyMarkup?: any) {
  if (!BOT_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      ...(replyMarkup ? { reply_markup: replyMarkup } : {})
    }),
  });
}

// Helper to escape HTML special characters
function escapeHTML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function getVerseFromDB(sura: number, aya: number) {
  const { data, error } = await supabase
    .from('quran_mansour')
    .select('arabic_text, translation, footnotes')
    .eq('sura_number', sura)
    .eq('aya_number', aya)
    .single();
  
  if (error || !data) return null;
  return data;
}

function formatVerse(sura: number, aya: number, arabic: string, translation: string, footnotes?: string) {
  // Use HTML tags for bold and code
  let text = `\n\n<b>${sura}-sura, ${aya}-oyat:</b>\n\n<code>${arabic}</code>\n\n<b>Ma'nosi:</b> ${escapeHTML(translation)}`;
  
  if (footnotes && footnotes !== 'NULL' && footnotes.trim() !== '') {
    text += `\n\n<b>Tafsir:</b> <i>${escapeHTML(footnotes)}</i>`;
  }
  
  text += `\n\n`;
  return text;
}

async function generateAIResponse(userId: string, userMessage: string) {
  const systemPrompt = `Siz "Muallim Abu Bakr" botining aqlli va muloyim yordamchisisiz. 
Maqsadingiz: Foydalanuvchilarga Qur'on oyatlari bo'yicha aniq ma'lumot berish.

MUHIM QOIDALAR:
1. O'z fikringizdan kelib chiqib "hukm" (fatvo) bermang va oyatlarni o'zingizcha sharhlamang.
2. Savolga javob berishda doimo Qur'on oyatlariga tayanishingiz kerak.
3. Biror oyatni keltirmoqchi bo'lsangiz, uni FAQAT [GET_VERSE:sura:oyat] ko'rinishida yozing. 
4. Tizim avtomatik ravishda ushbu tagni bazadagi rasmiy tarjima va tafsir bilan almashtiradi.
5. Foydalanuvchiga doimo muloyim bo'ling va javoblarni faqat o'zbek tilida bering.

Sizning vazifangiz - mustaqil olim bo'lish emas, balki foydalanuvchini bazadagi rasmiy manbalarga yo'naltiruvchi yo'lboshchi bo'lishdir.`;

  const result = await model.generateContent([systemPrompt, userMessage]);
  let responseText = result.response.text();

  // Escape the AI text BEFORE inserting pre-formatted verse blocks
  responseText = escapeHTML(responseText);

  // Find and replace verse tags with actual data from DB
  const verseRegex = /\[GET_VERSE:(\d+):(\d+)\]/g;
  const matches = [...responseText.matchAll(verseRegex)];
  
  for (const match of matches) {
    const sura = parseInt(match[1]);
    const aya = parseInt(match[2]);
    const verseData = await getVerseFromDB(sura, aya);
    
    if (verseData) {
      const formattedVerse = formatVerse(sura, aya, verseData.arabic_text, verseData.translation, verseData.footnotes);
      responseText = responseText.replace(match[0], formattedVerse);
    } else {
      responseText = responseText.replace(match[0], `\n\n(Oyat topilmadi: ${sura}:${aya})\n\n`);
    }
  }

  return responseText;
}

export async function POST(req: Request) {
  try {
    const update = await req.json();
    if (!update.message) return NextResponse.json({ ok: true });

    const message = update.message;
    const chatId = message.chat.id;
    const from = message.from;
    const tgId = from?.id;

    if (!tgId) {
      console.log('[Telegram Webhook] No tgId found in message');
      return NextResponse.json({ ok: true });
    }

    // DEBUG: Log presence of keys (without values)
    console.log('[Telegram Webhook] Env check:', {
      HAS_BOT_TOKEN: !!BOT_TOKEN,
      HAS_SUPABASE_URL: !!supabaseUrl,
      HAS_SERVICE_KEY: !!supabaseServiceKey,
      URL: supabaseUrl
    });

    // Fetch user from database - more resilient approach
    console.log(`[Telegram Webhook] Fetching user: ${tgId}`);
    const { data: users, error: userError } = await supabase
      .from('telegram_users')
      .select('*')
      .eq('telegram_id', tgId)
      .limit(1);

    if (userError) {
      console.error('[Telegram Webhook] DB Query Error:', userError);
    }
    
    const user = users && users.length > 0 ? users[0] : null;

    if (message.text === '/start') {
      const firstName = from?.first_name || 'aziz foydalanuvchi';
      
      if (user && user.full_name !== '[PENDING_NAME]' && user.phone_number !== '[PENDING_PHONE]') {
        // Fully registered logic
        await sendMessage(chatId, `Assalomu alaykum, <b>${escapeHTML(firstName)}</b>! ✨\n\nQur'on o'qish, tinglash va tafsir qilish maqsadida yaratilgan "Muallim Abu Bakr" ilovasiga xush kelibsiz.\n\nIlovaga kirish uchun quyidagi tugmani bosing:`, {
          inline_keyboard: [[{ text: "🚀 Muallim Ilovaga kirish", web_app: { url: WEBAPP_URL } }]]
        });
      } else {
        // New user or incomplete registration
        if (!user) {
          const { error: insError } = await supabase.from('telegram_users').insert([{
            telegram_id: tgId,
            username: from.username || null,
            telegram_first_name: from.first_name || null,
            telegram_last_name: from.last_name || null,
            full_name: '[PENDING_NAME]',
            phone_number: '[PENDING_PHONE]'
          }]);
          if (insError) throw new Error(`Insert failed: ${insError.message}`);
        } else {
          const { error: updError } = await supabase.from('telegram_users').update({
            full_name: '[PENDING_NAME]',
            phone_number: '[PENDING_PHONE]'
          }).eq('telegram_id', tgId);
          if (updError) throw new Error(`Update pending state failed: ${updError.message}`);
        }
        await sendMessage(chatId, "Assalomu alaykum!\nIltimos, ro'yxatdan o'tish uchun ismingizni kiriting:", {
          remove_keyboard: true
        });
      }
    } else if (message.contact) {
      // Phone number submission
      if (user && user.phone_number === '[PENDING_PHONE]') {
        const contactId = message.contact.user_id;
        
        // Anti-fake contact check
        if (contactId && contactId !== tgId) {
          await sendMessage(chatId, "Iltimos, faqat o'zingizning raqamingizni yuboring.");
          return NextResponse.json({ ok: true });
        }
        
        await supabase.from('telegram_users').update({
          phone_number: message.contact.phone_number
        }).eq('telegram_id', tgId);

        await sendMessage(chatId, "Tabriklaymiz! Ro'yxatdan muvaffaqiyatli o'tdingiz. 🎉", {
          remove_keyboard: true
        });
        await sendMessage(chatId, "Ilovaga kirish uchun quyidagi tugmani bosing:", {
          inline_keyboard: [[{ text: "🚀 Muallim Ilovaga kirish", web_app: { url: WEBAPP_URL } }]]
        });
      }
    } else if (message.text) {
      // Name submission or general chat
      if (user && user.full_name === '[PENDING_NAME]') {
        const name = message.text.trim();
        // Validation limits
        if (name.length < 2 || name.length > 50 || name.includes('http') || name.includes('/')) {
          await sendMessage(chatId, escapeHTML("Iltimos, haqiqiy ismingizni kiriting (2-50 harf oralig'ida)."));
          return NextResponse.json({ ok: true });
        }
        
        const { error: nameError } = await supabase.from('telegram_users').update({
          full_name: name
        }).eq('telegram_id', tgId);

        if (nameError) throw new Error(`Name update failed: ${nameError.message}`);

        await sendMessage(chatId, `Rahmat, <b>${escapeHTML(name)}</b>!\n\nEndi telefon raqamingizni yuborish uchun pastdagi tugmani bosing:`, {
          keyboard: [[{ text: "📱 Telefon raqamni yuborish", request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true
        });
      } else {
        // AI Chat
        const aiResponse = await generateAIResponse(tgId.toString(), message.text);
        await sendMessage(chatId, aiResponse);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[Telegram Webhook Error]', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Server error', 
      message: error?.message || String(error),
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 });
  }
}
