import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDZuE19TxdljI90G54O-Lv4Ce4WouQIO8Q",
  authDomain: "mema-uz.firebaseapp.com",
  projectId: "mema-uz",
  storageBucket: "mema-uz.firebasestorage.app",
  messagingSenderId: "771416899748",
  appId: "1:771416899748:web:87c26e22099dbdb80fa631"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
        // Update Firestore status
        try {
          const q = query(collection(db, 'orders'), where('orderId', '==', orderId));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const orderDoc = querySnapshot.docs[0];
            await updateDoc(doc(db, 'orders', orderDoc.id), { status: 'accepted' });
          }
        } catch (e) {
          console.error('Firestore Update Error (Accept):', e);
        }

        // Notify the customer (if userId is valid)
        if (userId && userId !== 'unknown') {
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: userId,
              text: `✅ <b>Buyurtmangiz qabul qilindi!</b>\n\nSizning <b>#${orderId}</b> raqamli buyurtmangiz muvaffaqiyatli qabul qilindi. Tez orada operatorimiz siz bilan bog'lanadi.`,
              parse_mode: 'HTML'
            })
          }).catch(e => console.error('Error notifying user of acceptance:', e));
        }

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            callback_query_id: callbackQuery.id, 
            text: userId === 'unknown' ? "Mijoz ID topilmadi, lekin buyurtma qabul qilindi ✅" : "Mijozga xabar yuborildi ✅" 
          })
        }).catch(e => console.error('Error answering callback:', e));

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: callbackQuery.message.chat.id,
            message_id: callbackQuery.message.message_id,
            text: `#${orderId} buyurtma: ✅ QABUL QILINDI`,
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [] }
          })
        }).catch(e => console.error('Error editing message text:', e));
      }

      if (action === 'reject') {
        // Update Firestore status
        try {
          const q = query(collection(db, 'orders'), where('orderId', '==', orderId));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const orderDoc = querySnapshot.docs[0];
            await updateDoc(doc(db, 'orders', orderDoc.id), { status: 'rejected' });
          }
        } catch (e) {
          console.error('Firestore Update Error (Reject):', e);
        }

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
        }).catch(e => console.error('Error sending reject prompt:', e));

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ callback_query_id: callbackQuery.id })
        }).catch(e => console.error('Error answering reject callback:', e));

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: callbackQuery.message.chat.id,
            message_id: callbackQuery.message.message_id,
            text: `#${orderId} buyurtma: ❌ RAD ETISH (Sabab kutilmoqda)`,
            parse_mode: 'HTML',
            reply_markup: { inline_keyboard: [] }
          })
        }).catch(e => console.error('Error editing message text:', e));
      }

      return res.status(200).send('OK');
    }

    // 2. Handle Messages (/start or Replies)
    if (body.message) {
      const chatId = body.message.chat.id;
      const text = body.message.text || '';

      // Handle Admin Reply for Rejection Reason
      if (body.message.reply_to_message && body.message.reply_to_message.text && body.message.reply_to_message.text.includes('Rad etish sababini yozing')) {
        const replyText = body.message.reply_to_message.text;
        const orderIdMatch = replyText.match(/ID: (\d+)/);
        const userIdMatch = replyText.match(/USER: (\d+)/);

        if (orderIdMatch && userIdMatch) {
          const oId = orderIdMatch[1];
          const uId = userIdMatch[1];

          // Update Firestore with rejection reason
          try {
            const q = query(collection(db, 'orders'), where('orderId', '==', oId));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              const orderDoc = querySnapshot.docs[0];
              await updateDoc(doc(db, 'orders', orderDoc.id), { 
                status: 'rejected',
                rejectionReason: text
              });
            }
          } catch (e) {
            console.error('Firestore Update Error (Reason):', e);
          }

          if (uId !== 'unknown') {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: uId,
                text: `❌ <b>Buyurtmangiz rad etildi</b>\n\n#${oId} raqamli buyurtmangiz bekor qilindi.\n\n<b>Sabab:</b> ${text}`,
                parse_mode: 'HTML'
              })
            }).catch(e => console.error('Error notifying user:', e));
          }

          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: "Mijozga rad javobi yuborildi 📤" })
          }).catch(e => console.error('Error notifying admin:', e));
        }
        return res.status(200).send('OK');
      }

      // Handle /start command
      if (text.startsWith('/start')) {
        const welcomeMessage = `
Assalomu alaykum! <b>Brand</b> ga xush kelibsiz! 👕✨

O'zingizga yoqqan dizayn va rasmdagi futbolkani yaratish uchun pastdagi tugmani bosing va <b>Mini Ilova</b> ga kiring!👇
        `.trim();

        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeMessage,
            parse_mode: 'HTML',
            reply_markup: {
              inline_keyboard: [[{ text: "👕 Futbolka yaratish", web_app: { url: WEB_APP_URL } }]]
            }
          })
        }).catch(e => console.error('Error sending start message:', e));
      }
    }

    // Always return 200 OK to Telegram so it doesn't retry
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(200).send('OK'); // Return 200 even on error to stop retries
  }
}
