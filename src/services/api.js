import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { calculateTotal, formatPrice } from '../context/OrderContext';

const BOT_TOKEN = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
const CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID;

// Helper to send message to Telegram
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
async function sendTelegramPhotoDirect(base64Data, caption) {
  if (!BOT_TOKEN || !CHAT_ID) return;
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
  
  const blob = dataURLtoBlob(base64Data);
  const formData = new FormData();
  formData.append('chat_id', CHAT_ID);
  formData.append('photo', blob, 'design.jpg');
  formData.append('caption', caption);

  await fetch(url, {
    method: 'POST',
    body: formData, // Do not set Content-Type, browser will set multipart/form-data
  });
}

export async function submitOrder(orderData) {
  try {
    const orderId = Date.now().toString(); 
    const activePlacements = Object.entries(orderData.placements).filter(([, p]) => p.image);
    const total = calculateTotal(orderData);

    // 1. Notify Admin via Telegram FIRST (fast and reliable)
    const { name, phone, address, deliveryType } = orderData.customerInfo;
    const text = `
📦 <b>YANGI BUYURTMA #${orderId}</b>

👤 <b>Mijoz:</b> ${name}
📞 <b>Tel:</b> ${phone}
📍 <b>Yetkazish:</b> ${deliveryType === 'delivery' ? 'Dastavka' : 'Olib ketish'} ${address ? \`(\${address})\` : ''}

👕 <b>Futbolka:</b> ${orderData.color === 'white' ? 'Oq' : 'Qora'}
📏 <b>Razmer:</b> ${orderData.size}
💰 <b>Jami summa:</b> ${formatPrice(total)}

👇 <i>Mijoz yuklagan rasmlar quyida:</i>
    `.trim();

    await sendTelegramMessage(text);

    // Send each uploaded image DIRECTLY to Telegram (Bypasses Firebase Storage hangs)
    for (const [zone, placement] of activePlacements) {
      if (placement.image) {
        await sendTelegramPhotoDirect(placement.image, \`Print uchun rasm (\${zone})\`);
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

    return orderId;
  } catch (error) {
    console.error('Error submitting order:', error);
    throw error;
  }
}
