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

  // Format hour label
  const formatHour = (hour) => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    return hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
  };

  const isToday = (date) => {
    return formatDateString(date) === formatDateString(new Date());
  };

  // Filter and group events
  const getEventsForDay = (date, allDay) => {
    const dateStr = formatDateString(date);
    return filteredEvents.filter((event) => {
      const matchesDate = event.startDate <= dateStr && event.endDate >= dateStr;
      return matchesDate && event.allDay === allDay;
    });
  };

  // Position calculations for timed events
  const getEventPosition = (event) => {
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

  const handleHourClick = (date, hour) => {
    setSelectedEventForEdit(null);
    const hourStr = String(hour).padStart(2, '0');
    setModalInitialDate({
      startDate: formatDateString(date),
      startTime: `${hourStr}:00`,
    });
    setEventModalOpen(true);
  };

  const handleEventClick = (event, e) => {
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
        <div className="time-column-all-day">{language === 'ta' ? "முழு நாள்" : "All Day"}</div>
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
          background-color: var(--bg-primary);
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
          padding: 8px 4px;
          border-right: 1px solid var(--border-color);
          font-family: 'Mukta Malar', sans-serif;
        }
        .week-day-header-cell:last-child {
          border-right: none;
        }
        .week-day-name {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
        }
        .week-day-num {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          margin-top: 2px;
        }
        .week-day-header-cell.today .week-day-num {
          border: 1.5px solid var(--accent-color);
          color: var(--accent-color);
          font-weight: 800;
        }
        .all-day-row {
          display: flex;
          border-bottom: 1px solid var(--border-color);
          background-color: #f7f3e8;
          min-height: 40px;
        }
        .time-column-all-day {
          width: 60px;
          flex-shrink: 0;
          border-right: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .all-day-cells {
          flex-grow: 1;
          display: grid;
          grid-template-columns: repeat(7, 1fr);
        }
        .all-day-cell-column {
          padding: 4px;
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-height: 0;
        }
        .all-day-cell-column:last-child {
          border-right: none;
        }
        .all-day-badge {
          font-size: 0.72rem;
          color: white !important;
          padding: 2px 6px;
          border-radius: 4px;
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
          background-color: var(--bg-secondary);
        }
        .week-grid-body {
          display: flex;
          position: relative;
          height: 1440px; /* 24 hours * 60px */
        }
        .time-scale-column {
          width: 60px;
          flex-shrink: 0;
          border-right: 1px solid var(--border-color);
          background-color: var(--bg-primary);
          user-select: none;
        }
        .hour-scale-cell {
          height: 60px;
          display: flex;
          justify-content: flex-end;
          padding-right: 6px;
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 600;
          position: relative;
        }
        .hour-scale-cell span {
          position: absolute;
          top: -6px;
        }
        .week-grid-columns {
          flex-grow: 1;
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          position: relative;
        }
        .week-day-grid-column {
          position: relative;
          border-right: 1px solid var(--border-color);
          height: 1440px;
        }
        .week-day-grid-column:last-child {
          border-right: none;
        }
        .hour-slot-cell {
          height: 60px;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
        }
        .hour-slot-cell:hover {
          background-color: var(--bg-hover);
        }
        .timed-event-card {
          position: absolute;
          left: 4px;
          right: 4px;
          padding: 4px 6px;
          border-radius: 6px;
          color: white;
          font-size: 0.72rem;
          overflow: hidden;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
          z-index: 2;
        }
        .timed-event-card:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          z-index: 3;
        }
        .timed-event-time {
          font-size: 0.65rem;
          font-weight: 700;
          opacity: 0.85;
          margin-bottom: 2px;
        }
        .timed-event-title {
          font-weight: 700;
          margin-bottom: 2px;
          font-family: 'Mukta Malar', sans-serif;
          line-height: 1.2;
        }
        .timed-event-location {
          font-size: 0.65rem;
          opacity: 0.85;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </div>
  );
};
