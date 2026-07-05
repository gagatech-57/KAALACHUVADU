import React, { useRef, useEffect } from 'react';
import { useCalendar, formatDateString } from '../context/CalendarContext';

export const WeekView = () => {
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
      scrollContainerRef.current.scrollTop = 7 * 60;
    }
  }, []);

  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    const daysList = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      daysList.push(d);
    }
    return daysList;
  };

  const weekDays = getWeekDays();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const formatHour = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  const isToday = (date) => formatDateString(date) === formatDateString(new Date());

  const getEventsForDay = (date, allDay) => {
    const dateStr = formatDateString(date);
    return filteredEvents.filter((event) => {
      const matchesDate = event.startDate <= dateStr && event.endDate >= dateStr;
      return matchesDate && event.allDay === allDay;
    });
  };

  const getEventPosition = (event) => {
    const start = event.startTime || '00:00';
    const end = event.endTime || '23:59';
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const top = sh * 60 + sm;
    let duration = (eh * 60 + em) - top;
    if (duration < 30) duration = 30;
    return { top: `${top}px`, height: `${duration}px` };
  };

  const handleHourClick = (date, hour) => {
    setSelectedEventForEdit(null);
    const hourStr = String(hour).padStart(2, '0');
    setModalInitialDate({ startDate: formatDateString(date), startTime: `${hourStr}:00` });
    setEventModalOpen(true);
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    setSelectedEventForEdit(event);
    setEventModalOpen(true);
  };

  // On mobile show only 3 days (today - 1, today, today + 1)
  const [mobileDayOffset, setMobileDayOffset] = React.useState(0);
  const mobileDays = weekDays.slice(
    Math.max(0, Math.min(weekDays.findIndex(d => isToday(d)) + mobileDayOffset, 4)),
    Math.max(3, Math.min(weekDays.findIndex(d => isToday(d)) + mobileDayOffset + 3, 7))
  );
  // Fallback: if today not in week, show first 3
  const visibleDays = mobileDays.length === 3 ? mobileDays : weekDays.slice(0, 3);

  const weekdayNames = language === 'ta'
    ? ['ஞா', 'திங்', 'செவ்', 'புத்', 'வியா', 'வெள்', 'சனி']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const weekdayNamesFull = language === 'ta'
    ? ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="week-view-container">
      {/* Week Header */}
      <div className="week-header-row">
        <div className="time-column-header" />
        {/* Desktop: all 7 days */}
        <div className="week-days-headers desktop-week">
          {weekDays.map((day, idx) => {
            const cellIsToday = isToday(day);
            return (
              <div key={idx} className={`week-day-header-cell ${cellIsToday ? 'today' : ''}`}>
                <span className="week-day-name">{weekdayNamesFull[day.getDay()]}</span>
                <span className="week-day-num">{day.getDate()}</span>
              </div>
            );
          })}
        </div>
        {/* Mobile: 3 visible days + nav arrows */}
        <div className="week-days-headers mobile-week">
          <button className="mobile-week-nav" onClick={() => setMobileDayOffset(o => Math.max(o - 1, -3))} aria-label="Previous days">‹</button>
          {visibleDays.map((day, idx) => {
            const cellIsToday = isToday(day);
            return (
              <div key={idx} className={`week-day-header-cell ${cellIsToday ? 'today' : ''}`}>
                <span className="week-day-name">{weekdayNames[day.getDay()]}</span>
                <span className="week-day-num">{day.getDate()}</span>
              </div>
            );
          })}
          <button className="mobile-week-nav" onClick={() => setMobileDayOffset(o => Math.min(o + 1, 3))} aria-label="Next days">›</button>
        </div>
      </div>

      {/* All-Day Events Row */}
      <div className="all-day-row">
        <div className="time-column-all-day">{language === 'ta' ? 'முழு நாள்' : 'All Day'}</div>
        {/* Desktop */}
        <div className="all-day-cells desktop-week">
          {weekDays.map((day, idx) => {
            const allDayEvents = getEventsForDay(day, true);
            return (
              <div key={idx} className="all-day-cell-column">
                {allDayEvents.map((event) => (
                  <div key={event.id} className="event-badge all-day-badge"
                    style={{ backgroundColor: event.color }}
                    onClick={(e) => handleEventClick(event, e)} title={event.title}>
                    {event.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        {/* Mobile */}
        <div className="all-day-cells mobile-week" style={{ paddingLeft: '28px' }}>
          {visibleDays.map((day, idx) => {
            const allDayEvents = getEventsForDay(day, true);
            return (
              <div key={idx} className="all-day-cell-column">
                {allDayEvents.map((event) => (
                  <div key={event.id} className="event-badge all-day-badge"
                    style={{ backgroundColor: event.color }}
                    onClick={(e) => handleEventClick(event, e)} title={event.title}>
                    {event.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrollable Grid */}
      <div className="week-grid-scrollable" ref={scrollContainerRef}>
        <div className="week-grid-body">
          <div className="time-scale-column">
            {hours.map((hour) => (
              <div key={hour} className="hour-scale-cell">
                <span className="hour-label-text">{formatHour(hour)}</span>
              </div>
            ))}
          </div>

          {/* Desktop columns */}
          <div className="week-grid-columns desktop-week">
            {weekDays.map((day, dayIdx) => {
              const timedEvents = getEventsForDay(day, false);
              return (
                <div key={dayIdx} className="week-day-grid-column">
                  {hours.map((hour) => (
                    <div key={hour} className="hour-slot-cell"
                      onClick={() => handleHourClick(day, hour)} />
                  ))}
                  {timedEvents.map((event) => {
                    const pos = getEventPosition(event);
                    return (
                      <div key={event.id} className="timed-event-card"
                        style={{ backgroundColor: event.color, top: pos.top, height: pos.height, borderLeft: '3px solid rgba(0,0,0,0.2)' }}
                        onClick={(e) => handleEventClick(event, e)}>
                        <div className="timed-event-time">{event.startTime} - {event.endTime}</div>
                        <div className="timed-event-title">{event.title}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Mobile: only visible 3 days */}
          <div className="week-grid-columns mobile-week">
            {visibleDays.map((day, dayIdx) => {
              const timedEvents = getEventsForDay(day, false);
              return (
                <div key={dayIdx} className="week-day-grid-column">
                  {hours.map((hour) => (
                    <div key={hour} className="hour-slot-cell"
                      onClick={() => handleHourClick(day, hour)} />
                  ))}
                  {timedEvents.map((event) => {
                    const pos = getEventPosition(event);
                    return (
                      <div key={event.id} className="timed-event-card"
                        style={{ backgroundColor: event.color, top: pos.top, height: pos.height, borderLeft: '3px solid rgba(0,0,0,0.2)' }}
                        onClick={(e) => handleEventClick(event, e)}>
                        <div className="timed-event-time">{event.startTime}</div>
                        <div className="timed-event-title">{event.title}</div>
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
          background-color: var(--bg-primary);
          flex-shrink: 0;
        }
        .time-column-header {
          width: 58px;
          flex-shrink: 0;
          border-right: 1px solid var(--border-color);
        }
        .week-days-headers {
          flex-grow: 1;
          display: grid;
        }
        .desktop-week { display: grid; grid-template-columns: repeat(7, 1fr); }
        .mobile-week { display: none; }

        .week-day-header-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 6px 2px;
          border-right: 1px solid var(--border-color);
          font-family: 'Mukta Malar', sans-serif;
        }
        .week-day-header-cell:last-child { border-right: none; }
        .week-day-name {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
        }
        .week-day-num {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          margin-top: 2px;
        }
        .week-day-header-cell.today .week-day-num {
          border: 2px solid var(--accent-color);
          color: var(--accent-color);
          font-weight: 800;
        }
        .all-day-row {
          display: flex;
          border-bottom: 1px solid var(--border-color);
          background-color: #f7f3e8;
          min-height: 36px;
          flex-shrink: 0;
        }
        .time-column-all-day {
          width: 58px;
          flex-shrink: 0;
          border-right: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.62rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          padding: 2px;
        }
        .all-day-cells {
          flex-grow: 1;
          display: grid;
        }
        .all-day-cell-column {
          padding: 3px;
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .all-day-cell-column:last-child { border-right: none; }
        .all-day-badge {
          font-size: 0.68rem;
          color: white !important;
          padding: 2px 4px;
          border-radius: 3px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          cursor: pointer;
          font-family: 'Mukta Malar', sans-serif;
          font-weight: 600;
        }
        .week-grid-scrollable {
          flex-grow: 1;
          overflow-y: scroll;
          overflow-x: hidden;
        }
        .week-grid-body {
          display: flex;
          position: relative;
          height: 1440px;
        }
        .time-scale-column {
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
          right: 5px;
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--text-muted);
          white-space: nowrap;
          font-family: 'Playfair Display', serif;
          background-color: var(--bg-primary);
          padding: 0 2px;
          line-height: 1;
        }
        .week-grid-columns {
          flex-grow: 1;
          position: relative;
        }
        .week-day-grid-column {
          position: relative;
          border-right: 1px solid var(--border-color);
          height: 1440px;
        }
        .week-day-grid-column:last-child { border-right: none; }
        .hour-slot-cell {
          height: 60px;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
        }
        .hour-slot-cell:hover { background-color: var(--bg-hover); }
        .timed-event-card {
          position: absolute;
          left: 2px;
          right: 2px;
          padding: 3px 5px;
          border-radius: 5px;
          color: white;
          font-size: 0.7rem;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: transform var(--transition-fast);
          z-index: 2;
        }
        .timed-event-card:hover { transform: scale(1.01); z-index: 3; }
        .timed-event-time {
          font-size: 0.62rem;
          font-weight: 700;
          opacity: 0.9;
          margin-bottom: 1px;
        }
        .timed-event-title {
          font-weight: 700;
          font-family: 'Mukta Malar', sans-serif;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .timed-event-location {
          font-size: 0.6rem;
          opacity: 0.85;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .mobile-week-nav {
          background: transparent;
          border: none;
          font-size: 1.4rem;
          color: var(--accent-color);
          cursor: pointer;
          padding: 0 4px;
          display: flex;
          align-items: center;
          flex-shrink: 0;
          font-weight: 700;
        }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .desktop-week { display: none !important; }
          .mobile-week { display: grid !important; grid-template-columns: 28px repeat(3, 1fr) 28px; }
          .all-day-cells.mobile-week { grid-template-columns: repeat(3, 1fr); }
          .time-column-header { width: 48px; }
          .time-scale-column { width: 48px; }
          .time-column-all-day { width: 48px; font-size: 0.55rem; }
          .hour-label-text { font-size: 0.58rem; right: 3px; }
          .timed-event-time { display: none; }
          .timed-event-title { font-size: 0.68rem; }
        }
      `}</style>
    </div>
  );
};
