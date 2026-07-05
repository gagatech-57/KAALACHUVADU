import React from 'react';
import { CalendarProvider, useCalendar } from './context/CalendarContext';
import { Sidebar } from './components/Sidebar';
import { CalendarHeader } from './components/CalendarHeader';
import { MonthView } from './components/MonthView';
import { WeekView } from './components/WeekView';
import { DayView } from './components/DayView';
import { AgendaView } from './components/AgendaView';
import { EventModal } from './components/EventModal';
import { LoginScreen } from './components/LoginScreen';

const SplashScreen: React.FC = () => {
  return (
    <div className="splash-container">
      <div className="splash-content">
        <svg className="splash-wheel" width="80" height="80" viewBox="0 0 100 100" fill="none" stroke="#3c2415" strokeWidth="2.5">
          <circle cx="50" cy="50" r="40" strokeWidth="1.5" strokeDasharray="3 2" />
          <circle cx="50" cy="50" r="30" />
          <circle cx="50" cy="50" r="8" fill="#3c2415" />
          <path d="M50 10 L50 90 M10 50 L90 50 M22 22 L78 78 M22 78 L78 22" />
          <polygon points="50,5 53,20 47,20" fill="#3c2415" />
          <polygon points="50,95 53,80 47,80" fill="#3c2415" />
          <polygon points="95,50 80,53 80,47" fill="#3c2415" />
          <polygon points="5,50 20,53 20,47" fill="#3c2415" />
        </svg>
        <h1 className="splash-brand-tamil">காலச்சுவடு</h1>
        <h2 className="splash-brand-english">KAALACHUVADU</h2>
      </div>
    </div>
  );
};

const CalendarAppContent: React.FC = () => {
  const { currentView, language, user } = useCalendar();
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const renderActiveView = () => {
    switch (currentView) {
      case 'month':
        return <MonthView />;
      case 'week':
        return <WeekView />;
      case 'day':
        return <DayView />;
      case 'agenda':
        return <AgendaView />;
      default:
        return <MonthView />;
    }
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <CalendarHeader />
        
        {/* Top Right Leaf Scroll Ornament */}
        <div className="ornament-top-right" aria-hidden="true">
          <svg width="120" height="80" viewBox="0 0 120 80" fill="none" stroke="#d0c098" strokeWidth="1.5" strokeLinecap="round">
            <path d="M10 70 C 40 60, 80 40, 110 10" />
            <path d="M110 10 Q 95 18, 90 25 Q 92 12, 110 10" fill="#fdfaf2" />
            <path d="M95 23 C 85 30, 70 38, 65 42" />
            <path d="M65 42 Q 52 48, 48 55 Q 52 42, 65 42" fill="#fdfaf2" />
            <path d="M85 30 Q 75 35, 72 40 Q 74 30, 85 30" fill="#fdfaf2" />
            <path d="M105 13 Q 95 18, 92 23 Q 95 10, 105 13" fill="#fdfaf2" />
            <path d="M75 38 Q 63 43, 60 48 Q 63 35, 75 38" fill="#fdfaf2" />
            <path d="M50 50 Q 38 55, 34 60 Q 38 48, 50 50" fill="#fdfaf2" />
          </svg>
        </div>

        <div className="calendar-view-wrapper">
          {renderActiveView()}
        </div>

        {/* Bottom Right Temple & Coconut Trees Ornament */}
        <div className="ornament-bottom-right" aria-hidden="true">
          <svg width="160" height="140" viewBox="0 0 160 140" fill="none" stroke="#d0c098" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M90 130 L150 130" />
            <path d="M100 115 L140 115 L135 130 L105 130 Z" />
            <path d="M105 100 L135 100 L130 115 L110 115 Z" />
            <path d="M110 85 L130 85 L125 100 L115 100 Z" />
            <path d="M113 70 L127 70 L124 85 L116 85 Z" />
            <path d="M116 55 L124 55 L122 70 L118 70 Z" />
            <path d="M118 40 L122 40 L121 55 L119 55 Z" />
            <path d="M120 25 L120 40" />
            <path d="M100 130 L100 115 M110 115 L110 100 M115 100 L115 85 M117 85 L117 70 M119 70 L119 55 M140 130 L140 115 M130 115 L130 100 M125 100 L125 85 M123 85 L123 70 M121 70 L121 55" />
            <path d="M120 130 L120 120 M120 115 L120 107 M120 100 L120 92 M120 85 L120 77" />
            <path d="M115 130 A5 5 0 0 1 125 130" />
            <path d="M40 130 Q 45 90, 20 70" strokeWidth="2" />
            <path d="M20 70 Q 10 65, 0 75" />
            <path d="M20 70 Q 15 55, 5 50" />
            <path d="M20 70 Q 25 50, 20 40" />
            <path d="M20 70 Q 35 55, 38 65" />
            <path d="M20 70 Q 33 73, 40 80" />
            <path d="M60 130 Q 55 100, 45 85" strokeWidth="1.8" />
            <path d="M45 85 Q 35 80, 28 88" />
            <path d="M45 85 Q 40 70, 35 65" />
            <path d="M45 85 Q 52 70, 50 60" />
            <path d="M45 85 Q 58 75, 58 85" />
          </svg>
        </div>

        <div className="heritage-footer">
          <span className="heritage-quote">
            {language === 'ta' ? '“காலம் அறிந்து செயல் படுவதே ஞானம்.”' : '“Wisdom lies in acting at the right time.”'}
          </span>
        </div>
      </main>
      <EventModal />
    </div>
  );
};

function App() {
  return (
    <CalendarProvider>
      <CalendarAppContent />
    </CalendarProvider>
  );
}

export default App;
