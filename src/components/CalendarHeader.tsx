import React from 'react';
import { useCalendar } from '../context/CalendarContext';
import type { CalendarView } from '../types';

export const CalendarHeader: React.FC = () => {
  const {
    currentDate,
    setCurrentDate,
    currentView,
    setCurrentView,
    isSidebarOpen,
    toggleSidebar,
    navigatePrev,
    navigateNext,
    language,
    setLanguage,
  } = useCalendar();

  // Navigation handlers
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Header Title generation
  const getHeaderTitle = (): string => {
    const locale = language === 'ta' ? 'ta-IN' : 'en-US';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    
    if (currentView === 'month' || currentView === 'agenda') {
      return currentDate.toLocaleDateString(locale, options);
    }
    
    if (currentView === 'day') {
      return currentDate.toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    if (currentView === 'week') {
      const start = new Date(currentDate);
      const day = start.getDay();
      start.setDate(start.getDate() - day); // Sunday of the week

      const end = new Date(start);
      end.setDate(end.getDate() + 6); // Saturday of the week

      const sameMonth = start.getMonth() === end.getMonth();
      const sameYear = start.getFullYear() === end.getFullYear();

      const startMonthStr = start.toLocaleDateString(locale, { month: 'short' });
      const endMonthStr = end.toLocaleDateString(locale, { month: 'short' });
      const yearStr = start.getFullYear();

      if (sameYear) {
        if (sameMonth) {
          return `${startMonthStr} ${start.getDate()} – ${end.getDate()}, ${yearStr}`;
        }
        return `${startMonthStr} ${start.getDate()} – ${endMonthStr} ${end.getDate()}, ${yearStr}`;
      }
      return `${startMonthStr} ${start.getDate()}, ${start.getFullYear()} – ${endMonthStr} ${end.getDate()}, ${end.getFullYear()}`;
    }

    return '';
  };

  const views: { id: CalendarView; label: string }[] = [
    { id: 'month', label: language === 'ta' ? 'மாதம்' : 'Month' },
    { id: 'week', label: language === 'ta' ? 'வாரம்' : 'Week' },
    { id: 'day', label: language === 'ta' ? 'நாள்' : 'Day' },
    { id: 'agenda', label: language === 'ta' ? 'அஜெண்டா' : 'Agenda' },
  ];

  return (
    <header className="calendar-header">
      <div className="header-left">
        <button
          className="btn btn-icon btn-text sidebar-toggle"
          onClick={toggleSidebar}
          title={isSidebarOpen ? (language === 'ta' ? 'பக்கப்பட்டையை மறைக்கவும்' : 'Collapse Sidebar') : (language === 'ta' ? 'பக்கப்பட்டையை காட்டவும்' : 'Expand Sidebar')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <h1 className="header-title">{getHeaderTitle()}</h1>

        <div className="nav-controls">
          <div className="lang-switcher" title={language === 'ta' ? "மொழி மாற்றவும்" : "Change language"}>
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

          <button className="btn btn-today" onClick={handleToday} title={language === 'ta' ? "இன்றைய தேதிக்கு செல்" : "Go to today"}>
            {language === 'ta' ? "இன்று" : "Today"}
          </button>
          <div className="nav-arrows">
            <button className="btn btn-icon btn-nav-arrow" onClick={navigatePrev} title={language === 'ta' ? "முந்தைய" : "Previous"}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button className="btn btn-icon btn-nav-arrow" onClick={navigateNext} title={language === 'ta' ? "அடுத்த" : "Next"}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="view-tabs">
          {views.map(v => (
            <button
              key={v.id}
              onClick={() => setCurrentView(v.id)}
              className={`view-tab ${currentView === v.id ? 'active' : ''}`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 1.2rem;
          height: 60px;
          border-bottom: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
          flex-shrink: 0;
          z-index: 5;
        }
        .header-left, .header-right {
          display: flex;
          align-items: center;
          gap: 1.2rem;
        }
        .header-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary);
          min-width: 180px;
          user-select: none;
        }
        .nav-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-today {
          font-size: 0.85rem;
          padding: 0.5rem 1rem;
        }
        .nav-arrows {
          display: flex;
          gap: 4px;
        }
        .btn-nav-arrow {
          width: 32px;
          height: 32px;
        }
        .view-tabs {
          display: flex;
          background-color: var(--bg-primary);
          padding: 4px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }
        .view-tab {
          border: none;
          background: transparent;
          padding: 0.4rem 0.9rem;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.85rem;
          font-weight: 550;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .view-tab:hover {
          color: var(--text-primary);
        }
        .view-tab.active {
          background-color: var(--bg-secondary);
          color: var(--accent-color);
          box-shadow: var(--shadow-sm);
        }
        .theme-toggle {
          width: 38px;
          height: 38px;
        }
        @media (max-width: 768px) {
          .calendar-header {
            padding: 0 0.8rem;
          }
          .header-title {
            font-size: 1.05rem;
            min-width: unset;
          }
          .nav-controls {
            gap: 4px;
          }
          .btn-today {
            display: none;
          }
          .view-tabs {
            display: none; /* In mobile, view transitions can be moved to dropdowns or compact views, or just standard tabs */
          }
        }
      `}</style>
    </header>
  );
};
