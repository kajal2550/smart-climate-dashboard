const twilio = require('twilio');
const { TELEGRAM_BOT_TOKEN } = process.env;

// Initialize Twilio client if credentials are present
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

/**
 * Send a message via WhatsApp using Twilio
 * @param {string} to   Phone number in E.164 format (e.g., +1234567890)
 * @param {string} body Message body
 */
async function sendWhatsApp(to, body) {
  if (!twilioClient) {
    console.warn('Twilio client not configured; WhatsApp send skipped');
    return;
  }
  try {
    await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${to}`,
      body,
    });
  } catch (err) {
    console.error('WhatsApp send error:', err);
  }
}

/**
 * Send a Telegram message via Bot API
 * @param {string} chatId Telegram chat ID (user or group)
 * @param {string} text   Message text
 */
async function sendTelegram(chatId, text) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('Telegram token not set; send skipped');
    return;
  }
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch (err) {
    console.error('Telegram send error:', err);
  }
}

/**
 * Dispatch alert via configured channels.
 * Preference order: WhatsApp → Telegram.
 */
async function dispatchAlert({ whatsapp, telegram, message }) {
  if (whatsapp) {
    await sendWhatsApp(whatsapp, message);
  }
  if (telegram) {
    await sendTelegram(telegram, message);
  }
}

module.exports = { dispatchAlert, sendWhatsApp, sendTelegram };
