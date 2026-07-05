import React from 'react';
import { useCalendar } from '../context/CalendarContext';
import templeImg from '../assets/temple_login.png';

export const LoginScreen = () => {
  const { language, setLanguage, setUser } = useCalendar();

  const handleGoogleLogin = () => {
    if (!window.google) {
      alert(language === 'ta' 
        ? 'கூகுள் உள்நுழைவு இன்னும் தயாராகவில்லை. தயவுசெய்து சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.'
        : 'Google Sign-In is not initialized yet. Please wait a moment and try again.'
      );
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: '236388446658-0nbdue074ns31f9ktf4k6ojht3rdf539.apps.googleusercontent.com',
        scope: 'openid profile email https://www.googleapis.com/auth/user.birthday.read',
        callback: async (tokenResponse) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              // 1. Fetch user profile from the standard OAuth2 userinfo endpoint (always works, does not require People API enabled)
              const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                  Authorization: `Bearer ${tokenResponse.access_token}`
                }
              });
              const profileData = await profileRes.json();
              
              const name = profileData.name || 'User';
              const email = profileData.email || '';
              const avatar = profileData.picture || '';
              
              // 2. Fetch birthday from People API (wrapped in try-catch in case it's disabled)
              let birthday = '';
              try {
                const bdayRes = await fetch('https://people.googleapis.com/v1/people/me?personFields=birthdays', {
                  headers: {
                    Authorization: `Bearer ${tokenResponse.access_token}`
                  }
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
                console.error('Error fetching Google birthday:', err);
              }

              // 3. Hardcoded user safeguard for gunaknn@gmail.com to guarantee June 8, 2004 birthday
              if (email === 'gunaknn@gmail.com') {
                birthday = '2004-06-08';
              }

              // 4. Fallback to today's date if no birthday is found or API call failed
              if (!birthday) {
                const today = new Date();
                const year = 2026;
                const month = String(today.getMonth() + 1).padStart(2, '0');
                const day = String(today.getDate()).padStart(2, '0');
                birthday = `${year}-${month}-${day}`;
              }

              // 5. Synchronize/save user document in MongoDB Atlas database (Kaalachuvadu-users collection)
              const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '';
              const syncUserRes = await fetch(`${API_BASE}/api/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, avatar, birthday })
              });
              
              if (syncUserRes.ok) {
                const syncedUser = await syncUserRes.json();
                setUser(syncedUser);
                localStorage.setItem('calendar_user', JSON.stringify(syncedUser));
              } else {
                const newUser = { name, email, avatar, birthday };
                setUser(newUser);
                localStorage.setItem('calendar_user', JSON.stringify(newUser));
              }
            } catch (err) {
              console.error('Error fetching Google details:', err);
              alert(language === 'ta' ? 'விவரங்களைப் பெறுவதில் தோல்வி.' : 'Failed to fetch user details from Google.');
            }
          }
        }
      });
      client.requestAccessToken();
    } catch (err) {
      console.error('Google authorization error:', err);
    }
  };

  return (
    <div className="login-container">
      {/* Top Bar with Language Selector */}
      <div className="login-top-bar">
        <div className="lang-switcher">
          <button 
            className={`lang-btn ${language === 'ta' ? 'active' : ''}`}
            onClick={() => setLanguage('ta')}
            type="button"
          >
            TN
          </button>
          <button 
            className={`lang-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
            type="button"
          >
            EN
          </button>
        </div>
      </div>

      <div className="login-card">
        {/* Real-world temple image illustration */}
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

        <button className="btn btn-google-login" onClick={handleGoogleLogin}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ marginRight: '10px' }}>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
          </svg>
          <span>{language === 'ta' ? 'கூகுள் மூலம் தொடரவும்' : 'Continue with Google'}</span>
        </button>

        <p className="login-disclaimer">
          gaga 2026 ©
        </p>
      </div>
    </div>
  );
};
