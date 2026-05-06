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

    const WEB_APP_URL = 'https://mema-uz.vercel.app'; 

    // 1. Handle Callback Queries (Accept/Reject buttons)
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const data = callbackQuery.data; // e.g., accept_12345_67890
      const [action, orderId, userId] = data.split('_');

      if (action === 'accept') {
        // Notify the customer
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: userId,
            text: `✅ <b>Tabriklaymiz!</b>\n\nSizning <b>#${orderId}</b> raqamli buyurtmangiz qabul qilindi. Operatorimiz tez orada siz bilan bog'lanadi.`,
            parse_mode: 'HTML'
          })
        });

        // Answer callback query to stop loading spinner in admin view
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackQuery.id,
            text: "Mijozga xabar yuborildi ✅"
          })
        });

        // Update admin message to show it's accepted
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageCaption`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: callbackQuery.message.chat.id,
            message_id: callbackQuery.message.message_id,
            caption: callbackQuery.message.caption + "\n\n✅ <b>QABUL QILINDI</b>",
            parse_mode: 'HTML'
          })
        });
      }

      if (action === 'reject') {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackQuery.id,
            text: "Buyurtma rad etildi ❌"
          })
        });
      }

      return res.status(200).send('OK');
    }

    // 2. Handle Messages (/start)
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
