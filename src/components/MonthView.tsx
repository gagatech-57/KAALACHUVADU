import React from 'react';
import { useCalendar, formatDateString } from '../context/CalendarContext';
import type { CalendarEvent } from '../types';

export const MonthView: React.FC = () => {
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

  const handleWheel = (e: React.WheelEvent) => {
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
    const list: { date: Date; isCurrentMonth: boolean }[] = [];

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
  const isToday = (date: Date) => {
    return formatDateString(date) === formatDateString(new Date());
  };

  // Get events on a specific day
  const getEventsForDay = (date: Date) => {
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

  const handleCellClick = (date: Date, e: React.MouseEvent) => {
    // Avoid opening new event if clicking on an event badge or "+ more" button
    const target = e.target as HTMLElement;
    if (target.closest('.event-badge') || target.closest('.more-events-indicator')) {
      return;
    }

    setSelectedEventForEdit(null);
    setModalInitialDate({
      startDate: formatDateString(date),
      startTime: '09:00',
    });
    setEventModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEventForEdit(event);
    setEventModalOpen(true);
  };

  const handleMoreClick = (date: Date, e: React.MouseEvent) => {
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
            <span className="abbr-weekday">{day.substring(0, 3)}</span>
          </div>
        ))}

        {/* Days grid cells */}
        {days.map((item, idx) => {
          const dayEvents = getEventsForDay(item.date);
          const visibleEvents = dayEvents.slice(0, 3);
          const extraEventsCount = dayEvents.length - 3;
          const cellIsToday = isToday(item.date);

          return (
            <div
              key={idx}
              className={`month-cell ${!item.isCurrentMonth ? 'outside' : ''} ${
                cellIsToday ? 'today' : ''
              }`}
              onClick={(e) => handleCellClick(item.date, e)}
            >
              <div className="day-number-container">
                <span className="day-number">{item.date.getDate()}</span>
              </div>
              <div className="cell-events-container">
                {visibleEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`event-badge ${event.allDay ? 'all-day' : ''}`}
                    style={{ backgroundColor: event.color }}
                    onClick={() => handleEventClick(event)}
                    title={`${event.title} ${
                      event.allDay
                        ? '(All Day)'
                        : `(${event.startTime} - ${event.endTime})`
                    }`}
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
                    + {extraEventsCount} more
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
        }
        .full-weekday {
          display: inline;
        }
        .abbr-weekday {
          display: none;
        }
        .cell-events-container {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .event-badge-time {
          font-weight: 600;
          margin-right: 4px;
          opacity: 0.85;
        }
        .event-badge-title {
          font-weight: 500;
        }
        @media (max-width: 1024px) {
          .full-weekday {
            display: none;
          }
          .abbr-weekday {
            display: inline;
          }
        }
        @media (max-width: 768px) {
          .month-cell {
            min-height: 70px;
            padding: 4px;
          }
          .day-number-container {
            margin-bottom: 2px;
          }
          .event-badge {
            font-size: 0.7rem;
            padding: 2px 4px;
            margin-bottom: 2px;
          }
          .event-badge-time {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};
