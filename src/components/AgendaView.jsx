import React from 'react';
import { useCalendar, formatDateString } from '../context/CalendarContext';

export const AgendaView = () => {
  const {
    currentDate,
    filteredEvents,
    setSelectedEventForEdit,
    setEventModalOpen,
    deleteEvent,
    setModalInitialDate,
    language,
  } = useCalendar();

  const activeYear = currentDate.getFullYear();
  const activeMonth = currentDate.getMonth();

  // Filter events that fall in the current selected month
  const getAgendaEvents = () => {
    return filteredEvents
      .filter((event) => {
        // Parse event dates
        const [ey, em] = event.startDate.split('-').map(Number);
        return ey === activeYear && (em - 1) === activeMonth;
      })
      .sort((a, b) => {
        // Chronological sort
        const dateCompare = a.startDate.localeCompare(b.startDate);
        if (dateCompare !== 0) return dateCompare;
        
        // All-day first
        if (a.allDay && !b.allDay) return -1;
        if (!a.allDay && b.allDay) return 1;
        
        // Start time comparison
        if (a.startTime && b.startTime) {
          return a.startTime.localeCompare(b.startTime);
        }
        return 0;
      });
  };

  const agendaEvents = getAgendaEvents();

  // Group events by YYYY-MM-DD
  const groupEventsByDate = () => {
    const groups = {};
    agendaEvents.forEach((event) => {
      if (!groups[event.startDate]) {
        groups[event.startDate] = [];
      }
      groups[event.startDate].push(event);
    });
    return groups;
  };

  const grouped = groupEventsByDate();
  // Sort dates chronologically
  const sortedDates = Object.keys(grouped).sort();

  const formatDateHeader = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const locale = language === 'ta' ? 'ta-IN' : 'en-US';
    return dateObj.toLocaleDateString(locale, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleEditEvent = (event) => {
    setSelectedEventForEdit(event);
    setEventModalOpen(true);
  };

  const handleDeleteEvent = (id, e) => {
    e.stopPropagation();
    if (window.confirm(language === 'ta' ? 'இந்த நிகழ்வை நிச்சயமாக நீக்க வேண்டுமா?' : 'Are you sure you want to delete this event?')) {
      deleteEvent(id);
    }
  };

  const handleCreateEmptyState = () => {
    setSelectedEventForEdit(null);
    setModalInitialDate({
      startDate: formatDateString(new Date(activeYear, activeMonth, 1)),
      startTime: '09:00',
    });
    setEventModalOpen(true);
  };

  return (
    <div className="agenda-view-container">
      {sortedDates.length === 0 ? (
        <div className="agenda-empty-state">
          <div className="empty-icon-wrapper">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="empty-icon">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <h3>{language === 'ta' ? 'நிகழ்ச்சிகள் எதுவும் இல்லை' : 'No Events Scheduled'}</h3>
          <p>
            {language === 'ta' 
              ? 'இந்த மாதத்திற்கான நிகழ்ச்சிகள் எதுவும் திட்டமிடப்படவில்லை.' 
              : 'There are no events planned for this month.'}
          </p>
          <button className="btn btn-primary" onClick={handleCreateEmptyState}>
            {language === 'ta' ? 'நிகழ்ச்சியைச் சேர்க்கவும்' : 'Add Event'}
          </button>
        </div>
      ) : (
        <div className="agenda-scrollable-content">
          {sortedDates.map((dateStr) => {
            const dateEvents = grouped[dateStr];
            return (
              <div key={dateStr} className="agenda-day-group">
                <div className="agenda-day-header">
                  <h4>{formatDateHeader(dateStr)}</h4>
                </div>
                <div className="agenda-events-list">
                  {dateEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => handleEditEvent(event)}
                      className="agenda-event-card"
                      style={{ borderLeft: `5px solid ${event.color}` }}
                    >
                      <div className="agenda-card-left">
                        <div className="agenda-event-time-badge">
                          {event.allDay ? (
                            <span className="all-day-txt">{language === 'ta' ? 'முழு நாள்' : 'All Day'}</span>
                          ) : (
                            <span className="time-txt">
                              {event.startTime} {event.endTime ? `– ${event.endTime}` : ''}
                            </span>
                          )}
                        </div>
                        <div className="agenda-event-details">
                          <h5 className="agenda-event-title">{event.title}</h5>
                          {event.description && (
                            <p className="agenda-event-desc">{event.description}</p>
                          )}
                          {event.location && (
                            <div className="agenda-event-location">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                <circle cx="12" cy="10" r="3"></circle>
                              </svg>
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="agenda-card-right">
                        <span 
                          className="agenda-category-dot" 
                          style={{ backgroundColor: event.color }}
                          title={`Category: ${event.category}`}
                        />
                        <button 
                          className="btn-delete-card" 
                          onClick={(e) => handleDeleteEvent(event.id, e)}
                          title={language === 'ta' ? 'நீக்கு' : 'Delete'}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .agenda-view-container {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          height: var(--month-grid-height);
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow-md);
        }
        .agenda-scrollable-content {
          padding: 1.5rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .agenda-day-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .agenda-day-header {
          border-bottom: 1.5px solid var(--border-color);
          padding-bottom: 4px;
        }
        .agenda-day-header h4 {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--accent-color);
          font-family: 'Mukta Malar', sans-serif;
        }
        .agenda-events-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .agenda-event-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 0.8rem 1.2rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .agenda-event-card:hover {
          transform: translateX(3px);
          box-shadow: var(--shadow-sm);
          background-color: var(--bg-hover);
        }
        .agenda-card-left {
          display: flex;
          align-items: flex-start;
          gap: 1.2rem;
          flex-grow: 1;
          min-width: 0;
        }
        .agenda-event-time-badge {
          width: 80px;
          flex-shrink: 0;
          padding: 4px 6px;
          background-color: var(--bg-primary);
          border-radius: 6px;
          text-align: center;
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }
        .agenda-event-details {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .agenda-event-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          font-family: 'Mukta Malar', sans-serif;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .agenda-event-desc {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin: 2px 0 0 0;
          font-family: 'Mukta Malar', sans-serif;
        }
        .agenda-event-location {
          font-size: 0.72rem;
          color: var(--text-muted);
          margin-top: 4px;
          display: flex;
          align-items: center;
        }
        .agenda-card-right {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-shrink: 0;
        }
        .agenda-category-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        .btn-delete-card {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }
        .btn-delete-card:hover {
          color: #b8583c;
          background-color: rgba(184, 88, 60, 0.08);
        }
        .agenda-empty-state {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          text-align: center;
        }
        .empty-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: var(--bg-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.2rem;
          color: var(--text-muted);
          border: 1px solid var(--border-color);
        }
        .agenda-empty-state h3 {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }
        .agenda-empty-state p {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          max-width: 300px;
        }
      `}</style>
    </div>
  );
};
