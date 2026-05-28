import fs from 'fs';

const files = [
  'src/components/Header.jsx',
  'src/components/TelegramRedirectModal.jsx',
  'src/pages/Order.jsx',
  'index.html',
  'bot.js'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/MEMA UZ OFFICIAL/g, 'Brand');
    content = content.replace(/MEMA UZ/g, 'Brand');
    content = content.replace(/mema uz/gi, 'Brand');
    fs.writeFileSync(file, content);
    console.log('Patched ' + file);
  }
}
