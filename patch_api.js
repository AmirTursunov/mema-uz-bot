import fs from 'fs';

let content = fs.readFileSync('src/services/api.js', 'utf-8');

// Insert ensureWhiteBackground helper before sendTelegramMediaGroup
const ensureWhiteBgCode = `
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

// Helper to send multiple photos as a single Media Group (Album)
`;

content = content.replace('// Helper to send multiple photos as a single Media Group (Album)\n', ensureWhiteBgCode);

// Modify sendTelegramMediaGroup to make async changes to photos
const oldLoop = `  photos.forEach((photo, index) => {
    const filename = \`photo\${index}.jpg\`;
    const blob = dataURLtoBlob(photo.image);
    formData.append(filename, blob, filename);
    
    media.push({
      type: 'photo',
      media: \`attach://\${filename}\`,
      caption: index === 0 ? caption : '', // Caption goes on the first image
      parse_mode: 'HTML'
    });
  });`;

const newLoop = `  for (let index = 0; index < photos.length; index++) {
    const photo = photos[index];
    const filename = \`photo\${index}.jpg\`;
    const whiteBgDataUrl = await ensureWhiteBackground(photo.image);
    const blob = dataURLtoBlob(whiteBgDataUrl);
    formData.append(filename, blob, filename);
    
    media.push({
      type: 'photo',
      media: \`attach://\${filename}\`,
      caption: '', // No caption on images, sent separately
      parse_mode: 'HTML'
    });
  }`;

content = content.replace(oldLoop, newLoop);

// Modify the button message to include caption text
const oldButton = `        text: \`<b>#\${orderId}</b> buyurtmani boshqarish:\`,`;
const newButton = `        text: caption,`;

content = content.replace(oldButton, newButton);

fs.writeFileSync('src/services/api.js', content);
console.log('Patched api.js');
