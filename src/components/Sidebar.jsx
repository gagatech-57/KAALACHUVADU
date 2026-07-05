import React, { useRef } from 'react';
import { useCalendar, formatDateString } from '../context/CalendarContext';
import { CATEGORY_OPTIONS } from '../types';
import { MiniCalendar } from './MiniCalendar';

export const categoryTranslations = {
  holiday: { ta: 'பண்டிகை', en: 'Holidays' },
  work: { ta: 'வேலை', en: 'Work' },
  personal: { ta: 'பிறந்தநாள்', en: 'Birthday' },
  family: { ta: 'குடும்பம்', en: 'Family' },
  leisure: { ta: 'மற்றவை', en: 'Others' }
};

export const Sidebar = () => {
  const {
    isSidebarOpen,
    toggleSidebar,
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

  const fileInputRef = useRef(null);

  const handleCreateEvent = () => {
    setSelectedEventForEdit(null);
    setModalInitialDate({ startDate: formatDateString(new Date()), startTime: '09:00' });
    setEventModalOpen(true);
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calendar_export_${formatDateString(new Date())}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        const success = importEvents(parsed);
        alert(success
          ? (language === 'ta' ? 'நிகழ்ச்சிகள் வெற்றிகரமாக இறக்குமதி செய்யப்பட்டன!' : 'Events imported successfully!')
          : (language === 'ta' ? 'இறக்குமதி தோல்வி: தவறான வடிவமைப்பு.' : 'Import failed: Invalid format.'));
      } catch {
        alert(language === 'ta' ? 'இறக்குமதி தோல்வி: சரியான JSON கோப்பு அல்ல.' : 'Import failed: Invalid JSON file.');
      }
    };
    reader.readAsText(files[0]);
    e.target.value = '';
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isSidebarOpen && (
        <div className="sidebar-backdrop" onClick={toggleSidebar} aria-hidden="true" />
      )}

      <aside className={`sidebar-panel ${isSidebarOpen ? '' : 'collapsed'}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="logo-area">
            <svg className="logo-icon-tamil" width="30" height="30" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
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
              {language === 'ta'
                ? <span className="logo-text-tamil">காலச்சுவடு</span>
                : <span className="logo-text-english">KAALACHUVADU</span>
              }
            </div>
          </div>
          {/* Close button visible on mobile */}
          <button className="sidebar-close-btn" onClick={toggleSidebar} aria-label="Close sidebar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="sidebar-scrollable">
          <div className="sidebar-section">
            <button className="btn btn-primary btn-create" onClick={handleCreateEvent}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
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
              <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder={language === 'ta' ? 'நிகழ்ச்சிகளை தேடவும்...' : 'Search events...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button className="search-clear-btn" onClick={() => setSearchQuery('')}>&times;</button>
              )}
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="section-title">{language === 'ta' ? 'வகைகள்' : 'Categories'}</h3>
            <div className="categories-list">
              {CATEGORY_OPTIONS.map((cat) => {
                const isChecked = selectedCategories.includes(cat.value);
                const labelObj = categoryTranslations[cat.value];
                const labelStr = language === 'ta' ? labelObj.ta : labelObj.en;
                return (
                  <button
                    key={cat.value}
                    className={`category-badge ${isChecked ? 'active' : ''}`}
                    onClick={() => toggleCategory(cat.value)}
                    style={{
                      backgroundColor: isChecked ? `${cat.color}15` : 'transparent',
                      border: `1.5px solid ${cat.color}`,
                      color: cat.color,
                    }}
                  >
                    <span className="category-dot" style={{ backgroundColor: cat.color }} />
                    <span className="category-label">{labelStr}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="section-title">{language === 'ta' ? 'காப்புப்பிரதி' : 'Backup & Sync'}</h3>
            <div className="backup-actions">
              <button className="btn btn-secondary sync-btn" onClick={handleExport}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>{language === 'ta' ? 'ஏற்றுமதி' : 'Export'}</span>
              </button>
              <button className="btn btn-secondary sync-btn" onClick={handleImportClick}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>{language === 'ta' ? 'இறக்குமதி' : 'Import'}</span>
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImportFile} accept=".json" style={{ display: 'none' }} />
            </div>
          </div>
        </div>

        {/* User footer */}
        {user && (
          <div className="sidebar-user-footer">
            <div className="user-profile-bar">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="user-avatar"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    const parent = e.target.parentElement;
                    if (parent && !parent.querySelector('.user-avatar-placeholder')) {
                      const d = document.createElement('div');
                      d.className = 'user-avatar-placeholder';
                      d.innerText = user.name ? user.name.charAt(0).toUpperCase() : 'U';
                      parent.insertBefore(d, parent.firstChild);
                    }
                  }}
                />
              ) : (
                <div className="user-avatar-placeholder">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="user-info">
                <span className="user-name">{user.name}</span>
                <button className="btn-logout" onClick={logout}>
                  {language === 'ta' ? 'வெளியேறு' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          .sidebar-backdrop {
            display: none;
          }
          .sidebar-header {
            padding: 0 1.2rem;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 56px;
            flex-shrink: 0;
          }
          .logo-area {
            display: flex;
            align-items: center;
            gap: 8px;
            color: var(--accent-color);
          }
          .sidebar-close-btn {
            display: none;
            background: transparent;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 4px;
            border-radius: 6px;
          }
          .sidebar-close-btn:hover { background: var(--bg-hover); }
          .sidebar-scrollable {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            padding: 1rem 1.2rem 1rem 1.2rem;
            gap: 1.4rem;
            overflow-y: auto;
          }
          .sidebar-section {
            display: flex;
            flex-direction: column;
          }
          .btn-create { width: 100%; }
          .section-title {
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--text-muted);
            margin-bottom: 0.5rem;
          }
          .search-box {
            position: relative;
            display: flex;
            align-items: center;
          }
          .search-icon {
            position: absolute;
            left: 10px;
            color: var(--text-muted);
            pointer-events: none;
          }
          .search-input {
            width: 100%;
            padding: 0.5rem 2rem 0.5rem 2.1rem;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            background-color: var(--bg-secondary);
            font-family: inherit;
            font-size: 0.85rem;
            color: var(--text-primary);
            transition: border-color var(--transition-fast);
          }
          .search-input:focus {
            outline: none;
            border-color: var(--accent-color);
          }
          .search-clear-btn {
            position: absolute;
            right: 8px;
            background: transparent;
            border: none;
            font-size: 1.1rem;
            color: var(--text-muted);
            cursor: pointer;
          }
          .categories-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
          }
          .category-badge {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 0.82rem;
            font-weight: 700;
            cursor: pointer;
            transition: all var(--transition-fast);
            user-select: none;
          }
          .category-badge:hover { transform: translateX(2px); }
          .category-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            flex-shrink: 0;
          }
          .category-label { font-family: 'Mukta Malar', sans-serif; }
          .backup-actions { display: flex; gap: 8px; }
          .sync-btn {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            font-size: 0.78rem;
            padding: 0.45rem;
          }

          /* ── Mobile sidebar overlay ── */
          @media (max-width: 640px) {
            .sidebar-backdrop {
              display: block;
              position: fixed;
              inset: 0;
              background: rgba(0,0,0,0.4);
              z-index: 49;
            }
            .sidebar-close-btn { display: flex; }
            .sidebar-scrollable {
              padding-bottom: 1rem;
            }
          }
        `}</style>
      </aside>
    </>
  );
};
