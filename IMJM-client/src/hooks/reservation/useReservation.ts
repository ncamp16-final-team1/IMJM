// src/hooks/useReservation.ts
import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { Menu, ReservationInfo, StylistSchedule } from '../../type/reservation/reservation';
import { isHoliday } from '../../utils/reservation/dateUtils';

export const useReservation = (stylistId: string | undefined) => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [reservationInfo, setReservationInfo] = useState<ReservationInfo>({
    stylistId: null,
    selectedDate: '',
    selectedTime: '',
    selectedType: '',
    userId: '',
    selectedMenu: null
  });

  // 날짜 선택 핸들러
  const handleDateSelect = (
    date: Dayjs | null, 
    stylistSchedule: StylistSchedule | null,
    resetTimeSelection: () => void,
    resetServiceSelection: () => void,
    fetchTimes: (date: Dayjs | null) => void,
    setIsSelectedDateHoliday: (isHoliday: boolean) => void
  ) => {
    if (!date || !stylistSchedule) return;

    // 날짜 선택 시 초기화
    resetTimeSelection();
    resetServiceSelection();
    
    setSelectedDate(date);
    
    // 휴무일인지 확인
    const holiday = isHoliday(date, stylistSchedule);
    setIsSelectedDateHoliday(holiday);
    
    // 휴무일이 아닌 경우에만 시간대 불러오기
    if (!holiday) {
      fetchTimes(date);
    }
  };

  // 메뉴 선택 핸들러
  const handleMenuSelect = (
    menu: Menu,
    stylistId: number | null,
    selectedDate: Dayjs | null,
    selectedTime: string | null,
    selectedType: string | null,
    setSelectedMenuName: (name: string) => void
  ) => {
  
   
    const updatedReservationInfo: ReservationInfo = {
      stylistId: stylistId,
      selectedDate: selectedDate?.format('YYYY-MM-DD') || '',
      selectedTime: selectedTime || '',
      selectedType: selectedType || '',
      userId: '', // 현재는 빈 문자열로 두고, 결제/확정 단계에서 채움
      selectedMenu: {
        serviceName: menu.serviceName,
        serviceDescription: menu.serviceDescription,
        price: menu.price
      }
    };

     // 콘솔에 로그 출력
    console.log('업데이트된 예약 정보:', updatedReservationInfo);
    console.log('메뉴 정보가 담겼는지 확인:', menu);
    
    setReservationInfo(updatedReservationInfo);
    setSelectedMenuName(menu.serviceName);
  };

  return {
    selectedDate,
    reservationInfo,
    handleDateSelect,
    handleMenuSelect,
    setReservationInfo
  };
};