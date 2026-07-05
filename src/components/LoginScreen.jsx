import React from 'react';
import { useCalendar } from '../context/CalendarContext';
import templeImg from '../assets/temple_login.png';

export const LoginScreen = () => {
  const { language, setLanguage, setUser } = useCalendar();

  const handleGoogleLogin = () => {
    if (!window.google) {
      alert(language === 'ta'
        ? 'கூகுள் உள்நுழைவு இன்னும் தயாராகவில்லை. சிறிது நேரம் கழித்து முயற்சிக்கவும்.'
        : 'Google Sign-In is not ready yet. Please try again in a moment.');
      return;
    }
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: '236388446658-0nbdue074ns31f9ktf4k6ojht3rdf539.apps.googleusercontent.com',
        scope: 'openid profile email https://www.googleapis.com/auth/user.birthday.read',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              const profileData = await profileRes.json();
              const name = profileData.name || 'User';
              const email = profileData.email || '';
              const avatar = profileData.picture || '';

              let birthday = '';
              try {
                const bdayRes = await fetch('https://people.googleapis.com/v1/people/me?personFields=birthdays', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                if (bdayRes.ok) {
                  const bdayData = await bdayRes.json();
                  const birthdays = bdayData.birthdays || [];
                  const bday = birthdays.find((b) => b.date && b.date.month && b.date.day);
                  if (bday) {
                    const year = bday.date.year || 2026;
                    const month = String(bday.date.month).padStart(2, '0');
                    const day = String(bday.date.day).padStart(2, '0');
                    birthday = `${year}-${month}-${day}`;
                  }
                }
              } catch (err) {
                console.error('Birthday fetch error:', err);
              }

              if (email === 'gunaknn@gmail.com') birthday = '2004-06-08';
              if (!birthday) {
                const t = new Date();
                birthday = `2026-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
              }

              const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000' : '';
              const syncRes = await fetch(`${API_BASE}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, avatar, birthday })
              });
              const userData = syncRes.ok ? await syncRes.json() : { name, email, avatar, birthday };
              setUser(userData);
              localStorage.setItem('calendar_user', JSON.stringify(userData));
            } catch (err) {
              console.error('Login error:', err);
              alert(language === 'ta' ? 'விவரங்களைப் பெறுவதில் தோல்வி.' : 'Failed to fetch user details.');
            }
          }
        }
      });
      client.requestAccessToken();
    } catch (err) {
      console.error('Google auth error:', err);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        {/* Language switcher top-right inside card */}
        <div className="login-lang-row">
          <div className="lang-switcher">
            <button className={`lang-btn ${language === 'ta' ? 'active' : ''}`} onClick={() => setLanguage('ta')}>TN</button>
            <button className={`lang-btn ${language === 'en' ? 'active' : ''}`} onClick={() => setLanguage('en')}>EN</button>
          </div>
        </div>

        {/* Temple image */}
        <div className="login-illustration">
          <img src={templeImg} alt="Tamil Nadu Temple Gopuram" className="login-temple-image" />
        </div>

        <h1 className="login-brand">
          {language === 'ta' ? 'காலச்சுவடு' : 'KAALACHUVADU'}
        </h1>

        <p className="login-subtitle">
          {language === 'ta'
            ? 'காலத்தைக் கணித்து வாழ்வை நெறிப்படுத்தும் பாரம்பரிய நாட்காட்டி'
            : 'Traditional Heritage Calendar to Guide Your Footprints of Time'}
        </p>

        <button className="btn-google-login" onClick={handleGoogleLogin}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span>{language === 'ta' ? 'கூகுள் மூலம் தொடரவும்' : 'Continue with Google'}</span>
        </button>

        <p className="login-disclaimer">gaga 2026 ©</p>
      </div>

      <style>{`
        /* ── Full-screen centered layout ── */
        .login-screen {
          position: fixed;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #ecdcb9;
          background-image:
            url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.15' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.015 0'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.7'/%3E%3C/svg%3E"),
            radial-gradient(ellipse at 60% 30%, #fdfaf2 0%, #ecdcb9 70%);
          background-blend-mode: overlay;
          padding: 1rem;
          z-index: 9999;
          overflow-y: auto;
        }

        /* ── Card ── */
        .login-card {
          background: #fdfaf2;
          border: 1px solid #d8c8a8;
          box-shadow:
            0 12px 40px rgba(60, 36, 21, 0.10),
            inset 0 0 60px rgba(216, 200, 168, 0.18);
          border-radius: 20px;
          width: 100%;
          max-width: 420px;
          padding: 2rem 2rem 1.8rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          gap: 0;
        }

        /* Language row */
        .login-lang-row {
          width: 100%;
          display: flex;
          justify-content: flex-end;
          margin-bottom: 1.2rem;
        }

        /* Temple image */
        .login-illustration {
          margin-bottom: 1.4rem;
        }
        .login-temple-image {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #3c2415;
          box-shadow: 0 4px 16px rgba(60, 36, 21, 0.18);
          display: block;
        }

        /* Brand */
        .login-brand {
          font-family: 'Arima Madurai', serif;
          font-size: 2.2rem;
          font-weight: 800;
          color: #3c2415;
          margin: 0 0 0.6rem;
          text-align: center;
          line-height: 1.15;
        }

        /* Subtitle */
        .login-subtitle {
          font-family: 'Mukta Malar', sans-serif;
          font-size: 0.92rem;
          color: #5c4d37;
          line-height: 1.55;
          text-align: center;
          margin-bottom: 1.8rem;
          max-width: 300px;
        }

        /* Google button */
        .btn-google-login {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 0.85rem 1.2rem;
          background: #fdfaf2;
          border: 1.5px solid #3c2415;
          border-radius: 50px;
          color: #3c2415;
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.18s ease;
          box-shadow: 0 2px 6px rgba(60, 36, 21, 0.07);
        }
        .btn-google-login:hover {
          background: #3c2415;
          color: #fdfaf2;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(60, 36, 21, 0.14);
        }
        .btn-google-login:active { transform: translateY(0); }

        /* Disclaimer */
        .login-disclaimer {
          font-family: 'Playfair Display', serif;
          font-size: 0.85rem;
          font-weight: 700;
          color: #3c2415;
          margin-top: 1.4rem;
          letter-spacing: 0.04em;
          opacity: 0.7;
          text-align: center;
        }

        /* ── Mobile tweaks ── */
        @media (max-width: 480px) {
          .login-card {
            padding: 1.6rem 1.4rem 1.5rem;
            border-radius: 18px;
          }
          .login-temple-image {
            width: 110px;
            height: 110px;
          }
          .login-brand { font-size: 1.9rem; }
          .login-subtitle { font-size: 0.86rem; }
          .btn-google-login { font-size: 0.95rem; padding: 0.78rem 1rem; }
        }

        /* ── Very small phones ── */
        @media (max-width: 360px) {
          .login-temple-image { width: 90px; height: 90px; }
          .login-brand { font-size: 1.65rem; }
        }
      `}</style>
    </div>
  );
};
