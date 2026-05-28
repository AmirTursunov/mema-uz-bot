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


// Helper to fill white background
async function ensureWhiteBackground(dataurl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      // Fill white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Draw image
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };
    img.onerror = () => resolve(dataurl); // Fallback
    img.src = dataurl;
  });
}


// Helper to combine multiple base64 images into one canvas image in a grid layout with gaps
async function combineImages(imageDataUrls) {
  return new Promise((resolve) => {
    const images = [];
    let loaded = 0;
    const total = imageDataUrls.length;
    if (total === 0) {
      resolve('');
      return;
    }

    const drawGridAndResolve = () => {
      const validImages = images.filter(i => i);
      if (validImages.length === 0) {
        resolve('');
        return;
      }
      
      const cols = Math.min(2, validImages.length);
      const rows = Math.ceil(validImages.length / cols);
      const cellWidth = Math.max(...validImages.map(i => i.width));
      const cellHeight = Math.max(...validImages.map(i => i.height));
      const gap = 20; // 20px gap between images
      
      const canvas = document.createElement('canvas');
      canvas.width = cellWidth * cols + gap * (cols + 1);
      canvas.height = cellHeight * rows + gap * (rows + 1);
      const ctx = canvas.getContext('2d');
      
      // Fill white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw each image in a grid
      validImages.forEach((img, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        // Center image in its cell, accounting for gaps
        const x = gap + col * (cellWidth + gap) + (cellWidth - img.width) / 2;
        const y = gap + row * (cellHeight + gap) + (cellHeight - img.height) / 2;
        ctx.drawImage(img, x, y);
      });
      
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    imageDataUrls.forEach((dataUrl, idx) => {
      const img = new Image();
      img.onload = () => {
        images[idx] = img;
        loaded++;
        if (loaded === total) drawGridAndResolve();
      };
      img.onerror = () => {
        images[idx] = null;
        loaded++;
        if (loaded === total) drawGridAndResolve();
      };
      img.src = dataUrl;
    });
  });
}

async function sendTelegramMediaGroup(photos, caption, orderId, userId) {
  if (!BOT_TOKEN || !CHAT_ID) return;

  const imageDataUrls = await Promise.all(
    photos.map(p => ensureWhiteBackground(p.image))
  );
  
  const combinedDataUrl = await combineImages(imageDataUrls);
  const blob = dataURLtoBlob(combinedDataUrl);
  const filename = `combined.jpg`;

  const formData = new FormData();
  formData.append('chat_id', CHAT_ID);
  formData.append('photo', blob, filename);
  formData.append('caption', caption);
  formData.append('parse_mode', 'HTML');

  if (orderId && userId) {
    const replyMarkup = {
      inline_keyboard: [
        [
          { text: "✅ Qabul qilish", callback_data: `accept_${orderId}_${userId}` },
          { text: "❌ Bekor qilish", callback_data: `reject_${orderId}_${userId}` },
        ],
      ],
    };
    formData.append('reply_markup', JSON.stringify(replyMarkup));
  }

  const sendPhotoUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;
  await fetch(sendPhotoUrl, {
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
💰 <b>Jami:</b> ${formatPrice(total)}

💳 <b>To'lov:</b> 100% Oldindan (Chek ilova qilindi)
    `.trim();

    // 1. Notify Admin via Telegram (Send all photos as a single Media Group)
    // Combine designs and receipt for sending
    const allPhotos = [
      ...activePlacements.map(([zone, p]) => ({ image: p.image, zone })), 
      { image: orderData.paymentReceipt, zone: 'payment' }
    ].filter(p => p.image);

    if (allPhotos.length > 0) {
      const caption = getBaseText(allPhotos[0].zone);
      await sendTelegramMediaGroup(allPhotos, caption, orderId, userId);
    }

    // 2. Try to save to Firestore, but don't hang if rules are not set
    try {
      const orderDoc = {
        orderId,
        telegramUserId: String(orderData.telegramUserId),
        telegramUsername: orderData.telegramUsername,
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
