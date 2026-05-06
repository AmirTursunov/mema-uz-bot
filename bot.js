import TelegramBot from 'node-telegram-bot-api';

// Bot tokeningiz
const token = '8693140460:AAGYeA4-ZWJeUNSzdtW-56clrJ42Hgmi00k';
const bot = new TelegramBot(token, {polling: true});

// Mini App havolasi
const webAppUrl = 'https://mema-uz.vercel.app'; 

// Global Menu tugmasini sozlash (barcha foydalanuvchilar uchun)
const setMenu = async () => {
  try {
    await bot.setChatMenuButton({
      menu_button: {
        type: "web_app",
        text: "MEMA UZ 👕",
        web_app: { url: webAppUrl }
      }
    });
    console.log("Global Menu tugmasi o'rnatildi.");
  } catch (e) {
    console.error("Menu button error:", e);
  }
};

setMenu();

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if(text === '/start') {
    await bot.sendMessage(chatId, "Assalomu alaykum! MEMA UZ — Futbolkalarni o'zingiz dizayn qiladigan botimizga xush kelibsiz! 🚀\n\nFutbolka dizayn qilishni boshlash uchun pastdagi tugmani bosing 👇", {
      reply_markup: {
        inline_keyboard: [
          [{text: 'Dizayn qilishni boshlash 🎨', web_app: {url: webAppUrl}}]
        ],
        keyboard: [
          [{text: 'MEMA UZ 👕', web_app: {url: webAppUrl}}]
        ],
        resize_keyboard: true
      }
    });
  }
});

console.log("MEMA UZ Boti ishga tushdi...");
