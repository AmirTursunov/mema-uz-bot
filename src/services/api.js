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

export async function submitOrder(orderData) {
  try {
    // 1. Upload images to Firebase Storage
    const uploadedPlacements = {};
    const orderId = Date.now().toString(); // simple unique ID
    const activePlacements = Object.entries(orderData.placements).filter(([, p]) => p.image);

    for (const [zone, placement] of activePlacements) {
      if (!placement.image) continue;
      
      // placement.image is a base64 string from FileReader
      const storageRef = ref(storage, `orders/${orderId}/${zone}.jpg`);
      await uploadString(storageRef, placement.image, 'data_url');
      const downloadURL = await getDownloadURL(storageRef);
      
      uploadedPlacements[zone] = {
        ...placement,
        image: downloadURL, // replace base64 with Firebase URL
      };
    }

    const finalOrderPlacements = { ...orderData.placements, ...uploadedPlacements };
    const total = calculateTotal({ ...orderData, placements: finalOrderPlacements });

    // 2. Save order to Firestore
    const orderDoc = {
      orderId,
      color: orderData.color,
      size: orderData.size,
      placements: finalOrderPlacements,
      customerInfo: orderData.customerInfo,
      totalPrice: total,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'orders'), orderDoc);

    // 3. Notify Admin via Telegram
    const { name, phone, address, deliveryType } = orderData.customerInfo;
    const text = `
📦 <b>YANGI BUYURTMA #${orderId}</b>

👤 <b>Mijoz:</b> ${name}
📞 <b>Tel:</b> ${phone}
📍 <b>Yetkazish:</b> ${deliveryType === 'delivery' ? 'Dastavka' : 'Olib ketish'} ${address ? `(${address})` : ''}

👕 <b>Futbolka:</b> ${orderData.color === 'white' ? 'Oq' : 'Qora'}
📏 <b>Razmer:</b> ${orderData.size}
💰 <b>Jami summa:</b> ${formatPrice(total)}

👇 <i>Mijoz yuklagan rasmlar quyida:</i>
    `.trim();

    await sendTelegramMessage(text);

    // Send each uploaded image to Telegram
    for (const [zone, placement] of Object.entries(uploadedPlacements)) {
      await sendTelegramPhoto(placement.image, `Print uchun rasm (${zone})`);
    }

    return docRef.id;
  } catch (error) {
    console.error('Error submitting order:', error);
    throw error;
  }
}
