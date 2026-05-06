export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).send('Webhook is running');
  }

  try {
    const body = req.body;
    const BOT_TOKEN = process.env.VITE_TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;

    if (!BOT_TOKEN) {
      console.error('Bot token missing');
      return res.status(500).send('Config error');
    }

    const WEB_APP_URL = 'https://mema-uz.vercel.app'; // Replace with env var if needed

    // Check if it's a message and contains text
    if (body.message && body.message.text) {
      const chatId = body.message.chat.id;
      const text = body.message.text;

      // Handle /start command
      if (text.startsWith('/start')) {
        const welcomeMessage = `
Assalomu alaykum! <b>MEMA UZ</b> ga xush kelibsiz! 👕✨

O'zingizga yoqqan dizayn va rasmdagi futbolkani yaratish uchun pastdagi tugmani bosing va <b>Mini Ilova</b> ga kiring!👇
        `.trim();

        // Send message with inline keyboard
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeMessage,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: "👕 Futbolka yaratish",
                    web_app: { url: WEB_APP_URL }
                  }
                ]
              ]
            }
          })
        });
      }
    }

    // Always return 200 OK to Telegram so it doesn't retry
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(200).send('OK'); // Return 200 even on error to stop retries
  }
}
