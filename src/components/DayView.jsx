import React, { useRef, useEffect } from 'react';
import { useCalendar, formatDateString } from '../context/CalendarContext';

export const DayView = () => {
  const {
    currentDate,
    filteredEvents,
    setEventModalOpen,
    setSelectedEventForEdit,
    setModalInitialDate,
    language,
  } = useCalendar();

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 7 * 60; // scroll to 7 AM (420px)
    }
  }, [currentDate]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dateStr = formatDateString(currentDate);

  const formatHour = (hour) => {
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

  const getEventPosition = (event) => {
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

  const handleHourClick = (hour) => {
    setSelectedEventForEdit(null);
    const hourStr = String(hour).padStart(2, '0');
    setModalInitialDate({
      startDate: dateStr,
      startTime: `${hourStr}:00`,
    });
    setEventModalOpen(true);
  };

  const handleEventClick = (event, e) => {
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
              <div key={hour} className="hour-scale-cell">
                <span className="hour-label-text">{formatHour(hour)}</span>
              </div>
            ))}
          </div>

          {/* Slots and Positioned Events */}
          <div className="day-slots-column">
            {hours.map((hour) => (
              <div
                key={hour}
                className="day-hour-slot"
                onClick={() => handleHourClick(hour)}
                title={`Create event at ${formatHour(hour)}`}
              />
            ))}

            {timedEvents.map((event) => {
              const pos = getEventPosition(event);
              return (
                <div
                  key={event.id}
                  className="timed-event-card day-event-card"
                  style={{
                    backgroundColor: event.color,
                    top: pos.top,
                    height: pos.height,
                    borderLeft: `4px solid rgba(0,0,0,0.2)`
                  }}
                  onClick={(e) => handleEventClick(event, e)}
                >
                  <div className="timed-event-time">
                    {event.startTime} - {event.endTime}
                  </div>
                  <div className="timed-event-title">{event.title}</div>
                  {event.description && (
                    <div className="day-event-desc">{event.description}</div>
                  )}
                  {event.location && (
                    <div className="timed-event-location">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '2px', verticalAlign: 'middle' }}>
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
          background-color: var(--bg-secondary);
        }
        .day-all-day-row {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          background-color: #f7f3e8;
          border-bottom: 1px solid var(--border-color);
          gap: 12px;
        }
        .day-all-day-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          width: 60px;
          flex-shrink: 0;
        }
        .day-all-day-list {
          flex-grow: 1;
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .day-all-day-badge {
          color: white !important;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          font-family: 'Mukta Malar', sans-serif;
        }
        .day-grid-scrollable {
          flex-grow: 1;
          overflow-y: scroll;
        }
        .day-grid-body {
          display: flex;
          position: relative;
          height: 1440px;
        }
        .day-time-scale {
          width: 58px;
          flex-shrink: 0;
          border-right: 1px solid var(--border-color);
          background-color: var(--bg-primary);
          user-select: none;
        }
        .hour-scale-cell {
          height: 60px;
          position: relative;
          border-bottom: 1px solid var(--border-color);
        }
        .hour-label-text {
          position: absolute;
          top: -8px;
          right: 6px;
          font-size: 0.68rem;
          font-weight: 600;
          color: var(--text-muted);
          white-space: nowrap;
          font-family: 'Playfair Display', serif;
          background-color: var(--bg-primary);
          padding: 0 2px;
          line-height: 1;
        }
        .day-slots-column {
          flex-grow: 1;
          position: relative;
          min-width: 0;
        }
        .day-hour-slot {
          height: 60px;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
        }
        .day-hour-slot:hover {
          background-color: var(--bg-hover);
        }
        .day-event-card {
          left: 4px;
          right: 4px;
          padding: 6px 10px;
        }
        .day-event-desc {
          font-size: 0.7rem;
          opacity: 0.85;
          margin-bottom: 4px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          font-family: 'Mukta Malar', sans-serif;
        }
        @media (max-width: 640px) {
          .day-time-scale { width: 48px; }
          .hour-label-text { font-size: 0.6rem; right: 4px; }
          .day-event-card { left: 2px; right: 2px; padding: 3px 5px; }
          .timed-event-time { font-size: 0.68rem; }
          .timed-event-title { font-size: 0.76rem; }
        }
      `}</style>
    </div>
  );
};
