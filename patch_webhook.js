import fs from 'fs';

let content = fs.readFileSync('api/webhook.js', 'utf-8');

// Replace MEMA UZ
content = content.replace(/MEMA UZ/g, 'Brand');
content = content.replace(/mema uz/gi, 'Brand');

// Fix accept editMessageCaption -> editMessageText
content = content.replace(/editMessageCaption/g, 'editMessageText');
content = content.replace(/caption: callbackQuery\.message\.caption \+ "\\n\\n✅ <b>QABUL QILINDI<\/b>",/g, 'text: callbackQuery.message.text + "\\n\\n✅ QABUL QILINDI",');

// Wait, what about reject?
// Right now reject doesn't edit the message. It just prompts for a reason.
// The user says "qabul qilindi yoki rad etildi deb chiqishi kerak buyurtmada". So for reject, it should also update the message.
const rejectRegex = /text: \`❌ <b>Rad etish sababini yozing:<\/b>\\n\(Mijozga yuboriladi\)\\n\\nID: <code>\$\{orderId\}<\/code>\\nUSER: <code>\$\{userId\}<\/code>\`,\\n            parse_mode: 'HTML',\\n            reply_markup: \{ force_reply: true \}/;

// We should also edit the message text for reject to remove the buttons and add ❌ RAD ETILDI
const oldRejectPrompt = `        await fetch(\`https://api.telegram.org/bot\$\{BOT_TOKEN\}/sendMessage\`, {`;
const newRejectPrompt = `        await fetch(\`https://api.telegram.org/bot\$\{BOT_TOKEN\}/editMessageText\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: callbackQuery.message.chat.id,
            message_id: callbackQuery.message.message_id,
            text: callbackQuery.message.text + "\\n\\n❌ RAD ETILDI"
          })
        }).catch(e => console.error('Error editing message text (reject):', e));

        await fetch(\`https://api.telegram.org/bot\$\{BOT_TOKEN\}/sendMessage\`, {`;

content = content.replace(oldRejectPrompt, newRejectPrompt);

fs.writeFileSync('api/webhook.js', content);
console.log('Patched webhook.js');
