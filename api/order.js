const BOT_TOKEN = process.env.VITE_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.VITE_ADMIN_CHAT_ID;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const order = req.body;

  // Format message for Admin
  const message = `
🆕 *Yangi Buyurtma!*

👤 *Mijoz:* ${order.customerName}
📞 *Tel:* ${order.customerPhone}
👕 *Futbolka:* ${order.color === 'white' ? 'Oq' : 'Qora'} (${order.size})
📍 *Tur:* ${order.deliveryType === 'delivery' ? 'Dastavka' : 'Olib ketish'}
🏠 *Manzil:* ${order.deliveryAddress || 'Kiritilmagan'}

💰 *Jami narx:* ${order.totalPrice.toLocaleString()} so'm

🖼 *Print joylari:* ${order.placements.join(', ')}

🆔 *Telegram ID:* ${order.telegramUserId}
👤 *Username:* @${order.telegramUsername}
`.trim();

  try {
    // Send to Telegram Admin
    const tgUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    await fetch(tgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID || order.telegramUserId, // Fallback to user if admin not set
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Telegram API Error:', error);
    return res.status(500).json({ error: 'Failed to send notification' });
  }
}
