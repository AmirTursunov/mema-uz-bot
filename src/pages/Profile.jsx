import React from 'react';
import { User, Phone, MapPin, Settings, ChevronRight, LogOut } from 'lucide-react';
import { useOrder } from '../context/OrderContext';

const Profile = () => {
  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  const { order } = useOrder();
  const info = order.customerInfo;

  return (
    <div className="profile-page">
      <style>{`
        .profile-page { padding-bottom: 30px; animation: fadeInUp 0.4s var(--ease-out); }
        .profile-header {
          display: flex; flex-direction: column; align-items: center;
          padding: 30px 20px; background: var(--bg-card);
          border-bottom: 1px solid var(--border-subtle);
          margin: -20px -20px 20px -20px;
        }
        .profile-avatar {
          width: 80px; height: 80px; border-radius: 50%;
          background: var(--gradient-primary);
          display: flex; align-items: center; justify-content: center;
          color: white; font-size: 32px; font-weight: 700;
          margin-bottom: 16px; box-shadow: 0 8px 20px rgba(99,102,241,0.3);
        }
        .profile-avatar img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
        .profile-name { font-size: 20px; font-weight: 800; font-family: var(--font-display); margin-bottom: 4px; }
        .profile-username { font-size: 14px; color: var(--accent-primary); font-weight: 600; }
        
        .profile-section { margin-bottom: 24px; }
        .profile-section-title {
          font-size: 13px; font-weight: 700; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;
          padding: 0 4px;
        }
        
        .profile-menu {
          background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg); overflow: hidden;
        }
        .profile-menu-item {
          display: flex; align-items: center; gap: 12px;
          padding: 16px; border-bottom: 1px solid var(--border-subtle);
        }
        .profile-menu-item:last-child { border-bottom: none; }
        .profile-menu-icon {
          width: 32px; height: 32px; border-radius: 8px;
          background: rgba(99,102,241,0.1); color: var(--accent-primary);
          display: flex; align-items: center; justify-content: center;
        }
        .profile-menu-content { flex: 1; }
        .profile-menu-label { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
        .profile-menu-value { font-size: 13px; color: var(--text-secondary); }
        .profile-menu-arrow { color: var(--text-muted); }
      `}</style>

      <div className="profile-header">
        <div className="profile-avatar">
          {telegramUser?.photo_url ? (
            <img src={telegramUser.photo_url} alt="Profile" />
          ) : (
            telegramUser?.first_name?.charAt(0) || <User size={40} />
          )}
        </div>
        <div className="profile-name">{telegramUser?.first_name} {telegramUser?.last_name || ''}</div>
        <div className="profile-username">
          {telegramUser?.username ? `@${telegramUser.username}` : 'Mijoz'}
        </div>
      </div>

      <div className="profile-section">
        <div className="profile-section-title">Saqlangan ma'lumotlar</div>
        <div className="profile-menu">
          <div className="profile-menu-item">
            <div className="profile-menu-icon"><Phone size={16} /></div>
            <div className="profile-menu-content">
              <div className="profile-menu-label">Telefon raqam</div>
              <div className="profile-menu-value">{info.phone || "Kiritilmagan"}</div>
            </div>
            <ChevronRight className="profile-menu-arrow" size={16} />
          </div>
          <div className="profile-menu-item">
            <div className="profile-menu-icon"><MapPin size={16} /></div>
            <div className="profile-menu-content">
              <div className="profile-menu-label">Manzil</div>
              <div className="profile-menu-value">
                {info.address || "Kiritilmagan"}
              </div>
            </div>
            <ChevronRight className="profile-menu-arrow" size={16} />
          </div>
        </div>
      </div>

      <div className="profile-section">
        <div className="profile-section-title">Ilova</div>
        <div className="profile-menu">
          <div className="profile-menu-item">
            <div className="profile-menu-icon" style={{background: 'rgba(100,116,139,0.1)', color: 'var(--text-secondary)'}}>
              <Settings size={16} />
            </div>
            <div className="profile-menu-content">
              <div className="profile-menu-label">Sozlamalar</div>
            </div>
            <ChevronRight className="profile-menu-arrow" size={16} />
          </div>
        </div>
      </div>

    </div>
  );
};

export default Profile;
