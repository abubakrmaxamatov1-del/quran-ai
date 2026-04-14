import { NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBAPP_URL =
  process.env.TELEGRAM_WEBAPP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://quran-ai-orcin.vercel.app";

export async function POST(req: Request) {
  try {
    const update = await req.json();

    // Faqatgina botga yozilgan xabarni tekshiramiz
    if (update.message?.text === '/start') {
      const chatId = update.message.chat.id;
      const firstName = update.message.from?.first_name || 'aziz foydalanuvchi';

      const text = `Assalomu alaykum, ${firstName}! ✨\n\nQur'on o'qish, tinglash va tafsir qilish maqsadida yaratilgan "Muallim Abu Bakr" ilovasiga xush kelibsiz.\n\nIlovaga kirish uchun quyidagi tugmani bosing:`;

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🚀 Muallim Ilovaga kirish",
                  web_app: { url: WEBAPP_URL },
                },
              ],
            ],
          },
        }),
      });
    }

    // Telegramga muvaffaqiyatli qabul qilinganligini qaytaramiz (200)
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Telegram Webhook Error]', error);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
