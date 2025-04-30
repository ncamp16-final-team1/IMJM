// src/utils/dateUtils.ts
import { Dayjs } from 'dayjs';
import { StylistSchedule } from '../../type/reservation/reservation';

// 휴무일 판단 함수
export const isHoliday = (date: Dayjs, schedule: StylistSchedule) => {
  const dayOfWeek = (date.day() + 6) % 7;
  const salonClosed = (schedule.salonHolidayMask & (1 << dayOfWeek)) !== 0;
  const stylistClosed = (schedule.stylistHolidayMask & (1 << dayOfWeek)) !== 0;
  return salonClosed || stylistClosed;
};

// 시간이 오전인지 확인하는 함수
export const isAM = (time: string) => {
  const hour = parseInt(time.split(':')[0]);
  return hour < 12;
};


// 날짜 포맷팅 함수
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 시간 포맷팅 함수 (예약 시간)
export const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(':');
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};