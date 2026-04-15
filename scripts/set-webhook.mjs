import dotenv from "dotenv";

// Locally load .env.local variables
dotenv.config({ path: ".env.local" });

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = "https://quran-ai-tau.vercel.app/api/telegram/webhook";

async function setWebhook() {
  if (!BOT_TOKEN) {
    console.error("No BOT_TOKEN found in .env.local!");
    return;
  }
  
  console.log(`Setting Webhook to: ${WEBHOOK_URL} ...`);
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}`);
    const data = await res.json();
    console.log("Telegram API Response:", data);
  } catch (error) {
    console.error("Failed to set webhook:", error);
  }
}

setWebhook();
