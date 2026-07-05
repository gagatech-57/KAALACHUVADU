import React from 'react';
import { useCalendar } from '../context/CalendarContext';

export const CalendarHeader = () => {
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

  const handleToday = () => setCurrentDate(new Date());

  const getHeaderTitle = () => {
    const locale = language === 'ta' ? 'ta-IN' : 'en-US';
    if (currentView === 'month' || currentView === 'agenda') {
      return currentDate.toLocaleDateString(locale, { year: 'numeric', month: 'long' });
    }
    if (currentView === 'day') {
      return currentDate.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    if (currentView === 'week') {
      const start = new Date(currentDate);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      const sm = start.toLocaleDateString(locale, { month: 'short' });
      const em = end.toLocaleDateString(locale, { month: 'short' });
      if (start.getFullYear() === end.getFullYear()) {
        if (start.getMonth() === end.getMonth()) return `${sm} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
        return `${sm} ${start.getDate()} – ${em} ${end.getDate()}, ${start.getFullYear()}`;
      }
      return `${sm} ${start.getDate()}, ${start.getFullYear()} – ${em} ${end.getDate()}, ${end.getFullYear()}`;
    }
    return '';
  };

  const getShortTitle = () => {
    const locale = language === 'ta' ? 'ta-IN' : 'en-US';
    if (currentView === 'day') {
      return currentDate.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
    }
    return currentDate.toLocaleDateString(locale, { year: 'numeric', month: 'short' });
  };

  const views = [
    { id: 'month', label: language === 'ta' ? 'மாதம்' : 'Month' },
    { id: 'week', label: language === 'ta' ? 'வாரம்' : 'Week' },
    { id: 'day', label: language === 'ta' ? 'நாள்' : 'Day' },
    { id: 'agenda', label: language === 'ta' ? 'அஜெண்டா' : 'Agenda' },
  ];

  return (
    <header className="calendar-header">
      {/* LEFT: hamburger + title + nav */}
      <div className="header-left">
        <button
          className="btn btn-icon btn-text sidebar-toggle"
          onClick={toggleSidebar}
          title={isSidebarOpen ? 'Collapse' : 'Expand'}
          aria-label="Toggle sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <h1 className="header-title">
          <span className="title-full">{getHeaderTitle()}</span>
          <span className="title-short">{getShortTitle()}</span>
        </h1>

        <div className="nav-controls">
          <div className="lang-switcher">
            <button className={`lang-btn ${language === 'ta' ? 'active' : ''}`} onClick={() => setLanguage('ta')}>TN</button>
            <button className={`lang-btn ${language === 'en' ? 'active' : ''}`} onClick={() => setLanguage('en')}>EN</button>
          </div>
          <button className="btn btn-today" onClick={handleToday}>
            {language === 'ta' ? 'இன்று' : 'Today'}
          </button>
          <div className="nav-arrows">
            <button className="btn btn-icon btn-nav-arrow" onClick={navigatePrev} aria-label="Previous">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button className="btn btn-icon btn-nav-arrow" onClick={navigateNext} aria-label="Next">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: view tabs (desktop) */}
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

      {/* BOTTOM BAR: view tabs on mobile */}
      <div className="mobile-view-tabs">
        {views.map(v => (
          <button
            key={v.id}
            onClick={() => setCurrentView(v.id)}
            className={`mobile-view-tab ${currentView === v.id ? 'active' : ''}`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <style>{`
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 1.2rem;
          height: 56px;
          border-bottom: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
          flex-shrink: 0;
          z-index: 20;
          position: relative;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
          min-width: 0;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-shrink: 0;
        }
        .header-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          user-select: none;
          flex: 1;
          min-width: 0;
        }
        .title-short { display: none; }
        .title-full { display: inline; }
        .nav-controls {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
        }
        .btn-today {
          font-size: 0.82rem;
          padding: 0.4rem 0.85rem;
        }
        .nav-arrows {
          display: flex;
          gap: 2px;
        }
        .btn-nav-arrow {
          width: 30px;
          height: 30px;
        }
        .view-tabs {
          display: flex;
          background-color: var(--bg-primary);
          padding: 3px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }
        .view-tab {
          border: none;
          background: transparent;
          padding: 0.35rem 0.85rem;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }
        .view-tab:hover { color: var(--text-primary); }
        .view-tab.active {
          background-color: var(--bg-secondary);
          color: var(--accent-color);
          box-shadow: var(--shadow-sm);
        }

        /* Mobile bottom tabs bar — hidden on desktop */
        .mobile-view-tabs { display: none; }

        /* ── Tablet (≤900px) ── */
        @media (max-width: 900px) {
          .header-title { font-size: 1rem; }
          .view-tab { padding: 0.3rem 0.65rem; font-size: 0.78rem; }
        }

        /* ── Mobile (≤640px) ── */
        @media (max-width: 640px) {
          .calendar-header {
            padding: 0 0.7rem;
            height: 50px;
          }
          .title-full { display: none; }
          .title-short { display: inline; }
          .header-title { font-size: 0.95rem; flex: 0 0 auto; }
          .btn-today { display: none; }
          /* Hide desktop view tabs */
          .header-right { display: none; }

          /* Show mobile bottom tab bar */
          .mobile-view-tabs {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 52px;
            background-color: var(--bg-secondary);
            border-top: 1px solid var(--border-color);
            z-index: 100;
            box-shadow: 0 -2px 8px rgba(60,36,21,0.08);
          }
          .mobile-view-tab {
            flex: 1;
            border: none;
            background: transparent;
            font-family: 'Mukta Malar', sans-serif;
            font-size: 0.78rem;
            font-weight: 700;
            color: var(--text-muted);
            cursor: pointer;
            transition: all var(--transition-fast);
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .mobile-view-tab.active {
            color: var(--accent-color);
            border-top: 2.5px solid var(--accent-color);
          }
        }
      `}</style>
    </header>
  );
};
