import React, { useState, useEffect } from 'react';
import { useCalendar } from '../context/CalendarContext';
import { CATEGORY_OPTIONS } from '../types';

export const EventModal = () => {
  const {
    isEventModalOpen,
    setEventModalOpen,
    selectedEventForEdit,
    setSelectedEventForEdit,
    modalInitialDate,
    addEvent,
    updateEvent,
    deleteEvent,
  } = useCalendar();

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('work');
  const [color, setColor] = useState('#6366f1');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  // Error states
  const [errors, setErrors] = useState({});

  // Sync category colors
  useEffect(() => {
    const selectedOption = CATEGORY_OPTIONS.find(c => c.value === category);
    if (selectedOption) {
      setColor(selectedOption.color);
    }
  }, [category]);

  // Load event details when modal opens/changes
  useEffect(() => {
    if (isEventModalOpen) {
      setErrors({});
      if (selectedEventForEdit) {
        // Edit mode
        setTitle(selectedEventForEdit.title);
        setCategory(selectedEventForEdit.category);
        setColor(selectedEventForEdit.color);
        setStartDate(selectedEventForEdit.startDate);
        setEndDate(selectedEventForEdit.endDate);
        setStartTime(selectedEventForEdit.startTime || '09:00');
        setEndTime(selectedEventForEdit.endTime || '10:00');
        setAllDay(selectedEventForEdit.allDay);
        setLocation(selectedEventForEdit.location || '');
        setDescription(selectedEventForEdit.description || '');
      } else {
        // Create mode
        setTitle('');
        setCategory('work');
        const defaultColor = CATEGORY_OPTIONS.find(c => c.value === 'work')?.color || '#6366f1';
        setColor(defaultColor);
        setLocation('');
        setDescription('');
        
        if (modalInitialDate) {
          setStartDate(modalInitialDate.startDate);
          setEndDate(modalInitialDate.startDate);
          const start = modalInitialDate.startTime || '09:00';
          setStartTime(start);
          
          // Set end time 1 hour later
          const [h, m] = start.split(':').map(Number);
          const nextHour = String((h + 1) % 24).padStart(2, '0');
          setEndTime(`${nextHour}:${String(m).padStart(2, '0')}`);
          setAllDay(false);
        } else {
          const todayStr = new Date().toISOString().split('T')[0];
          setStartDate(todayStr);
          setEndDate(todayStr);
          setStartTime('09:00');
          setEndTime('10:00');
          setAllDay(false);
        }
      }
    }
  }, [isEventModalOpen, selectedEventForEdit, modalInitialDate]);

  const handleClose = () => {
    setEventModalOpen(false);
    setSelectedEventForEdit(null);
  };

  // Basic validation rules
  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'நிகழ்ச்சியின் தலைப்பு தேவை';
    }

    if (!startDate) {
      newErrors.startDate = 'துவக்க தேதி தேவை';
    }

    if (!endDate) {
      newErrors.endDate = 'முடிவு தேதி தேவை';
    }

    if (startDate && endDate && startDate > endDate) {
      newErrors.endDate = 'முடிவு தேதி துவக்க தேதிக்கு முன்னதாக இருக்க முடியாது';
    }

    if (!allDay) {
      if (!startTime) newErrors.startTime = 'துவக்க நேரம் தேவை';
      if (!endTime) newErrors.endTime = 'முடிவு நேரம் தேவை';
      
      if (startDate === endDate && startTime && endTime && startTime >= endTime) {
        newErrors.endTime = 'முடிவு நேரம் துவக்க நேரத்திற்குப் பின் இருக்க வேண்டும்';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const eventPayload = {
      title: title.trim(),
      category,
      color,
      startDate,
      endDate,
      allDay,
      startTime: allDay ? undefined : startTime,
      endTime: allDay ? undefined : endTime,
      location: location.trim() || undefined,
      description: description.trim() || undefined,
    };

    if (selectedEventForEdit) {
      updateEvent({
        ...eventPayload,
        id: selectedEventForEdit.id,
      });
    } else {
      addEvent(eventPayload);
    }

    handleClose();
  };

  const handleDelete = () => {
    if (selectedEventForEdit) {
      if (window.confirm('இந்த நிகழ்வை நிச்சயமாக நீக்க வேண்டுமா?')) {
        deleteEvent(selectedEventForEdit.id);
        handleClose();
      }
    }
  };

  if (!isEventModalOpen) return null;

  // Swatches for color picking override
  const colorSwatches = [
    '#6366f1', // Indigo
    '#3b82f6', // Blue
    '#06b6d4', // Cyan
    '#10b981', // Emerald
    '#84cc16', // Lime
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#ec4899', // Pink
    '#a855f7', // Purple
    '#64748b', // Slate
  ];

  return (
    <div className={`modal-overlay ${isEventModalOpen ? 'open' : ''}`} onClick={handleClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {selectedEventForEdit ? 'நிகழ்ச்சியைத் திருத்தவும்' : 'புதிய நிகழ்வைச் சேர்க்கவும்'}
          </h2>
          <button className="btn btn-icon btn-text modal-close-btn" onClick={handleClose} title="மூடு">
            &times;
          </button>
        </div>

        <form id="event-form" onSubmit={handleSave} className="modal-form">
          {/* Title Field */}
          <div className="form-group">
            <label className="form-label">நிகழ்ச்சியின் தலைப்பு *</label>
            <input
              type="text"
              placeholder="உதாரணம்: வாராந்திர ஒத்திசைவு"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`form-input title-input ${errors.title ? 'error' : ''}`}
              maxLength={80}
              autoFocus
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          {/* Grid for Category and Color selection */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">வகை</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-input"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group flex-1">
              <label className="form-label">விருப்ப நிறம்</label>
              <div className="color-swatch-picker">
                <div className="active-color-preview" style={{ backgroundColor: color }} />
                <div className="swatches-grid">
                  {colorSwatches.map((swatch) => (
                    <button
                      key={swatch}
                      type="button"
                      className={`swatch-btn ${color === swatch ? 'active' : ''}`}
                      style={{ backgroundColor: swatch }}
                      onClick={() => setColor(swatch)}
                      title={swatch}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Checkbox for All Day */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="checkbox-input"
              />
              <span className="checkbox-custom-indicator" />
              <span className="checkbox-text">நாள் முழுவதும்</span>
            </label>
          </div>

          {/* Date and Time Row */}
          <div className="form-row">
            <div className="form-group flex-1">
              <label className="form-label">துவக்க தேதி *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`form-input ${errors.startDate ? 'error' : ''}`}
              />
              {errors.startDate && <span className="error-text">{errors.startDate}</span>}
            </div>

            <div className="form-group flex-1">
              <label className="form-label">முடிவு தேதி *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`form-input ${errors.endDate ? 'error' : ''}`}
              />
              {errors.endDate && <span className="error-text">{errors.endDate}</span>}
            </div>
          </div>

          {/* Time fields, hidden if allDay is true */}
          {!allDay && (
            <div className="form-row">
              <div className="form-group flex-1">
                <label className="form-label">துவக்க நேரம் *</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={`form-input ${errors.startTime ? 'error' : ''}`}
                />
                {errors.startTime && <span className="error-text">{errors.startTime}</span>}
              </div>

              <div className="form-group flex-1">
                <label className="form-label">முடிவு நேரம் *</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={`form-input ${errors.endTime ? 'error' : ''}`}
                />
                {errors.endTime && <span className="error-text">{errors.endTime}</span>}
              </div>
            </div>
          )}

          {/* Location Field */}
          <div className="form-group">
            <label className="form-label">இடம்</label>
            <input
              type="text"
              placeholder="உதாரணம்: சந்திப்பு அறை அல்லது இணைய இணைப்பு"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="form-input"
              maxLength={120}
            />
          </div>

          {/* Description Field */}
          <div className="form-group">
            <label className="form-label">விளக்கம்</label>
            <textarea
              placeholder="நிகழ்வின் விவரங்களை உள்ளிடவும்..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input form-textarea"
              maxLength={500}
              rows={3}
            />
          </div>
        </form>

        {/* Modal Actions — sticky footer outside the scrollable form */}
        <div className="modal-actions-footer">
          {selectedEventForEdit && (
            <button
              type="button"
              className="btn btn-delete-modal"
              onClick={handleDelete}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              நீக்கு
            </button>
          )}
          <div className="right-action-btns">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              ரத்து செய்
            </button>
            <button type="submit" form="event-form" className="btn btn-primary">
              நிகழ்வைச் சேமி
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .modal-container {
          display: flex;
          flex-direction: column;
          max-height: 90vh;
        }
        .modal-header {
          padding: 1rem 1.2rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
        }
        .modal-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          font-family: 'Mukta Malar', sans-serif;
        }
        .modal-close-btn {
          width: 32px;
          height: 32px;
          font-size: 1.4rem;
          line-height: 1;
          flex-shrink: 0;
        }
        .modal-form {
          padding: 1.2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
          flex-grow: 1;
          overscroll-behavior: contain;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .form-row {
          display: flex;
          gap: 10px;
        }
        .flex-1 { flex: 1; min-width: 0; }
        .form-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .form-input {
          width: 100%;
          padding: 0.6rem 0.75rem;
          border-radius: 10px;
          border: 1px solid var(--border-color);
          background-color: var(--bg-primary);
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.9rem;
          outline: none;
          transition: all var(--transition-fast);
          min-width: 0;
        }
        .form-input:focus {
          border-color: var(--accent-color);
          box-shadow: 0 0 0 2px var(--accent-light);
        }
        .form-input.error { border-color: #ef4444; }
        .form-input.error:focus { box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.15); }
        .title-input { font-size: 1rem; font-weight: 500; }
        .form-textarea { resize: none; }
        .error-text { font-size: 0.75rem; color: #ef4444; font-weight: 500; }
        .checkbox-group { padding: 2px 0; }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          color: var(--text-primary);
          user-select: none;
        }
        .checkbox-input { display: none; }
        .checkbox-custom-indicator {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 2px solid var(--text-muted);
          display: inline-block;
          position: relative;
          flex-shrink: 0;
          transition: all var(--transition-fast);
        }
        .checkbox-input:checked + .checkbox-custom-indicator {
          border-color: var(--accent-color);
          background-color: var(--accent-color);
        }
        .checkbox-input:checked + .checkbox-custom-indicator::after {
          content: "";
          position: absolute;
          left: 5px; top: 2px;
          width: 4px; height: 8px;
          border: solid white;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        .checkbox-text { font-weight: 600; }
        .color-swatch-picker {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          min-height: 34px;
        }
        .active-color-preview {
          width: 22px; height: 22px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 0 1px var(--text-muted);
          flex-shrink: 0;
        }
        .swatches-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }
        .swatch-btn {
          width: 20px; height: 20px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.1);
          cursor: pointer;
          transition: transform var(--transition-fast);
        }
        .swatch-btn:hover { transform: scale(1.18); }
        .swatch-btn.active { box-shadow: 0 0 0 2px var(--bg-secondary), 0 0 0 3.5px var(--accent-color); }

        /* Sticky footer for action buttons */
        .modal-actions-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--border-color);
          padding: 0.9rem 1.2rem;
          flex-shrink: 0;
          background-color: var(--bg-secondary);
        }
        .right-action-btns { display: flex; gap: 8px; margin-left: auto; }
        .btn-delete-modal {
          color: #ef4444;
          background: transparent;
          border-color: rgba(239, 68, 68, 0.2);
        }
        .btn-delete-modal:hover {
          background-color: rgba(239, 68, 68, 0.08);
          border-color: #ef4444;
        }

        /* ── Mobile: full bottom sheet ── */
        @media (max-width: 640px) {
          .modal-container {
            max-height: 92vh;
            border-radius: 20px 20px 0 0;
          }
          .modal-form {
            padding: 1rem;
            gap: 0.85rem;
          }
          .form-row {
            flex-direction: column;
            gap: 0.85rem;
          }
          .modal-actions-footer {
            padding: 0.75rem 1rem;
          }
          .btn { font-size: 0.85rem; padding: 0.55rem 0.9rem; }
        }
      `}</style>
    </div>
  );
};
