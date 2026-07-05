import React, { useRef, useEffect } from 'react';
import { useCalendar, formatDateString } from '../context/CalendarContext';
import type { CalendarEvent } from '../types';

export const WeekView: React.FC = () => {
  const {
    currentDate,
    filteredEvents,
    setEventModalOpen,
    setSelectedEventForEdit,
    setModalInitialDate,
    language,
  } = useCalendar();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to a reasonable starting time (e.g. 7:00 AM) on load
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 7 * 60; // 7 AM = 420px
    }
  }, []);

  // Get Sunday - Saturday dates for the current week
  const getWeekDays = () => {
    const start = new Date(currentDate);
    const day = start.getDay();
    start.setDate(start.getDate() - day); // Sunday

    const daysList: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      daysList.push(d);
    }
    return daysList;
  };

  const weekDays = getWeekDays();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Format hour label
  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  const isToday = (date: Date) => {
    return formatDateString(date) === formatDateString(new Date());
  };

  // Filter and group events
  const getEventsForDay = (date: Date, allDay: boolean) => {
    const dateStr = formatDateString(date);
    return filteredEvents.filter((event) => {
      const matchesDate = event.startDate <= dateStr && event.endDate >= dateStr;
      return matchesDate && event.allDay === allDay;
    });
  };

  // Position calculations for timed events
  const getEventPosition = (event: CalendarEvent) => {
    const start = event.startTime || '00:00';
    const end = event.endTime || '23:59';

    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);

    const top = sh * 60 + sm; // 1px per minute
    let duration = (eh * 60 + em) - top;
    if (duration < 30) duration = 30; // minimum duration block of 30px

    return {
      top: `${top}px`,
      height: `${duration}px`,
    };
  };

  const handleHourClick = (date: Date, hour: number) => {
    setSelectedEventForEdit(null);
    const hourStr = String(hour).padStart(2, '0');
    setModalInitialDate({
      startDate: formatDateString(date),
      startTime: `${hourStr}:00`,
    });
    setEventModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEventForEdit(event);
    setEventModalOpen(true);
  };

  const weekdayNames = language === 'ta'
    ? ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="week-view-container">
      {/* Week Header */}
      <div className="week-header-row">
        <div className="time-column-header"></div>
        <div className="week-days-headers">
          {weekDays.map((day, idx) => {
            const cellIsToday = isToday(day);
            return (
              <div key={idx} className={`week-day-header-cell ${cellIsToday ? 'today' : ''}`}>
                <span className="week-day-name">{weekdayNames[day.getDay()]}</span>
                <span className="week-day-num">{day.getDate()}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* All-Day Events Header Row */}
      <div className="all-day-row">
        <div className="time-column-all-day">முழு நாள்</div>
        <div className="all-day-cells">
          {weekDays.map((day, idx) => {
            const allDayEvents = getEventsForDay(day, true);
            return (
              <div key={idx} className="all-day-cell-column">
                {allDayEvents.map((event) => (
                  <div
                    key={event.id}
                    className="event-badge all-day-badge"
                    style={{ backgroundColor: event.color }}
                    onClick={(e) => handleEventClick(event, e)}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly Scrollable Grid */}
      <div className="week-grid-scrollable" ref={scrollContainerRef}>
        <div className="week-grid-body">
          {/* Time scale column */}
          <div className="time-scale-column">
            {hours.map((hour) => (
              <div key={hour} className="hour-scale-cell">
                <span>{formatHour(hour)}</span>
              </div>
            ))}
          </div>

          {/* Grid columns */}
          <div className="week-grid-columns">
            {weekDays.map((day, dayIdx) => {
              const timedEvents = getEventsForDay(day, false);
              return (
                <div key={dayIdx} className="week-day-grid-column">
                  {/* Grid Lines */}
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="hour-slot-cell"
                      onClick={() => handleHourClick(day, hour)}
                      title={`Create event at ${formatHour(hour)}`}
                    />
                  ))}

                  {/* Absolute Positioned Events */}
                  {timedEvents.map((event) => {
                    const pos = getEventPosition(event);
                    return (
                      <div
                        key={event.id}
                        className="timed-event-card"
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
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .week-view-container {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          background: var(--bg-secondary);
        }
        .week-header-row {
          display: flex;
          border-bottom: 1px solid var(--border-color);
          flex-shrink: 0;
        }
        .time-column-header {
          width: 60px;
          flex-shrink: 0;
          border-right: 1px solid var(--border-color);
        }
        .week-days-headers {
          flex-grow: 1;
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }
        .week-day-header-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 8px 0;
          border-right: 1px solid var(--border-color);
          color: var(--text-secondary);
        }
        .week-day-name {
          font-size: 0.75rem;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--text-muted);
        }
        .week-day-num {
          font-size: 1.1rem;
          font-weight: 600;
          margin-top: 2px;
          color: var(--text-primary);
          font-family: 'Share Tech Mono', monospace;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .week-day-header-cell.today .week-day-num {
          background-color: var(--accent-color);
          color: var(--bg-secondary);
          border-radius: 50%;
        }
        .week-day-header-cell.today .week-day-name {
          color: var(--accent-color);
        }
        .all-day-row {
          display: flex;
          border-bottom: 1px solid var(--border-color);
          background-color: var(--bg-primary);
          flex-shrink: 0;
          min-height: 42px;
        }
        .time-column-all-day {
          width: 60px;
          flex-shrink: 0;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          justify-content: center;
          border-right: 1px solid var(--border-color);
          text-transform: uppercase;
        }
        .all-day-cells {
          flex-grow: 1;
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          padding: 4px 0;
        }
        .all-day-cell-column {
          border-right: 1px solid var(--border-color);
          padding: 2px 4px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow: hidden;
        }
        .all-day-badge {
          margin-bottom: 0;
          width: 100%;
          text-overflow: ellipsis;
        }
        .week-grid-scrollable {
          flex-grow: 1;
          overflow-y: scroll;
          overflow-x: hidden;
          position: relative;
        }
        .week-grid-body {
          display: flex;
          height: 1440px; /* 24 hours * 60px */
          position: relative;
        }
        .time-scale-column {
          width: 60px;
          flex-shrink: 0;
          border-right: 1px solid var(--border-color);
          position: relative;
          background-color: var(--bg-secondary);
        }
        .hour-scale-cell {
          height: 60px;
          display: flex;
          justify-content: flex-end;
          padding-right: 8px;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
          position: relative;
        }
        .hour-scale-cell span {
          position: relative;
          top: -8px;
        }
        .week-grid-columns {
          flex-grow: 1;
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          position: relative;
        }
        .week-day-grid-column {
          position: relative;
          height: 1440px;
          border-right: 1px solid var(--border-color);
        }
        .hour-slot-cell {
          height: 60px;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
          transition: background-color var(--transition-fast);
        }
        .hour-slot-cell:hover {
          background-color: var(--accent-light);
        }
        .timed-event-card {
          position: absolute;
          left: 4px;
          right: 4px;
          border-radius: 8px;
          padding: 6px;
          color: white;
          cursor: pointer;
          box-shadow: var(--shadow-sm);
          overflow: hidden;
          z-index: 2;
          transition: filter var(--transition-fast), transform var(--transition-fast);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .timed-event-card:hover {
          filter: brightness(1.08);
          z-index: 3;
        }
        .timed-event-time {
          font-size: 0.7rem;
          font-weight: 600;
          opacity: 0.85;
        }
        .timed-event-title {
          font-size: 0.8rem;
          font-weight: 600;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .timed-event-location {
          font-size: 0.7rem;
          opacity: 0.85;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: auto;
        }
      `}</style>
    </div>
  );
};
