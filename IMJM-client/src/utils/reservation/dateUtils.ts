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