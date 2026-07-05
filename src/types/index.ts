export type Category = 'work' | 'personal' | 'health' | 'leisure' | 'family' | 'holiday';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string; // format YYYY-MM-DD
  endDate: string; // format YYYY-MM-DD
  startTime?: string; // format HH:MM
  endTime?: string; // format HH:MM
  allDay: boolean;
  category: Category;
  color: string; // hex color code
  location?: string;
}

export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export interface CategoryOption {
  value: Category;
  label: string;
  color: string;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 'holiday', label: 'பண்டிகை', color: '#b8583c' },
  { value: 'work', label: 'வேலை', color: '#4a7c59' },
  { value: 'personal', label: 'பிறந்தநாள்', color: '#8a63a5' },
  { value: 'family', label: 'குடும்பம்', color: '#c69c3a' },
  { value: 'leisure', label: 'மற்றவை', color: '#8b7d6b' },
];
