import React from 'react';
import { useCalendar, formatDateString } from '../context/CalendarContext';
import type { CalendarEvent } from '../types';

export const AgendaView: React.FC = () => {
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
    const groups: { [key: string]: CalendarEvent[] } = {};
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

  const formatDateHeader = (dateStr: string) => {
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

  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEventForEdit(event);
    setEventModalOpen(true);
  };

  const handleDeleteEvent = (id: string, e: React.MouseEvent) => {
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
              <circle cx="12" cy="16" r="1"></circle>
            </svg>
          </div>
          <h3>{language === 'ta' ? 'நிகழ்ச்சிகள் எதுவும் இல்லை' : 'No Events Scheduled'}</h3>
          <p>{language === 'ta' ? 'இந்த மாதத்தில் உங்கள் நிபந்தனைகளுக்குப் பொருந்தும் நிகழ்வுகள் எதுவும் திட்டமிடப்படவில்லை.' : 'No events are scheduled for this month matching your active filters.'}</p>
          <button className="btn btn-primary" onClick={handleCreateEmptyState}>
            {language === 'ta' ? 'நிகழ்வைச் சேர்' : 'Add Event'}
          </button>
        </div>
      ) : (
        <div className="agenda-list">
          {sortedDates.map((dateStr) => (
            <div key={dateStr} className="agenda-group">
              <h2 className="agenda-date-header">{formatDateHeader(dateStr)}</h2>
              <div className="agenda-events">
                {grouped[dateStr].map((event) => (
                  <div key={event.id} className="agenda-event-row" onClick={() => handleEditEvent(event)}>
                    <div className="agenda-category-bar" style={{ backgroundColor: event.color }} />
                    
                    <div className="agenda-event-time">
                      {event.allDay ? (
                        <span className="agenda-all-day-label">{language === 'ta' ? 'முழு நாள்' : 'All Day'}</span>
                      ) : (
                        <>
                          <span className="time-start">{event.startTime}</span>
                          <span className="time-separator">to</span>
                          <span className="time-end">{event.endTime}</span>
                        </>
                      )}
                    </div>

                    <div className="agenda-event-details">
                      <h4 className="agenda-event-title">{event.title}</h4>
                      {event.description && (
                        <p className="agenda-event-desc">{event.description}</p>
                      )}
                      {event.location && (
                        <div className="agenda-event-location">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                          </svg>
                          {event.location}
                        </div>
                      )}
                    </div>

                    <div className="agenda-event-actions">
                      <button className="btn btn-icon btn-text action-btn edit-btn" onClick={(e) => { e.stopPropagation(); handleEditEvent(event); }} title="Edit Event">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button className="btn btn-icon btn-text action-btn delete-btn" onClick={(e) => handleDeleteEvent(event.id, e)} title="Delete Event">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
          ))}
        </div>
      )}

      <style>{`
        .agenda-view-container {
          flex-grow: 1;
          overflow-y: auto;
          background: var(--bg-primary);
          height: 100%;
          padding: 1.5rem;
        }
        .agenda-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 80%;
          text-align: center;
          color: var(--text-secondary);
        }
        .empty-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--accent-light);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-color);
          margin-bottom: 1.2rem;
        }
        .agenda-empty-state h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.4rem;
        }
        .agenda-empty-state p {
          font-size: 0.88rem;
          margin-bottom: 1.2rem;
          max-width: 320px;
        }
        .agenda-list {
          display: flex;
          flex-direction: column;
          gap: 1.8rem;
          max-width: 800px;
          margin: 0 auto;
        }
        .agenda-group {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .agenda-date-header {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 6px;
        }
        .agenda-events {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .agenda-event-row {
          display: flex;
          align-items: flex-start;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 1rem;
          position: relative;
          cursor: pointer;
          transition: all var(--transition-fast);
          overflow: hidden;
        }
        .agenda-event-row:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
          border-color: var(--text-muted);
        }
        .agenda-category-bar {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 5px;
        }
        .agenda-event-time {
          width: 130px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .agenda-all-day-label {
          font-weight: 600;
          color: var(--accent-color);
        }
        .time-separator {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          margin: 2px 0;
        }
        .agenda-event-details {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding-right: 1rem;
        }
        .agenda-event-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-primary);
        }
        .agenda-event-desc {
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }
        .agenda-event-location {
          font-size: 0.78rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          margin-top: 4px;
        }
        .agenda-event-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity var(--transition-fast);
          align-self: center;
        }
        .agenda-event-row:hover .agenda-event-actions {
          opacity: 1;
        }
        .action-btn {
          width: 32px;
          height: 32px;
        }
        .delete-btn:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
        }
        .edit-btn:hover {
          color: var(--accent-color);
        }
        @media (max-width: 600px) {
          .agenda-event-row {
            flex-direction: column;
            gap: 8px;
          }
          .agenda-event-time {
            width: 100%;
            flex-direction: row;
            gap: 6px;
            font-size: 0.8rem;
          }
          .time-separator {
            margin: 0;
          }
          .agenda-event-actions {
            opacity: 1;
            align-self: flex-end;
            margin-top: 4px;
          }
        }
      `}</style>
    </div>
  );
};
