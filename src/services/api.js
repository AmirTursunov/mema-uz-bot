import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { calculateTotal, formatPrice } from '../context/OrderContext';

const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

// Text message helper no longer needed since we send caption with photo, but keeping for utility
async function sendTelegramMessage(text) {
  if (!BOT_TOKEN || !CHAT_ID) return;
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: text,
      parse_mode: 'HTML',
    }),
  });
}

// Helper to send photo to Telegram
async function sendTelegramPhoto(photoUrl, caption) {
  if (!BOT_TOKEN || !CHAT_ID) return;
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      photo: photoUrl,
      caption: caption,
    }),
  });
}
// Helper to convert base64 to Blob
function dataURLtoBlob(dataurl) {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type:mime});
}

// Helper to send photo directly as a file to Telegram
async function sendTelegramPhotoDirect(base64Data, caption, orderId, userId) {
  if (!BOT_TOKEN || !CHAT_ID) return;
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
  
  const blob = dataURLtoBlob(base64Data);
  const formData = new FormData();
  formData.append('chat_id', CHAT_ID);
  formData.append('photo', blob, 'design.jpg');
  formData.append('caption', caption);
  formData.append('parse_mode', 'HTML');

  // Add Accept/Reject buttons
  if (orderId && userId) {
    formData.append('reply_markup', JSON.stringify({
      inline_keyboard: [
        [
          { text: "✅ Qabul qilish", callback_data: `accept_${orderId}_${userId}` },
          { text: "❌ Bekor qilish", callback_data: `reject_${orderId}_${userId}` }
        ]
      ]
    }));
  }

  await fetch(url, {
    method: 'POST',
    body: formData,
  });
}

export async function submitOrder(orderData) {
  try {
    const orderId = Date.now().toString(); 
    const activePlacements = Object.entries(orderData.placements).filter(([, p]) => p.image);
    const total = calculateTotal(orderData);

    // 1. Notify Admin via Telegram FIRST (fast and reliable)
    const { name, phone, address, deliveryType } = orderData.customerInfo;
    const userId = orderData.telegramUserId || 'unknown';
    const tgUser = orderData.telegramUsername && orderData.telegramUsername !== 'unknown' 
      ? `@${orderData.telegramUsername}` 
      : "Username yo'q";

    const getBaseText = (zone) => `
📦 <b>YANGI BUYURTMA #${orderId}</b>

👤 <b>Mijoz:</b> ${name}
📞 <b>Tel:</b> ${phone}
✈️ <b>Telegram:</b> ${tgUser}
📍 <b>Yetkazish:</b> ${deliveryType === 'delivery' ? 'Dastavka' : 'Olib ketish'} ${address ? '(' + address + ')' : ''}

👕 <b>Futbolka:</b> ${orderData.color === 'white' ? 'Oq' : 'Qora'}
📏 <b>Razmer:</b> ${orderData.size}
🎨 <b>Joylashuv:</b> ${zone === 'front' ? 'Oldi' : zone === 'back' ? 'Orqa' : zone === 'leftSleeve' ? 'Chap yeng' : 'O\'ng yeng'}
💰 <b>Jami:</b> ${formatPrice(total)}
    `.trim();

    // Send the first uploaded image with the full text as caption, subsequent ones with short caption
    let isFirst = true;
    for (const [zone, placement] of activePlacements) {
      if (placement.image) {
        const caption = isFirst ? getBaseText(zone) : `Print uchun rasm (${zone})`;
        await sendTelegramPhotoDirect(placement.image, caption, orderId, userId);
        isFirst = false;
      }
    }

    // 2. Try to save to Firestore, but don't hang if rules are not set
    try {
      const orderDoc = {
        orderId,
        color: orderData.color,
        size: orderData.size,
        customerInfo: orderData.customerInfo,
        totalPrice: total,
        status: 'pending',
        createdAt: serverTimestamp(),
      };
      // We don't save the heavy base64 to Firestore to save space
      await Promise.race([
        addDoc(collection(db, 'orders'), orderDoc),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 3000))
      ]);
    } catch (fbError) {
      console.warn('Firebase error (can be ignored if Telegram works):', fbError);
    }

    // 3. Save to localStorage for MyOrders tab
    const savedOrders = JSON.parse(localStorage.getItem('mema_my_orders') || '[]');
    savedOrders.unshift({
      id: orderId,
      color: orderData.color,
      size: orderData.size,
      totalPrice: total,
      status: 'Tekshirilmoqda',
      date: new Date().toISOString(),
    });
    localStorage.setItem('mema_my_orders', JSON.stringify(savedOrders));

    return orderId;
  } catch (error) {
    console.error('Error submitting order:', error);
    throw error;
  }
}
