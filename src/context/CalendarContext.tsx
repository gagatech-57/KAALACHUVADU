import React, { createContext, useContext, useState, useEffect } from 'react';
import { CATEGORY_OPTIONS } from '../types';
import type { CalendarEvent, CalendarView, Category } from '../types';

interface CalendarContextType {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  currentView: CalendarView;
  setCurrentView: (view: CalendarView) => void;
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (event: CalendarEvent) => void;
  deleteEvent: (id: string) => void;
  selectedCategories: Category[];
  toggleCategory: (category: Category) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  selectedEventForEdit: CalendarEvent | null;
  setSelectedEventForEdit: (event: CalendarEvent | null) => void;
  isEventModalOpen: boolean;
  setEventModalOpen: (open: boolean) => void;
  modalInitialDate: { startDate: string; startTime?: string } | null;
  setModalInitialDate: (val: { startDate: string; startTime?: string } | null) => void;
  filteredEvents: CalendarEvent[];
  importEvents: (importedEvents: CalendarEvent[]) => boolean;
  navigatePrev: () => void;
  navigateNext: () => void;
  language: 'ta' | 'en';
  setLanguage: (lang: 'ta' | 'en') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

// Helper to format Date to YYYY-MM-DD local string
export const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const seededEventTranslations: Record<string, { title: { ta: string; en: string }; description?: { ta: string; en: string }; location?: { ta: string; en: string } }> = {
  'in-1': {
    title: { ta: 'குடியரசு தினம்', en: 'Republic Day' },
    description: { ta: 'இந்திய அரசியலமைப்பு சட்டம் நடைமுறைக்கு வந்த நாள்.', en: 'Adoption of the Constitution of India.' },
    location: { ta: 'இந்தியா (நாடு தழுவியது)', en: 'India (National)' }
  },
  'in-2': {
    title: { ta: 'மகா சிவராத்திரி', en: 'Maha Shivaratri' },
    description: { ta: 'சிவன் வழிபாட்டிற்குரிய முக்கிய இந்து திருவிழா.', en: 'Great night of Shiva, a major Hindu festival.' },
    location: { ta: 'இந்தியா (நாடு தழுவியது)', en: 'India (National)' }
  },
  'in-3': {
    title: { ta: 'ஹோலி', en: 'Holi' },
    description: { ta: 'வண்ணங்களின் திருவிழா.', en: 'Festival of colors.' },
    location: { ta: 'இந்தியா (நாடு தழுவியது)', en: 'India (National)' }
  },
  'in-4': {
    title: { ta: 'ரம்சான் (ஈகைப் பெருநாள்)', en: 'Ramzan (Eid-ul-Fitr)' },
    description: { ta: 'ரமலான் நோன்பு முடிவைக் குறிக்கும் இஸ்லாமிய திருவிழா.', en: 'Islamic festival marking the end of Ramadan.' },
    location: { ta: 'இந்தியா (நாடு தழுவியது)', en: 'India (National)' }
  },
  'in-5': {
    title: { ta: 'ராம நவமி', en: 'Rama Navami' },
    description: { ta: 'ஸ்ரீ ராமரின் பிறப்பைக் கொண்டாடும் திருவிழா.', en: 'Festival celebrating the birth of Lord Rama.' },
    location: { ta: 'இந்தியா (நாடு தழுவியது)', en: 'India (National)' }
  },
  'in-6': {
    title: { ta: 'மகாவீர் ஜெயந்தி', en: 'Mahavir Jayanti' },
    description: { ta: 'மகாவீரரின் பிறப்பைக் கொண்டாடும் சமண திருவிழா.', en: 'Jain festival celebrating the birth of Mahavira.' },
    location: { ta: 'இந்தியா (நாடு தழுவியது)', en: 'India (National)' }
  },
  'in-7': {
    title: { ta: 'புனித வெள்ளி', en: 'Good Friday' },
    description: { ta: 'இயேசு கிறிஸ்துவின் சிலுவை மரணத்தை நினைவுகூரும் நாள்.', en: 'Day commemorating the crucifixion of Jesus Christ.' },
    location: { ta: 'இந்தியா (நாடு தழுவியது)', en: 'India (National)' }
  },
  'in-8': {
    title: { ta: 'புத்த பூர்ணிமா', en: 'Buddha Purnima' },
    description: { ta: 'புத்தரின் பிறப்பு மற்றும் ஞானம் பெற்ற நாளைக் கொண்டாடும் விழா.', en: 'Festival celebrating the birth and enlightenment of Buddha.' },
    location: { ta: 'இந்தியா (நாடு தழுவியது)', en: 'India (National)' }
  },
  'in-9': {
    title: { ta: 'பக்ரீத் (தியாகத் திருநாள்)', en: 'Bakrid (Eid-al-Adha)' },
    description: { ta: 'இஸ்லாமிய தியாகத் திருநாள்.', en: 'Islamic festival of sacrifice.' },
    location: { ta: 'இந்தியா (நாடு தழுவியது)', en: 'India (National)' }
  },
  'in-10': {
    title: { ta: 'மொஹரம்', en: 'Muharram' },
    description: { ta: 'இஸ்லாமிய புத்தாண்டுத் தொடக்கம்.', en: 'Islamic New Year.' },
    location: { ta: 'இந்தியா (நாடு தழுவியது)', en: 'India (National)' }
  },
  'in-11': {
    title: { ta: 'சுதந்திர தினம்', en: 'Independence Day' },
    description: { ta: 'இந்தியாவின் சுதந்திர நாள் கொண்டாட்டம்.', en: 'Indian Independence Day.' },
    location: { ta: 'இந்தியா (நாடு தழுவியது)', en: 'India (National)' }
  },
  'in-12': {
    title: { ta: 'மிலாத் நபி', en: 'Milad-un-Nabi' },
    description: { ta: 'நபிகள் நாயகத்தின் பிறந்தநாள்.', en: 'Birthday of Prophet Muhammad.' },
    location: { ta: 'இந்தியா (நாடு தழுவியது)', en: 'India (National)' }
  },
  'in-13': {
    title: { ta: 'கிருஷ்ண ஜெயந்தி', en: 'Krishna Janmashtami' },
    description: { ta: 'ஸ்ரீ கிருஷ்ணரின் அவதார தினம்.', en: 'Festival celebrating the birth of Lord Krishna.' },
    location: { ta: 'இந்தியா (நாடு தழுவியது)', en: 'India (National)' }
  },
  'in-14': {
    title: { ta: 'காந்தி ஜெயந்தி', en: 'Gandhi Jayanti' },
    description: { ta: 'மகாத்மா காந்தியின் பிறந்தநாள்.', en: 'Birthday of Mahatma Gandhi.' },
    location: { ta: 'இந்தியா (நாடு தழுவியது)', en: 'India (National)' }
  },
  'in-15': {
    title: { ta: 'விஜயதசமி (தசரா)', en: 'Vijayadashami (Dussehra)' },
    description: { ta: 'தீமையின் மீது நன்மைகள் வென்ற நாள்.', en: 'Festival celebrating the victory of good over evil.' },
    location: { ta: 'இந்தியா (நாடு தழுவியது)', en: 'India (National)' }
  },
  'in-16': {
    title: { ta: 'தீபாவளி', en: 'Diwali' },
    description: { ta: 'ஒளியின் திருவிழா.', en: 'Festival of lights.' },
    location: { ta: 'இந்தியா (நாடு தழுவியது)', en: 'India (National)' }
  },
  'in-17': {
    title: { ta: 'குரு நானக் ஜெயந்தி', en: 'Guru Nanak Jayanti' },
    description: { ta: 'குரு நானக் தேவ் பிறந்தநாள்.', en: 'Birthday of Guru Nanak.' },
    location: { ta: 'இந்தியா (நாடு தழுவியது)', en: 'India (National)' }
  },
  'in-18': {
    title: { ta: 'கிறிஸ்துமஸ்', en: 'Christmas' },
    description: { ta: 'இயேசு கிறிஸ்துவின் பிறந்தநாள்.', en: 'Birthday of Jesus Christ.' },
    location: { ta: 'இந்தியா (நாடு தழுவியது)', en: 'India (National)' }
  },
  'tn-newyear': {
    title: { ta: 'ஆங்கிலப் புத்தாண்டு', en: 'New Year\'s Day' },
    description: { ta: 'ஆங்கிலப் புத்தாண்டு தொடக்கம்.', en: 'Celebration of the New Year.' },
    location: { ta: 'தமிழ்நாடு', en: 'Tamil Nadu' }
  },
  'tn-pongal': {
    title: { ta: 'பொங்கல்', en: 'Pongal' },
    description: { ta: 'தமிழர் அறுவடைத் திருநாள்.', en: 'Tamil harvest festival.' },
    location: { ta: 'தமிழ்நாடு', en: 'Tamil Nadu' }
  },
  'tn-thiruvalluvar': {
    title: { ta: 'திருவள்ளுவர் தினம்', en: 'Thiruvalluvar Day' },
    description: { ta: 'வள்ளுவர் தினக் கொண்டாட்டம்.', en: 'Celebration of Thiruvalluvar, ancient Tamil poet.' },
    location: { ta: 'தமிழ்நாடு', en: 'Tamil Nadu' }
  },
  'tn-uzhavar': {
    title: { ta: 'உழவர் திருநாள்', en: 'Uzhavar Thirunal' },
    description: { ta: 'விவசாயிகள் மற்றும் கால்நடைகளைக் கொண்டாடும் நாள்.', en: 'Farmers\' and cattle thanksgiving day.' },
    location: { ta: 'தமிழ்நாடு', en: 'Tamil Nadu' }
  },
  'tn-thaipoosam': {
    title: { ta: 'தைப்பூசம்', en: 'Thaipoosam' },
    description: { ta: 'முருகப் பெருமானுக்குரிய தைப்பூசத் திருவிழா.', en: 'Devotional festival dedicated to Lord Murugan.' },
    location: { ta: 'தமிழ்நாடு', en: 'Tamil Nadu' }
  },
  'tn-telugunewyear': {
    title: { ta: 'தெலுங்கு புத்தாண்டு (உகாதி)', en: 'Telugu New Year (Ugadi)' },
    description: { ta: 'தெலுங்கு மொழி பேசும் மக்களின் புத்தாண்டு.', en: 'Ugadi, the Telugu and Kannada New Year.' },
    location: { ta: 'தமிழ்நாடு', en: 'Tamil Nadu' }
  },
  'tn-tamilnewyear': {
    title: { ta: 'தமிழ்ப் புத்தாண்டு / அம்பேத்கர் ஜெயந்தி', en: 'Tamil New Year / Ambedkar Jayanti' },
    description: { ta: 'தமிழ் வருடப்பிறப்பு மற்றும் அம்பேத்கர் பிறந்தநாள்.', en: 'Tamil New Year (Puthandu) and Dr. B.R. Ambedkar\'s birthday.' },
    location: { ta: 'தமிழ்நாடு', en: 'Tamil Nadu' }
  },
  'tn-mayday': {
    title: { ta: 'மே தினம்', en: 'May Day' },
    description: { ta: 'உழைப்பாளர் தினக் கொண்டாட்டம்.', en: 'International Workers\' Day.' },
    location: { ta: 'தமிழ்நாடு', en: 'Tamil Nadu' }
  },
  'tn-vinayakar': {
    title: { ta: 'விநாயகர் சதுர்த்தி', en: 'Vinayagar Chaturthi' },
    description: { ta: 'விநாயகப் பெருமானின் அவதாரத் திருநாள்.', en: 'Festival celebrating the birth of Ganesha.' },
    location: { ta: 'தமிழ்நாடு', en: 'Tamil Nadu' }
  },
  'tn-ayuthapooja': {
    title: { ta: 'ஆயுத பூஜை', en: 'Ayutha Pooja / Vijayadashami' },
    description: { ta: 'தொழில்கருவிகள் மற்றும் வாகனங்களை வணங்கும் நாள்.', en: 'Worship of tools, machinery, and instruments.' },
    location: { ta: 'தமிழ்நாடு', en: 'Tamil Nadu' }
  }
};

const SEED_EVENTS = (): CalendarEvent[] => {
  const holidayColor = CATEGORY_OPTIONS.find(c => c.value === 'holiday')?.color || '#b8583c';

  return [
    // Indian Gazetted Holidays 2026
    {
      id: 'in-1',
      title: 'குடியரசு தினம்',
      description: 'இந்திய அரசியலமைப்பு சட்டம் நடைமுறைக்கு வந்த நாள்.',
      startDate: '2026-01-26',
      endDate: '2026-01-26',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'இந்தியா (நாடு தழுவியது)'
    },
    {
      id: 'in-2',
      title: 'மகா சிவராத்திரி',
      description: 'சிவன் வழிபாட்டிற்குரிய முக்கிய இந்து திருவிழா.',
      startDate: '2026-02-15',
      endDate: '2026-02-15',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'இந்தியா (நாடு தழுவியது)'
    },
    {
      id: 'in-3',
      title: 'ஹோலி',
      description: 'வண்ணங்களின் திருவிழா.',
      startDate: '2026-03-04',
      endDate: '2026-03-04',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'இந்தியா (நாடு தழுவியது)'
    },
    {
      id: 'in-4',
      title: 'ரம்சான் (ஈகைப் பெருநாள்)',
      description: 'ரமலான் நோன்பு முடிவைக் குறிக்கும் இஸ்லாமிய திருவிழா.',
      startDate: '2026-03-21',
      endDate: '2026-03-21',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'இந்தியா (நாடு தழுவியது)'
    },
    {
      id: 'in-5',
      title: 'ராம நவமி',
      description: 'ஸ்ரீ ராமரின் பிறப்பைக் கொண்டாடும் திருவிழா.',
      startDate: '2026-03-26',
      endDate: '2026-03-26',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'இந்தியா (நாடு தழுவியது)'
    },
    {
      id: 'in-6',
      title: 'மகாவீர் ஜெயந்தி',
      description: 'மகாவீரரின் பிறப்பைக் கொண்டாடும் சமண திருவிழா.',
      startDate: '2026-03-31',
      endDate: '2026-03-31',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'இந்தியா (நாடு தழுவியது)'
    },
    {
      id: 'in-7',
      title: 'புனித வெள்ளி',
      description: 'இயேசு கிறிஸ்துவின் சிலுவை மரணத்தை நினைவுகூரும் நாள்.',
      startDate: '2026-04-03',
      endDate: '2026-04-03',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'இந்தியா (நாடு தழுவியது)'
    },
    {
      id: 'in-8',
      title: 'புத்த பூர்ணிமா',
      description: 'புத்தரின் பிறப்பு மற்றும் ஞானம் பெற்ற நாளைக் கொண்டாடும் விழா.',
      startDate: '2026-05-01',
      endDate: '2026-05-01',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'இந்தியா (நாடு தழுவியது)'
    },
    {
      id: 'in-9',
      title: 'பக்ரீத் (தியாகத் திருநாள்)',
      description: 'இஸ்லாமிய தியாகத் திருநாள்.',
      startDate: '2026-05-27',
      endDate: '2026-05-27',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'இந்தியா (நாடு தழுவியது)'
    },
    {
      id: 'in-10',
      title: 'மொஹரம்',
      description: 'இஸ்லாமிய புத்தாண்டுத் தொடக்கம்.',
      startDate: '2026-06-26',
      endDate: '2026-06-26',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'இந்தியா (நாடு தழுவியது)'
    },
    {
      id: 'in-11',
      title: 'சுதந்திர தினம்',
      description: 'இந்தியாவின் சுதந்திர நாள் கொண்டாட்டம்.',
      startDate: '2026-08-15',
      endDate: '2026-08-15',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'இந்தியா (நாடு தழுவியது)'
    },
    {
      id: 'in-12',
      title: 'மிலாத் நபி',
      description: 'நபிகள் நாயகத்தின் பிறந்தநாள்.',
      startDate: '2026-08-26',
      endDate: '2026-08-26',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'இந்தியா (நாடு தழுவியது)'
    },
    {
      id: 'in-13',
      title: 'கிருஷ்ண ஜெயந்தி',
      description: 'ஸ்ரீ கிருஷ்ணரின் அவதார தினம்.',
      startDate: '2026-09-04',
      endDate: '2026-09-04',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'இந்தியா (நாடு தழுவியது)'
    },
    {
      id: 'in-14',
      title: 'காந்தி ஜெயந்தி',
      description: 'மகாத்மா காந்தியின் பிறந்தநாள்.',
      startDate: '2026-10-02',
      endDate: '2026-10-02',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'இந்தியா (நாடு தழுவியது)'
    },
    {
      id: 'in-15',
      title: 'விஜயதசமி (தசரா)',
      description: 'தீமையின் மீது நன்மைகள் வென்ற நாள்.',
      startDate: '2026-10-20',
      endDate: '2026-10-20',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'இந்தியா (நாடு தழுவியது)'
    },
    {
      id: 'in-16',
      title: 'தீபாவளி',
      description: 'ஒளியின் திருவிழா.',
      startDate: '2026-11-08',
      endDate: '2026-11-08',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'இந்தியா (நாடு தழுவியது)'
    },
    {
      id: 'in-17',
      title: 'குரு நானக் ஜெயந்தி',
      description: 'குரு நானக் தேவ் பிறந்தநாள்.',
      startDate: '2026-11-24',
      endDate: '2026-11-24',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'இந்தியா (நாடு தழுவியது)'
    },
    {
      id: 'in-18',
      title: 'கிறிஸ்துமஸ்',
      description: 'இயேசு கிறிஸ்துவின் பிறந்தநாள்.',
      startDate: '2026-12-25',
      endDate: '2026-12-25',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'இந்தியா (நாடு தழுவியது)'
    },
    // Tamil Nadu Specific Holidays 2026
    {
      id: 'tn-newyear',
      title: 'ஆங்கிலப் புத்தாண்டு',
      description: 'ஆங்கிலப் புத்தாண்டு தொடக்கம்.',
      startDate: '2026-01-01',
      endDate: '2026-01-01',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'தமிழ்நாடு'
    },
    {
      id: 'tn-pongal',
      title: 'பொங்கல்',
      description: 'தமிழர் அறுவடைத் திருநாள்.',
      startDate: '2026-01-15',
      endDate: '2026-01-15',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'தமிழ்நாடு'
    },
    {
      id: 'tn-thiruvalluvar',
      title: 'திருவள்ளுவர் தினம்',
      description: 'வள்ளுவர் தினக் கொண்டாட்டம்.',
      startDate: '2026-01-16',
      endDate: '2026-01-16',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'தமிழ்நாடு'
    },
    {
      id: 'tn-uzhavar',
      title: 'உழவர் திருநாள்',
      description: 'விவசாயிகள் மற்றும் கால்நடைகளைக் கொண்டாடும் நாள்.',
      startDate: '2026-01-17',
      endDate: '2026-01-17',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'தமிழ்நாடு'
    },
    {
      id: 'tn-thaipoosam',
      title: 'தைப்பூசம்',
      description: 'முருகப் பெருமானுக்குரிய தைப்பூசத் திருவிழா.',
      startDate: '2026-02-01',
      endDate: '2026-02-01',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'தமிழ்நாடு'
    },
    {
      id: 'tn-telugunewyear',
      title: 'தெலுங்கு புத்தாண்டு (உகாதி)',
      description: 'தெலுங்கு மொழி பேசும் மக்களின் புத்தாண்டு.',
      startDate: '2026-03-19',
      endDate: '2026-03-19',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'தமிழ்நாடு'
    },
    {
      id: 'tn-tamilnewyear',
      title: 'தமிழ்ப் புத்தாண்டு / அம்பேத்கர் ஜெயந்தி',
      description: 'தமிழ் வருடப்பிறப்பு மற்றும் அம்பேத்கர் பிறந்தநாள்.',
      startDate: '2026-04-14',
      endDate: '2026-04-14',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'தமிழ்நாடு'
    },
    {
      id: 'tn-mayday',
      title: 'மே தினம்',
      description: 'உழைப்பாளர் தினக் கொண்டாட்டம்.',
      startDate: '2026-05-01',
      endDate: '2026-05-01',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'தமிழ்நாடு'
    },
    {
      id: 'tn-vinayakar',
      title: 'விநாயகர் சதுர்த்தி',
      description: 'விநாயகப் பெருமானின் அவதாரத் திருநாள்.',
      startDate: '2026-09-14',
      endDate: '2026-09-14',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'தமிழ்நாடு'
    },
    {
      id: 'tn-ayuthapooja',
      title: 'ஆயுத பூஜை',
      description: 'தொழில்கருவிகள் மற்றும் வாகனங்களை வணங்கும் நாள்.',
      startDate: '2026-10-19',
      endDate: '2026-10-19',
      allDay: true,
      category: 'holiday',
      color: holidayColor,
      location: 'தமிழ்நாடு'
    }
  ];
};

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentView, setCurrentView] = useState<CalendarView>('month');
  const [language, setLanguage] = useState<'ta' | 'en'>('ta');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('calendar_theme') as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('calendar_theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [theme]);
  
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('calendar_events');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as CalendarEvent[];
        const hasPongal = parsed.some(e => e.id === 'tn-pongal');
        const hasEnglishPongal = parsed.some(e => e.id === 'tn-pongal' && e.title === 'Pongal');
        const hasMockup = parsed.some(e => ['1', '2', '3', '4', '5', '6'].includes(e.id));
        if (!hasPongal || hasEnglishPongal || hasMockup) {
          const seeds = SEED_EVENTS();
          const holidays = seeds.filter(e => e.category === 'holiday');
          const parsedFiltered = parsed.filter(
            e => !e.id.startsWith('in-') && 
                 !e.id.startsWith('tn-') && 
                 !['1', '2', '3', '4', '5', '6'].includes(e.id)
          );
          const merged = [...parsedFiltered, ...holidays];
          localStorage.setItem('calendar_events', JSON.stringify(merged));
          return merged;
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse calendar events', e);
      }
    }
    return SEED_EVENTS();
  });

  const [selectedCategories, setSelectedCategories] = useState<Category[]>(
    CATEGORY_OPTIONS.map(c => c.value)
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<CalendarEvent | null>(null);
  const [isEventModalOpen, setEventModalOpen] = useState<boolean>(false);
  const [modalInitialDate, setModalInitialDate] = useState<{ startDate: string; startTime?: string } | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('calendar_events', JSON.stringify(events));
  }, [events]);



  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  const addEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (updatedEvent: CalendarEvent) => {
    setEvents(prev => prev.map(e => (e.id === updatedEvent.id ? updatedEvent : e)));
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const toggleCategory = (category: Category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const importEvents = (importedEvents: CalendarEvent[]): boolean => {
    if (!Array.isArray(importedEvents)) return false;
    
    // Quick validation of array elements
    const valid = importedEvents.every(e => 
      e && typeof e.id === 'string' && typeof e.title === 'string' && typeof e.startDate === 'string'
    );
    
    if (!valid) return false;

    // Deduplicate or append - we'll merge them, overwriting same IDs, appending new ones
    setEvents(prev => {
      const mergedMap = new Map<string, CalendarEvent>();
      prev.forEach(e => mergedMap.set(e.id, e));
      importedEvents.forEach(e => mergedMap.set(e.id, e));
      return Array.from(mergedMap.values());
    });
    return true;
  };

  const navigatePrev = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'month' || currentView === 'agenda') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (currentView === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (currentView === 'month' || currentView === 'agenda') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (currentView === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (currentView === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  // Filter and dynamically translate events based on active language state
  const filteredEvents = events.map(event => {
    const translation = seededEventTranslations[event.id];
    if (translation) {
      return {
        ...event,
        title: translation.title[language],
        description: translation.description ? translation.description[language] : event.description,
        location: translation.location ? translation.location[language] : event.location,
      };
    }
    return event;
  }).filter(event => {
    const matchesCategory = selectedCategories.includes(event.category);
    
    const searchLower = searchQuery.toLowerCase().trim();
    if (searchLower === '') return matchesCategory;

    const matchesSearch =
      event.title.toLowerCase().includes(searchLower) ||
      (event.description && event.description.toLowerCase().includes(searchLower)) ||
      (event.location && event.location.toLowerCase().includes(searchLower));

    return matchesCategory && matchesSearch;
  });

  return (
    <CalendarContext.Provider
      value={{
        currentDate,
        setCurrentDate,
        currentView,
        setCurrentView,
        events,
        addEvent,
        updateEvent,
        deleteEvent,
        selectedCategories,
        toggleCategory,
        searchQuery,
        setSearchQuery,
        isSidebarOpen,
        toggleSidebar,
        selectedEventForEdit,
        setSelectedEventForEdit,
        isEventModalOpen,
        setEventModalOpen,
        modalInitialDate,
        setModalInitialDate,
        filteredEvents,
        importEvents,
        navigatePrev,
        navigateNext,
        language,
        setLanguage,
        theme,
        setTheme,
      }}
    >
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};
