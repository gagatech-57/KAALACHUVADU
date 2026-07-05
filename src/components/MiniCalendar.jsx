import React, { useState, useEffect } from 'react';
import { useCalendar, formatDateString } from '../context/CalendarContext';

export const MiniCalendar = () => {
  const { currentDate, setCurrentDate, language } = useCalendar();
  const [viewDate, setViewDate] = useState(new Date(currentDate));

  // Sync viewDate when currentDate changes globally
  useEffect(() => {
    setViewDate(new Date(currentDate));
  }, [currentDate]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  // Generate calendar days
  const getDaysArray = () => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevTotalDays = new Date(year, month, 0).getDate();

    const daysList = [];

    // Prev month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      daysList.push({
        date: new Date(year, month - 1, prevTotalDays - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      daysList.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month days to pad to 42 cells (6 rows)
    const remainingCells = 42 - daysList.length;
    for (let i = 1; i <= remainingCells; i++) {
      daysList.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return daysList;
  };

  const days = getDaysArray();
  const monthNames = language === 'ta' ? [
    'ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்',
    'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'
  ] : [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdayNames = language === 'ta' 
    ? ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச']
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const isToday = (date) => {
    return formatDateString(date) === formatDateString(new Date());
  };

  const isSelected = (date) => {
    return formatDateString(date) === formatDateString(currentDate);
  };

  return (
    <div className="mini-calendar">
      <div className="mini-cal-header">
        <span className="mini-cal-title">
          {monthNames[month]} {year}
        </span>
        <div className="mini-cal-nav">
          <button className="mini-cal-btn" onClick={handlePrevMonth} title="Previous Month">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          <button className="mini-cal-btn" onClick={handleNextMonth} title="Next Month">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        </div>
      </div>

      <div className="mini-cal-weekdays">
        {weekdayNames.map((day, idx) => (
          <div key={idx} className="mini-cal-weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="mini-cal-days">
        {days.map((cell, idx) => {
          const isCellToday = isToday(cell.date);
          const isCellSelected = isSelected(cell.date);
          
          return (
            <button
              key={idx}
              onClick={() => setCurrentDate(cell.date)}
              className={`mini-cal-day-cell 
                ${cell.isCurrentMonth ? 'current-month' : 'other-month'}
                ${isCellToday ? 'today' : ''}
                ${isCellSelected ? 'selected' : ''}
              `}
            >
              {cell.date.getDate()}
            </button>
          );
        })}
      </div>

      <style>{`
        .mini-calendar {
          width: 100%;
          padding: 8px;
          background-color: var(--bg-secondary);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
        }
        .mini-cal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          padding: 0 4px;
        }
        .mini-cal-title {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .mini-cal-nav {
          display: flex;
          gap: 2px;
        }
        .mini-cal-btn {
          border: none;
          background: transparent;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        .mini-cal-btn:hover {
          background-color: var(--bg-hover);
          color: var(--text-primary);
        }
        .mini-cal-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          margin-bottom: 4px;
        }
        .mini-cal-weekday {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--text-muted);
          padding: 4px 0;
        }
        .mini-cal-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
        }
        .mini-cal-day-cell {
          border: none;
          background: transparent;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: inherit;
          font-size: 0.75rem;
          font-weight: 600;
          border-radius: 50%;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .mini-cal-day-cell.current-month {
          color: var(--text-primary);
        }
        .mini-cal-day-cell.other-month {
          color: var(--text-muted);
          opacity: 0.5;
        }
        .mini-cal-day-cell:hover {
          background-color: var(--bg-hover);
        }
        .mini-cal-day-cell.today {
          border: 1.5px solid var(--accent-color);
          color: var(--accent-color);
          font-weight: 700;
        }
        .mini-cal-day-cell.selected {
          background-color: var(--accent-color) !important;
          color: var(--bg-secondary) !important;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
};
