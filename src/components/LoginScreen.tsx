import React from 'react';
import { useCalendar } from '../context/CalendarContext';

export const LoginScreen: React.FC = () => {
  const { language, setLanguage, setUser, addEvent } = useCalendar();

  const handleGoogleLogin = () => {
    if (!(window as any).google) {
      alert(language === 'ta' 
        ? 'கூகுள் உள்நுழைவு இன்னும் தயாராகவில்லை. தயவுசெய்து சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.'
        : 'Google Sign-In is not initialized yet. Please wait a moment and try again.'
      );
      return;
    }

    try {
      const client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: '236388446658-0nbdue074ns31f9ktf4k6ojht3rdf539.apps.googleusercontent.com',
        scope: 'openid profile email https://www.googleapis.com/auth/user.birthday.read',
        callback: async (tokenResponse: any) => {
          if (tokenResponse && tokenResponse.access_token) {
            try {
              // Fetch user profile and birthday details
              const res = await fetch('https://people.googleapis.com/v1/people/me?personFields=names,photos,emailAddresses,birthdays', {
                headers: {
                  Authorization: `Bearer ${tokenResponse.access_token}`
                }
              });
              const data = await res.json();
              
              const name = data.names?.[0]?.displayName || 'User';
              const email = data.emailAddresses?.[0]?.value || '';
              const avatar = data.photos?.[0]?.url || '';
              
              let birthday = '';
              const birthdays = data.birthdays || [];
              const bday = birthdays.find((b: any) => b.date && b.date.month && b.date.day);
              if (bday) {
                const year = bday.date.year || 2026;
                const month = String(bday.date.month).padStart(2, '0');
                const day = String(bday.date.day).padStart(2, '0');
                birthday = `${year}-${month}-${day}`;
              }

              const newUser = { name, email, avatar, birthday };
              setUser(newUser);
              localStorage.setItem('calendar_user', JSON.stringify(newUser));

              if (birthday) {
                const bdayDate2026 = `2026-${String(bday.date.month).padStart(2, '0')}-${String(bday.date.day).padStart(2, '0')}`;
                addEvent({
                  title: language === 'ta' ? 'பிறந்தநாள் வாழ்த்துகள்...!' : 'Happy Birthday...!',
                  description: language === 'ta' ? `${name}-ன் பிறந்தநாள்!` : `${name}'s Birthday!`,
                  startDate: bdayDate2026,
                  endDate: bdayDate2026,
                  allDay: true,
                  category: 'personal',
                  color: '#e06666',
                  location: 'Google'
                });
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
        {/* Intricate Gopuram Tower illustration */}
        <div className="login-illustration">
          <svg className="login-gopuram" width="180" height="200" viewBox="0 0 120 130" fill="none" stroke="#3c2415" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 120 L110 120 M15 110 L105 110 M20 98 L100 98 M25 86 L95 86 M30 74 L90 74 M35 62 L85 62 M40 50 L80 50 M45 38 L75 38 M50 26 L70 26 M55 12 L65 12 M60 2 L60 12" />
            <path d="M15 110 L20 120 M105 110 L100 120 M20 98 L25 110 M100 98 L95 110 M25 86 L30 98 M95 86 L90 98 M30 74 L35 86 M90 74 L85 86 M35 62 L40 74 M85 62 L80 74 M40 50 L45 62 M80 50 L75 62 M45 38 L50 50 M75 38 L70 50 M50 26 L55 38 M70 26 L65 38 M55 12 L57 26 M65 12 L63 26" />
            <path d="M50 120 L50 110 A10 10 0 0 1 70 110 L70 120" strokeWidth="2" />
            <path d="M30 110 L30 120 M90 110 L90 120 M35 98 L35 110 M85 98 L85 110 M40 86 L40 98 M80 86 L80 98 M45 74 L45 86 M75 74 L75 86 M50 62 L50 74 M70 62 L70 74 M55 50 L55 62 M65 50 L65 62 M58 38 L58 50 M62 38 L62 50" />
            <circle cx="57" cy="6" r="2" fill="#3c2415" />
            <circle cx="60" cy="5" r="2.5" fill="#3c2415" />
            <circle cx="63" cy="6" r="2" fill="#3c2415" />
          </svg>
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
