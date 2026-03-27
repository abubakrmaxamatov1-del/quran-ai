import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WEBAPP_URL =
  process.env.TELEGRAM_WEBAPP_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000";
const TELEGRAM_USERS_TABLE =
  process.env.TELEGRAM_USERS_TABLE || "telegram_users";

if (!BOT_TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN topilmadi (.env.local)");
}
if (!SUPABASE_URL) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL topilmadi (.env.local)");
}
if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY topilmadi (.env.local)");
}

const TG_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const state = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function telegram(method, payload = {}) {
  const res = await fetch(`${TG_API}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Telegram API error (${method}): ${JSON.stringify(data)}`);
  }
  return data.result;
}

async function upsertTelegramUser({
  telegram_id,
  username,
  full_name,
  phone_number,
  telegram_first_name,
  telegram_last_name,
}) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${TELEGRAM_USERS_TABLE}?on_conflict=telegram_id`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([
        {
          telegram_id,
          username,
          full_name,
          phone_number,
          telegram_first_name,
          telegram_last_name,
          updated_at: new Date().toISOString(),
        },
      ]),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase insert error: ${res.status} ${text}`);
  }
}

async function sendAskName(chatId) {
  await telegram("sendMessage", {
    chat_id: chatId,
    text: "Assalomu alaykum! Ismingizni kiriting:",
    reply_markup: { remove_keyboard: true },
  });
}

async function sendAskPhone(chatId) {
  await telegram("sendMessage", {
    chat_id: chatId,
    text: "Telefon raqamingizni ulashish tugmasini bosing:",
    reply_markup: {
      keyboard: [[{ text: "📱 Raqamni ulashish", request_contact: true }]],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });
}

async function sendOpenWebApp(chatId, name) {
  await telegram("sendMessage", {
    chat_id: chatId,
    text: `Rahmat, ${name}! Ma'lumotlaringiz saqlandi ✅`,
    reply_markup: { remove_keyboard: true },
  });

  await telegram("sendMessage", {
    chat_id: chatId,
    text: "Muallim ilovasini ochish uchun tugmani bosing:",
    reply_markup: {
      inline_keyboard: [
        [{ text: "🚀 Muallim Ilovani ochish", web_app: { url: WEBAPP_URL } }],
        [{ text: "🌐 Brauzerda ochish", url: WEBAPP_URL }],
      ],
    },
  });
}

function userKey(message) {
  return String(message.from?.id || message.chat.id);
}

async function handleMessage(message) {
  const chatId = message.chat.id;
  const key = userKey(message);
  const st = state.get(key);

  if (message.text?.startsWith("/start")) {
    state.set(key, { step: "awaiting_name" });
    await sendAskName(chatId);
    return;
  }

  if (message.contact) {
    if (!st || st.step !== "awaiting_contact" || !st.name) {
      await telegram("sendMessage", {
        chat_id: chatId,
        text: "Avval /start yuboring va ismingizni kiriting.",
      });
      return;
    }

    if (
      message.contact.user_id &&
      message.from?.id &&
      message.contact.user_id !== message.from.id
    ) {
      await telegram("sendMessage", {
        chat_id: chatId,
        text: "Iltimos, o'zingizning raqamingizni ulashing.",
      });
      return;
    }

    const from = message.from || {};

    await upsertTelegramUser({
      telegram_id: from.id,
      username: from.username || null,
      full_name: st.name,
      phone_number: message.contact.phone_number || null,
      telegram_first_name: from.first_name || null,
      telegram_last_name: from.last_name || null,
    });

    state.delete(key);
    await sendOpenWebApp(chatId, st.name);
    return;
  }

  if (message.text) {
    const text = message.text.trim();

    if (!st || st.step !== "awaiting_name") {
      await telegram("sendMessage", {
        chat_id: chatId,
        text: "Ro'yxatdan o'tish uchun /start bosing.",
      });
      return;
    }

    if (text.length < 2) {
      await telegram("sendMessage", {
        chat_id: chatId,
        text: "Ism kamida 2 ta harf bo'lishi kerak. Qayta kiriting:",
      });
      return;
    }

    state.set(key, { step: "awaiting_contact", name: text });
    await sendAskPhone(chatId);
  }
}

async function poll() {
  let offset = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const updates = await telegram("getUpdates", {
        offset,
        timeout: 30,
        allowed_updates: ["message"],
      });

      for (const update of updates) {
        offset = update.update_id + 1;
        if (update.message) {
          await handleMessage(update.message);
        }
      }
    } catch (error) {
      console.error("[telegram-bot] error:", error.message);
      await sleep(1500);
    }
  }
}

console.log("[telegram-bot] started");
console.log(`[telegram-bot] webapp url: ${WEBAPP_URL}`);

poll();
