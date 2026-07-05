import React, { useRef } from 'react';
import { useCalendar, formatDateString } from '../context/CalendarContext';
import { CATEGORY_OPTIONS } from '../types';
import { MiniCalendar } from './MiniCalendar';

export const categoryTranslations: Record<string, { ta: string; en: string }> = {
  holiday: { ta: 'பண்டிகை', en: 'Holidays' },
  work: { ta: 'வேலை', en: 'Work' },
  personal: { ta: 'பிறந்தநாள்', en: 'Birthday' },
  family: { ta: 'குடும்பம்', en: 'Family' },
  leisure: { ta: 'மற்றவை', en: 'Others' }
};

export const Sidebar: React.FC = () => {
  const {
    isSidebarOpen,
    searchQuery,
    setSearchQuery,
    selectedCategories,
    toggleCategory,
    setEventModalOpen,
    setSelectedEventForEdit,
    setModalInitialDate,
    events,
    importEvents,
    language,
    user,
    logout,
  } = useCalendar();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateEvent = () => {
    setSelectedEventForEdit(null);
    setModalInitialDate({
      startDate: formatDateString(new Date()),
      startTime: '09:00',
    });
    setEventModalOpen(true);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(events, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calendar_export_${formatDateString(new Date())}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const success = importEvents(parsed);
        if (success) {
          alert(language === 'ta' ? 'நிகழ்ச்சிகள் வெற்றிகரமாக இறக்குமதி செய்யப்பட்டன!' : 'Calendar events imported successfully!');
        } else {
          alert(language === 'ta' ? 'இறக்குமதி செய்ய முடியவில்லை: தவறான வடிவமைப்பு.' : 'Failed to import: Invalid event format.');
        }
      } catch (err) {
        alert(language === 'ta' ? 'இறக்குமதி செய்ய முடியவில்லை: இது சரியான கோப்பு அல்ல.' : 'Failed to import: File is not a valid JSON.');
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = '';
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    holiday: (
      <svg className="cat-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 L4 22 L20 22 Z M12 2 L12 22 M8 12 L16 12 M6 17 L18 17 M10 7 L14 7" />
      </svg>
    ),
    work: (
      <svg className="cat-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
    ),
    personal: (
      <svg className="cat-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12h6M12 9v6M12 2v2M5 22h14M19 12a7 7 0 1 1-14 0"></path>
      </svg>
    ),
    family: (
      <svg className="cat-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    ),
    leisure: (
      <svg className="cat-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="2" fill="currentColor"></circle>
        <circle cx="5" cy="12" r="2" fill="currentColor"></circle>
        <circle cx="19" cy="12" r="2" fill="currentColor"></circle>
      </svg>
    ),
  };

  return (
    <aside className={`sidebar-panel ${isSidebarOpen ? '' : 'collapsed'}`}>
      <div className="sidebar-header">
        <div className="logo-area">
          <svg className="logo-icon-tamil" width="34" height="34" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="50" cy="50" r="40" strokeWidth="1.5" strokeDasharray="3 2" />
            <circle cx="50" cy="50" r="30" />
            <circle cx="50" cy="50" r="8" fill="currentColor" />
            <path d="M50 10 L50 90 M10 50 L90 50 M22 22 L78 78 M22 78 L78 22" />
            <polygon points="50,5 53,20 47,20" fill="currentColor" />
            <polygon points="50,95 53,80 47,80" fill="currentColor" />
            <polygon points="95,50 80,53 80,47" fill="currentColor" />
            <polygon points="5,50 20,53 20,47" fill="currentColor" />
          </svg>
          <div className="logo-text-wrapper">
            {language === 'ta' ? (
              <span className="logo-text-tamil">காலச்சுவடு</span>
            ) : (
              <span className="logo-text-english">KAALACHUVADU</span>
            )}
          </div>
        </div>
      </div>

      <div className="sidebar-scrollable">
        <div className="sidebar-section">
          <button className="btn btn-primary btn-create" onClick={handleCreateEvent}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>{language === 'ta' ? 'புதிய நிகழ்ச்சி' : 'Create Event'}</span>
          </button>
        </div>

        <div className="sidebar-section">
          <MiniCalendar />
        </div>

        <div className="sidebar-section">
          <h3 className="section-title">{language === 'ta' ? 'தேடல்' : 'Search'}</h3>
          <div className="search-box">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder={language === 'ta' ? 'நிகழ்ச்சிகளை தேடவும்...' : 'Search events...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button className="search-clear-btn" onClick={() => setSearchQuery('')} title={language === 'ta' ? 'தேடலை அழி' : 'Clear search'}>
                &times;
              </button>
            )}
          </div>
        </div>

        <div className="sidebar-section">
          <h3 className="section-title">{language === 'ta' ? 'வகைகள்' : 'Categories'}</h3>
          <div className="categories-list">
            {CATEGORY_OPTIONS.map((cat) => {
              const isChecked = selectedCategories.includes(cat.value);
              return (
                <label key={cat.value} className="category-checkbox-label">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCategory(cat.value)}
                    className="category-checkbox-real"
                  />
                  <span
                    className={`category-checkbox-custom ${isChecked ? 'checked' : ''}`}
                    style={{ '--cat-color': cat.color } as React.CSSProperties}
                  >
                    {categoryIcons[cat.value]}
                  </span>
                  <span className="category-label-text">
                    {categoryTranslations[cat.value]?.[language] || cat.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="sidebar-section bottom-actions">
          <h3 className="section-title">{language === 'ta' ? 'காப்புப்பிரதி & ஒத்திசைவு' : 'Backup & Sync'}</h3>
          <div className="sync-buttons">
            <button className="btn btn-secondary sync-btn" onClick={handleExport} title={language === 'ta' ? 'தரவை ஏற்றுமதி செய்' : 'Export calendar data as JSON'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>{language === 'ta' ? 'ஏற்றுமதி' : 'Export'}</span>
            </button>
            <button className="btn btn-secondary sync-btn" onClick={handleImportClick} title={language === 'ta' ? 'தரவை இறக்குமதி செய்' : 'Import calendar data from JSON'}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <span>{language === 'ta' ? 'இறக்குமதி' : 'Import'}</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>

      {user && (
        <div className="sidebar-user-footer">
          <div className="user-profile-bar">
            <img src={user.avatar} alt={user.name} className="user-avatar" />
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <button className="btn-logout" onClick={logout} title={language === 'ta' ? "வெளியேறு" : "Logout"}>
                {language === 'ta' ? "வெளியேறு" : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .sidebar-header {
          padding: 1.2rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          height: 60px;
        }
        .logo-area {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--accent-color);
        }
        .logo-icon {
          stroke: var(--accent-color);
        }
        .logo-text {
          font-size: 1.2rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }
        .sidebar-scrollable {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          padding: 1.2rem 1.2rem 120px 1.2rem;
          gap: 1.5rem;
          overflow-y: auto;
        }
        .sidebar-section {
          display: flex;
          flex-direction: column;
        }
        .btn-create {
          width: 100%;
          justify-content: center;
          font-size: 1rem;
          padding: 0.75rem;
          box-shadow: var(--shadow-sm);
        }
        .section-title {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-bottom: 0.6rem;
          font-weight: 600;
        }
        .search-box {
          position: relative;
          display: flex;
          align-items: center;
        }
        .search-icon {
          position: absolute;
          left: 12px;
          color: var(--text-muted);
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          padding: 0.6rem 0.6rem 0.6rem 2.2rem;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background-color: var(--bg-primary);
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.88rem;
          outline: none;
          transition: all var(--transition-fast);
        }
        .search-input:focus {
          border-color: var(--accent-color);
          box-shadow: 0 0 0 2px var(--accent-light);
        }
        .search-clear-btn {
          position: absolute;
          right: 10px;
          background: transparent;
          border: none;
          color: var(--text-muted);
          font-size: 1.2rem;
          cursor: pointer;
          line-height: 1;
        }
        .search-clear-btn:hover {
          color: var(--text-primary);
        }
        .categories-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .category-checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 0.9rem;
          color: var(--text-secondary);
          user-select: none;
          transition: color var(--transition-fast);
        }
        .category-checkbox-label:hover {
          color: var(--text-primary);
        }
        .category-checkbox-real {
          display: none;
        }
        .category-checkbox-custom {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 2px solid var(--text-muted);
          display: inline-block;
          position: relative;
          transition: all var(--transition-fast);
        }
        .category-checkbox-custom.checked {
          border-color: var(--cat-color);
          background-color: var(--cat-color);
        }
        .category-checkbox-custom.checked::after {
          content: "";
          position: absolute;
          left: 4px;
          top: 1px;
          width: 4px;
          height: 8px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        .category-label-text {
          font-weight: 500;
        }
        .bottom-actions {
          margin-top: auto;
          border-top: 1px solid var(--border-color);
          padding-top: 1.2rem;
        }
        .sync-buttons {
          display: flex;
          gap: 8px;
        }
        .sync-btn {
          flex: 1;
          padding: 0.5rem;
          font-size: 0.8rem;
          border-radius: 10px;
        }
      `}</style>

      {/* Bottom Left Sidebar Gopuram Ornament */}
      <div className="ornament-sidebar-bottom" aria-hidden="true">
        <svg width="140" height="110" viewBox="0 0 150 120" fill="none" stroke="#d0c098" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 110 L140 110" />
          <path d="M20 100 L130 100 L125 110 L25 110 Z" fill="#fdfaf2" opacity="0.3" />
          <path d="M30 90 L120 90 L115 100 L35 100 Z" fill="#fdfaf2" opacity="0.3" />
          <path d="M40 90 L50 20 L100 20 L110 90 Z" />
          <path d="M45 90 L53 30 L97 30 L105 90 Z" />
          <path d="M50 20 L50 10 L100 10 L100 20 Z" />
          <path d="M75 10 L75 90" strokeDasharray="2 2" />
          <path d="M65 90 C 65 78, 85 78, 85 90" />
          <circle cx="75" cy="50" r="6" />
          <path d="M5 110 Q 12 105, 18 110 M132 110 Q 138 105, 145 110" />
        </svg>
      </div>
    </aside>
  );
};
