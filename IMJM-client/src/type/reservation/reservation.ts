// src/type/reservation.ts
import { Dayjs } from 'dayjs';

export interface StylistSchedule {
  stylistId: number;
  salonId: string;
  name: string;
  callNumber: string;
  introduction: string;
  salonHolidayMask: number;
  stylistHolidayMask: number;
  profile: string;
}

export interface Menu {
  id: number;
  serviceType: string;
  serviceName: string;
  serviceDescription: string;
  price: number;
  salonId: string;
}

export interface ReservationInfo {
  stylistId: number | null;
  selectedDate: string;
  selectedTime: string;
  selectedType: string;
  userId: string;
  selectedMenu: {
    serviceName: string;
    serviceDescription?: string;
    price: number;
  } | null;
}

// TimeSlotProps 인터페이스 업데이트 (type/reservation.ts 파일에서)
export interface TimeSlotProps {
    allTimeSlots: string[];
    isAM: boolean;
    isLoading: boolean;
    selectedTime: string | null;
    handleTimeSelect: (time: string, isSelectedDateHoliday: boolean, selectedDate: Dayjs | null) => void;
    isTimeSlotAvailable: (time: string, isSelectedDateHoliday: boolean, selectedDate: Dayjs | null) => boolean;
    isSelectedDateHoliday: boolean;
    selectedDate: Dayjs | null;
  }
export interface ServiceTypeProps {
  serviceTypes: string[];
  selectedType: string | null;
  handleTypeChange: (type: string) => void;
  isMenuLoading: boolean;
  showLeftArrow: boolean;
  showRightArrow: boolean;
}

export interface ServiceMenuProps {
  selectedType: string | null;
  serviceMenus: Menu[];
  isMenuLoading: boolean;
  selectedMenuName: string | null;
  handleMenuSelect: (menu: Menu) => void;
}

export interface CalendarSectionProps {
  stylistSchedule: StylistSchedule;
  selectedDate: Dayjs | null;
  handleDateSelect: (date: Dayjs | null) => void;
  isHoliday: (date: Dayjs, schedule: StylistSchedule) => boolean;
}

export interface ProfileSectionProps {
  stylistSchedule: StylistSchedule;
}

export interface TimeSlotsSectionProps {
    isSelectedDateHoliday: boolean;
    selectedDate: Dayjs | null; // 새로 추가
    isLoading: boolean;
    allTimeSlots: string[];
    selectedTime: string | null;
    handleTimeSelect: (time: string, isSelectedDateHoliday: boolean, selectedDate: Dayjs | null) => void; // 업데이트
    isTimeSlotAvailable: (time: string, isSelectedDateHoliday: boolean, selectedDate: Dayjs | null) => boolean; // 업데이트
    isAM: (time: string) => boolean;
  }

export interface ServiceTypesSectionProps {
  showServiceType: boolean;
  isMenuLoading: boolean;
  serviceTypes: string[];
  selectedType: string | null;
  handleTypeChange: (type: string) => void;
  sliderRef: React.RefObject<HTMLDivElement>;
  showLeftArrow: boolean;
  showRightArrow: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUpOrLeave: () => void;
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  onArrowClick: (direction: 'left' | 'right') => void;
}

export interface ServiceMenusSectionProps {
  selectedType: string | null;
  isMenuLoading: boolean;
  serviceMenus: Menu[];
  selectedMenuName: string | null;
  handleMenuSelect: (menu: Menu) => void;
}

export interface HolidayNoticeProps {
  isSelectedDateHoliday: boolean;
}