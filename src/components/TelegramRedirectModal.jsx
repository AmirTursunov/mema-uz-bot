import React, { useState, useEffect } from 'react';

const TelegramRedirectModal = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Tezgina tekshirish
    const checkTelegram = () => {
      const tg = window.Telegram?.WebApp;
      // Agar platform 'unknown' bo'lmasa yoki initData mavjud bo'lsa, demak Telegramdamiz
      const isTelegram = tg && tg.platform && tg.platform !== 'unknown';
      
      if (!isTelegram) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // SDK yuklanishi uchun bir oz kutamiz
    const timer = setTimeout(checkTelegram, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.9)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.3s ease-out',
    }}>
      <div style={{
        background: 'rgba(18,18,32,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '24px',
        padding: '40px 30px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
      }}>
        <div style={{
          width: '80px', height: '80px',
          background: 'linear-gradient(135deg, #6366f1, #a855f7)',
          borderRadius: '50%',
          margin: '0 auto 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 10px 20px rgba(99,102,241,0.3)',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.52-.46-.01-1.33-.26-1.98-.48-.8-.27-1.43-.42-1.37-.89.03-.25.38-.51 1.03-.78 4.04-1.76 6.74-2.92 8.09-3.48 3.85-1.6 4.64-1.88 5.17-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.13-.03.18z"/>
          </svg>
        </div>
        <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px', color: '#fff', fontFamily: 'var(--font-display)' }}>
          Brand
        </h3>
        <p style={{ fontSize: '16px', lineHeight: 1.5, color: 'rgba(255,255,255,0.7)', marginBottom: '30px' }}>
          Ushbu ilova Telegram ichida ishlashga mo'ljallangan. Barcha imkoniyatlardan foydalanish uchun botimizga kiring.
        </p>
        <a
          href="https://t.me/mema_uz_bot"
          style={{
            display: 'block', width: '100%', padding: '16px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            color: '#fff', textDecoration: 'none', borderRadius: '14px',
            fontWeight: 600, fontSize: '16px', textAlign: 'center',
            boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
          }}
        >
          Telegram Botga o'tish
        </a>
      </div>
    </div>
  );
};

export default TelegramRedirectModal;
