import React, { useRef, useEffect } from 'react';
import { useCalendar, formatDateString } from '../context/CalendarContext';
import type { CalendarEvent } from '../types';

export const DayView: React.FC = () => {
  const {
    currentDate,
    filteredEvents,
    setEventModalOpen,
    setSelectedEventForEdit,
    setModalInitialDate,
    language,
  } = useCalendar();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 7 * 60; // scroll to 7 AM (420px)
    }
  }, [currentDate]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dateStr = formatDateString(currentDate);

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  // Filter events for this specific day
  const dayEvents = filteredEvents.filter(
    (event) => event.startDate <= dateStr && event.endDate >= dateStr
  );

  const allDayEvents = dayEvents.filter((e) => e.allDay);
  const timedEvents = dayEvents.filter((e) => !e.allDay);

  const getEventPosition = (event: CalendarEvent) => {
    const start = event.startTime || '00:00';
    const end = event.endTime || '23:59';

    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);

    const top = sh * 60 + sm;
    let duration = (eh * 60 + em) - top;
    if (duration < 45) duration = 45; // slightly larger min height for readability on day view

    return {
      top: `${top}px`,
      height: `${duration}px`,
    };
  };

  const handleHourClick = (hour: number) => {
    setSelectedEventForEdit(null);
    const hourStr = String(hour).padStart(2, '0');
    setModalInitialDate({
      startDate: dateStr,
      startTime: `${hourStr}:00`,
    });
    setEventModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEventForEdit(event);
    setEventModalOpen(true);
  };

  return (
    <div className="day-view-container">
      {/* All-Day Events Section */}
      {allDayEvents.length > 0 && (
        <div className="day-all-day-row">
          <div className="day-all-day-label">{language === 'ta' ? 'முழு நாள்' : 'All Day'}</div>
          <div className="day-all-day-list">
            {allDayEvents.map((event) => (
              <div
                key={event.id}
                className="event-badge day-all-day-badge"
                style={{ backgroundColor: event.color }}
                onClick={(e) => handleEventClick(event, e)}
                title={event.title}
              >
                {event.title}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline view */}
      <div className="day-grid-scrollable" ref={scrollContainerRef}>
        <div className="day-grid-body">
          {/* Time axis */}
          <div className="day-time-scale">
            {hours.map((hour) => (
              <div key={hour} className="day-hour-label">
                <span>{formatHour(hour)}</span>
              </div>
            ))}
          </div>

          {/* Slots container */}
          <div className="day-column-grid">
            {hours.map((hour) => (
              <div
                key={hour}
                className="day-hour-slot"
                onClick={() => handleHourClick(hour)}
                title={`${formatHour(hour)} மணிக்கு நிகழ்வைச் சேர்`}
              />
            ))}

            {/* Timed Events cards */}
            {timedEvents.map((event) => {
              const pos = getEventPosition(event);
              return (
                <div
                  key={event.id}
                  className="day-event-card"
                  style={{
                    backgroundColor: event.color,
                    top: pos.top,
                    height: pos.height,
                    borderLeft: `5px solid rgba(0,0,0,0.25)`
                  }}
                  onClick={(e) => handleEventClick(event, e)}
                >
                  <div className="day-event-card-time">
                    {event.startTime} - {event.endTime}
                  </div>
                  <div className="day-event-card-title">{event.title}</div>
                  {event.description && (
                    <div className="day-event-card-desc">{event.description}</div>
                  )}
                  {event.location && (
                    <div className="day-event-card-location">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                      {event.location}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .day-view-container {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          background: var(--bg-secondary);
        }
        .day-all-day-row {
          display: flex;
          padding: 8px 12px;
          border-bottom: 1px solid var(--border-color);
          background-color: var(--bg-primary);
          flex-shrink: 0;
          gap: 12px;
        }
        .day-all-day-label {
          width: 60px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          display: flex;
          align-items: center;
        }
        .day-all-day-list {
          flex-grow: 1;
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .day-all-day-badge {
          margin-bottom: 0;
          padding: 6px 12px;
          font-size: 0.8rem;
        }
        .day-grid-scrollable {
          flex-grow: 1;
          overflow-y: scroll;
          overflow-x: hidden;
        }
        .day-grid-body {
          display: flex;
          height: 1440px; /* 24 hours * 60px */
          position: relative;
        }
        .day-time-scale {
          width: 75px;
          flex-shrink: 0;
          border-right: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
        }
        .day-hour-label {
          height: 60px;
          display: flex;
          justify-content: flex-end;
          padding-right: 10px;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 550;
        }
        .day-hour-label span {
          position: relative;
          top: -8px;
        }
        .day-column-grid {
          flex-grow: 1;
          position: relative;
          height: 1440px;
        }
        .day-hour-slot {
          height: 60px;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
          transition: background-color var(--transition-fast);
        }
        .day-hour-slot:hover {
          background-color: var(--accent-light);
        }
        .day-event-card {
          position: absolute;
          left: 12px;
          right: 24px;
          border-radius: 12px;
          padding: 10px 14px;
          color: white;
          cursor: pointer;
          box-shadow: var(--shadow-md);
          overflow: hidden;
          z-index: 2;
          transition: filter var(--transition-fast), transform var(--transition-fast);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .day-event-card:hover {
          filter: brightness(1.06);
          transform: translateY(-1px);
          box-shadow: var(--shadow-lg);
        }
        .day-event-card-time {
          font-size: 0.75rem;
          font-weight: 600;
          opacity: 0.85;
        }
        .day-event-card-title {
          font-size: 0.95rem;
          font-weight: 600;
          line-height: 1.2;
        }
        .day-event-card-desc {
          font-size: 0.8rem;
          opacity: 0.9;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          margin-bottom: 4px;
        }
        .day-event-card-location {
          font-size: 0.75rem;
          opacity: 0.85;
          margin-top: auto;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
};
