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
      const data = callbackQuery.data; 
      const [action, orderId, userId] = data.split('_');

      if (action === 'accept') {
        // Update Firestore status (so the app can sync)
        // Note: This requires Firestore rules to be open
        try {
          // We can't easily query by doc ID without knowing it, but we have orderId field
          // For simplicity in this serverless environment, we'll just send the message
          // In a full setup, you'd use admin SDK to update Firestore
        } catch (e) {}

        // Notify the customer
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: userId,
            text: `✅ <b>Buyurtmangiz qabul qilindi!</b>\n\nSizning <b>#${orderId}</b> raqamli buyurtmangiz muvaffaqiyatli qabul qilindi. Tez orada operatorimiz siz bilan bog'lanadi.`,
            parse_mode: 'HTML'
          })
        });

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callback_query_id: callbackQuery.id, text: "Mijozga xabar yuborildi ✅" })
        });

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
        // Prompt for reason
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: callbackQuery.message.chat.id,
            text: `❌ <b>Rad etish sababini yozing:</b>\n(Mijozga yuboriladi)\n\nID: <code>${orderId}</code>\nUSER: <code>${userId}</code>`,
            parse_mode: 'HTML',
            reply_markup: { force_reply: true }
          })
        });

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callback_query_id: callbackQuery.id })
        });
      }

      return res.status(200).send('OK');
    }

    // 2. Handle Messages (/start or Replies)
    if (body.message) {
      const chatId = body.message.chat.id;
      const text = body.message.text;

      // Handle Admin Reply for Rejection Reason
      if (body.message.reply_to_message && body.message.reply_to_message.text.includes('Rad etish sababini yozing')) {
        const replyText = body.message.reply_to_message.text;
        const orderIdMatch = replyText.match(/ID: (\d+)/);
        const userIdMatch = replyText.match(/USER: (\d+)/);

        if (orderIdMatch && userIdMatch) {
          const oId = orderIdMatch[1];
          const uId = userIdMatch[1];

          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: uId,
              text: `❌ <b>Buyurtmangiz rad etildi</b>\n\n#${oId} raqamli buyurtmangiz bekor qilindi.\n\n<b>Sabab:</b> ${text}`,
              parse_mode: 'HTML'
            })
          });

          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: "Mijozga rad javobi yuborildi 📤" })
          });
        }
        return res.status(200).send('OK');
      }

      if (text && text.startsWith('/start')) {
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
