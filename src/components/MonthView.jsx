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
    if (now - lastScrollTime.current < 550) return; // 550ms cooldown
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

  // Calendar calculations
  const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday = 0, Monday = 1
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevTotalDays = new Date(year, month, 0).getDate();

  const getDays = () => {
    const list = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      list.push({
        date: new Date(year, month - 1, prevTotalDays - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      list.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding to reach 42 cells (6 rows)
    const remaining = 42 - list.length;
    for (let i = 1; i <= remaining; i++) {
      list.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return list;
  };

  const days = getDays();
  const weekdayLabels = language === 'ta'
    ? ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி']
    : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Check if a date is today
  const isToday = (date) => {
    return formatDateString(date) === formatDateString(new Date());
  };

  // Get events on a specific day
  const getEventsForDay = (date) => {
    const dateStr = formatDateString(date);
    return filteredEvents
      .filter(event => event.startDate <= dateStr && event.endDate >= dateStr)
      .sort((a, b) => {
        // Sort: All-day events first, then by start time
        if (a.allDay && !b.allDay) return -1;
        if (!a.allDay && b.allDay) return 1;
        if (a.startTime && b.startTime) {
          return a.startTime.localeCompare(b.startTime);
        }
        return 0;
      });
  };

  const handleCellClick = (date, e) => {
    // Prevent triggering when clicking inside an event badge
    if ((e.target).closest('.event-badge')) return;

    setSelectedEventForEdit(null);
    setModalInitialDate({
      startDate: formatDateString(date),
      startTime: '09:00',
    });
    setEventModalOpen(true);
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    setSelectedEventForEdit(event);
    setEventModalOpen(true);
  };

  return (
    <div className="month-view" onWheel={handleWheel}>
      {/* Weekday headers */}
      <div className="month-grid-weekdays">
        {weekdayLabels.map((day, idx) => (
          <div key={idx} className="month-weekday-label">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="month-grid-days">
        {days.map((cell, idx) => {
          const dayEvents = getEventsForDay(cell.date);
          const isCellToday = isToday(cell.date);
          const isDateSelected = formatDateString(cell.date) === formatDateString(currentDate);

          return (
            <div
              key={idx}
              onClick={(e) => handleCellClick(cell.date, e)}
              className={`month-day-cell 
                ${cell.isCurrentMonth ? 'current-month' : 'other-month'}
                ${isCellToday ? 'today' : ''}
                ${isDateSelected ? 'selected' : ''}
              `}
            >
              <div className="cell-header">
                <span className="day-number">{cell.date.getDate()}</span>
              </div>
              
              <div className="cell-events-list">
                {dayEvents.map(event => (
                  <button
                    key={event.id}
                    onClick={(e) => handleEventClick(event, e)}
                    className="event-badge"
                    style={{
                      borderLeft: `3px solid ${event.color}`,
                      backgroundColor: `${event.color}15`,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {!event.allDay && event.startTime && (
                      <span className="event-time">{event.startTime}</span>
                    )}
                    <span className="event-title">{event.title}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .month-view {
          display: flex;
          flex-direction: column;
          height: var(--month-grid-height);
          border-radius: 16px;
          border: 1px solid var(--border-color);
          overflow: hidden;
          background-color: var(--bg-secondary);
          box-shadow: var(--shadow-md);
        }
        .month-grid-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background-color: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
          text-align: center;
        }
        .month-weekday-label {
          padding: 0.75rem 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-family: 'Mukta Malar', sans-serif;
        }
        .month-grid-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          grid-template-rows: repeat(6, 1fr);
          flex-grow: 1;
          background-color: var(--border-color);
          gap: 1px;
        }
        .month-day-cell {
          background-color: var(--bg-secondary);
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          cursor: pointer;
          min-height: 0;
          transition: background-color var(--transition-fast);
        }
        .month-day-cell.other-month {
          background-color: #f7f3e8;
          opacity: 0.65;
        }
        .month-day-cell:hover {
          background-color: var(--bg-hover);
        }
        .cell-header {
          display: flex;
          justify-content: flex-end;
          align-items: center;
        }
        .day-number {
          font-size: 0.8rem;
          font-weight: 700;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
        }
        .month-day-cell.today .day-number {
          border: 1.5px solid var(--accent-color);
          color: var(--accent-color);
          font-weight: 800;
        }
        .month-day-cell.selected {
          background-color: var(--accent-light) !important;
        }
        .cell-events-list {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 3px;
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 2px;
        }
        /* Custom scrollbar for cells list */
        .cell-events-list::-webkit-scrollbar {
          width: 3px;
        }
        .cell-events-list::-webkit-scrollbar-thumb {
          background-color: var(--border-color);
          border-radius: 4px;
        }
        .event-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.72rem;
          font-weight: 600;
          text-align: left;
          background: transparent;
          border: none;
          cursor: pointer;
          width: 100%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: transform var(--transition-fast);
        }
        .event-badge:hover {
          transform: scale(1.01) translateX(1px);
        }
        .event-time {
          font-size: 0.68rem;
          opacity: 0.75;
          flex-shrink: 0;
        }
        .event-title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-family: 'Mukta Malar', sans-serif;
        }
        @media (max-width: 768px) {
          .month-weekday-label {
            font-size: 0.68rem;
            padding: 0.5rem 0.2rem;
          }
          .event-badge {
            padding: 1px 3px;
            font-size: 0.65rem;
          }
          .event-time {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
