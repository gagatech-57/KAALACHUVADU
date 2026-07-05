import React from 'react';
import { useCalendar, formatDateString } from '../context/CalendarContext';

export const MonthView = () => {
  const {
    currentDate,
    setCurrentDate,
    setCurrentView,
    filteredEvents,
    setEventModalOpen,
    setSelectedEventForEdit,
    setModalInitialDate,
    navigatePrev,
    navigateNext,
    language,
  } = useCalendar();

  const lastScrollTime = React.useRef(0);

  const handleWheel = (e) => {
    const now = Date.now();
    if (now - lastScrollTime.current < 550) return;
    if (Math.abs(e.deltaY) < 25) return;
    if (e.deltaY > 0) {
      navigateNext();
      lastScrollTime.current = now;
    } else if (e.deltaY < 0) {
      navigatePrev();
      lastScrollTime.current = now;
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevTotalDays = new Date(year, month, 0).getDate();

  const getDays = () => {
    const list = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      list.push({ date: new Date(year, month - 1, prevTotalDays - i), isCurrentMonth: false });
    }
    for (let i = 1; i <= totalDays; i++) {
      list.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const remaining = 42 - list.length;
    for (let i = 1; i <= remaining; i++) {
      list.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return list;
  };

  const days = getDays();
  const weekdayLabels = language === 'ta'
    ? ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const isToday = (date) => formatDateString(date) === formatDateString(new Date());

  const getEventsForDay = (date) => {
    const dateStr = formatDateString(date);
    return filteredEvents
      .filter(e => e.startDate <= dateStr && e.endDate >= dateStr)
      .sort((a, b) => {
        if (a.allDay && !b.allDay) return -1;
        if (!a.allDay && b.allDay) return 1;
        if (a.startTime && b.startTime) return a.startTime.localeCompare(b.startTime);
        return 0;
      });
  };

  const handleCellClick = (date, e) => {
    const target = e.target;
    if (target.closest('.event-badge') || target.closest('.more-events-indicator')) return;
    setSelectedEventForEdit(null);
    setModalInitialDate({ startDate: formatDateString(date), startTime: '09:00' });
    setEventModalOpen(true);
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    setSelectedEventForEdit(event);
    setEventModalOpen(true);
  };

  const handleMoreClick = (date, e) => {
    e.stopPropagation();
    setCurrentDate(date);
    setCurrentView('day');
  };

  return (
    <div className="month-grid-container" onWheel={handleWheel}>
      <div className="month-grid">
        {/* Weekday headers */}
        {weekdayLabels.map((day) => (
          <div key={day} className="day-label" title={day}>
            <span className="full-weekday">{day}</span>
            <span className="abbr-weekday">{day.substring(0, 2)}</span>
          </div>
        ))}

        {/* Day cells */}
        {days.map((item, idx) => {
          const dayEvents = getEventsForDay(item.date);
          const visibleEvents = dayEvents.slice(0, 3);
          const extraEventsCount = dayEvents.length - 3;
          const cellIsToday = isToday(item.date);

          return (
            <div
              key={idx}
              className={`month-cell${!item.isCurrentMonth ? ' outside' : ''}${cellIsToday ? ' today' : ''}`}
              onClick={(e) => handleCellClick(item.date, e)}
            >
              <div className="day-number-container">
                <span className="day-number">{item.date.getDate()}</span>
              </div>
              <div className="cell-events-container">
                {visibleEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`event-badge${event.allDay ? ' all-day' : ''}`}
                    style={{ backgroundColor: event.color }}
                    onClick={(e) => handleEventClick(event, e)}
                    title={event.title}
                  >
                    {!event.allDay && event.startTime && (
                      <span className="event-badge-time">{event.startTime} </span>
                    )}
                    <span className="event-badge-title">{event.title}</span>
                  </div>
                ))}
                {extraEventsCount > 0 && (
                  <div
                    className="more-events-indicator"
                    onClick={(e) => handleMoreClick(item.date, e)}
                  >
                    + {extraEventsCount} {language === 'ta' ? 'மேலும்' : 'more'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .month-grid-container {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
          border-radius: 16px;
          border: 1px solid var(--border-color);
          background-color: var(--bg-secondary);
          box-shadow: var(--shadow-md);
        }
        .month-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          grid-template-rows: auto repeat(6, 1fr);
          flex-grow: 1;
          height: 100%;
          border-collapse: collapse;
        }
        .day-label {
          padding: 0.65rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-family: 'Mukta Malar', sans-serif;
          text-align: center;
          background-color: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          border-right: 1px solid var(--border-color);
        }
        .day-label:last-of-type {
          border-right: none;
        }
        .full-weekday { display: inline; }
        .abbr-weekday { display: none; }
        .month-cell {
          border-right: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          padding: 6px 6px 4px 6px;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
          cursor: pointer;
          background-color: var(--bg-secondary);
          transition: background-color var(--transition-fast);
        }
        .month-cell:nth-child(7n) {
          border-right: none;
        }
        .month-cell:hover {
          background-color: var(--bg-hover);
        }
        .month-cell.outside {
          background-color: #f7f3e8;
          opacity: 0.65;
        }
        .month-cell.today .day-number {
          background-color: var(--accent-color);
          color: var(--bg-secondary);
          font-weight: 800;
        }
        .day-number-container {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          margin-bottom: 3px;
          flex-shrink: 0;
        }
        .day-number {
          font-size: 0.82rem;
          font-weight: 700;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
          line-height: 1;
        }
        .cell-events-container {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 2px;
          overflow: hidden;
          min-height: 0;
        }
        .event-badge {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.72rem;
          font-weight: 600;
          color: #fff;
          text-align: left;
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          border: none;
          flex-shrink: 0;
          transition: opacity var(--transition-fast), transform var(--transition-fast);
          font-family: 'Mukta Malar', sans-serif;
          line-height: 1.6;
        }
        .event-badge:hover {
          opacity: 0.88;
          transform: translateX(1px);
        }
        .event-badge-time {
          font-weight: 700;
          margin-right: 3px;
          opacity: 0.9;
          flex-shrink: 0;
          font-size: 0.66rem;
        }
        .event-badge-title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          min-width: 0;
        }
        .more-events-indicator {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--text-muted);
          padding: 1px 4px;
          cursor: pointer;
          border-radius: 4px;
          white-space: nowrap;
          flex-shrink: 0;
          font-family: 'Mukta Malar', sans-serif;
          transition: color var(--transition-fast);
        }
        .more-events-indicator:hover {
          color: var(--accent-color);
          background-color: var(--accent-light);
        }

        @media (max-width: 1024px) {
          .full-weekday { display: none; }
          .abbr-weekday { display: inline; }
        }
        @media (max-width: 768px) {
          .month-cell { padding: 3px; }
          .day-number { font-size: 0.72rem; width: 20px; height: 20px; }
          .event-badge { font-size: 0.65rem; padding: 1px 3px; }
          .event-badge-time { display: none; }
          .more-events-indicator { font-size: 0.62rem; }
        }
      `}</style>
    </div>
  );
};
