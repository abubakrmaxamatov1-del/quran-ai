import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBAPP_URL =
  process.env.TELEGRAM_WEBAPP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://quran-ai-tau.vercel.app";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder_key';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  return NextResponse.json({
    status: 'online',
    env: {
      has_bot_token: !!BOT_TOKEN,
      has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
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
      ...(replyMarkup ? { reply_markup: replyMarkup } : {})
    }),
  });
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

    // Fetch user from database
    const { data: user } = await supabase
      .from('telegram_users')
      .select('*')
      .eq('telegram_id', tgId)
      .single();

    if (message.text === '/start') {
      const firstName = from?.first_name || 'aziz foydalanuvchi';
      
      if (user && user.full_name !== '[PENDING_NAME]' && user.phone_number !== '[PENDING_PHONE]') {
        // Fully registered logic
        await sendMessage(chatId, `Assalomu alaykum, ${firstName}! ✨\n\nQur'on o'qish, tinglash va tafsir qilish maqsadida yaratilgan "Muallim Abu Bakr" ilovasiga xush kelibsiz.\n\nIlovaga kirish uchun quyidagi tugmani bosing:`, {
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
      // Name submission
      if (user && user.full_name === '[PENDING_NAME]') {
        const name = message.text.trim();
        // Validation limits
        if (name.length < 2 || name.length > 50 || name.includes('http') || name.includes('/')) {
          await sendMessage(chatId, "Iltimos, haqiqiy ismingizni kiriting (2-50 harf oralig'ida).");
          return NextResponse.json({ ok: true });
        }
        
        const { error: nameError } = await supabase.from('telegram_users').update({
          full_name: name
        }).eq('telegram_id', tgId);

        if (nameError) throw new Error(`Name update failed: ${nameError.message}`);

        await sendMessage(chatId, `Rahmat, ${name}!\nEndi telefon raqamingizni yuborish uchun pastdagi tugmani bosing:`, {
          keyboard: [[{ text: "📱 Telefon raqamni yuborish", request_contact: true }]],
          resize_keyboard: true,
          one_time_keyboard: true
        });
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
