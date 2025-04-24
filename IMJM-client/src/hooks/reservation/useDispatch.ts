import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { Menu, ReservationInfo, StylistSchedule } from '../../type/reservation/reservation';
import { isHoliday } from '../../utils/reservation/dateUtils';

export const useReservation = () => {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [reservationInfo, setReservationInfo] = useState<ReservationInfo | null>(null);

  const handleDateSelect = (
    date: Dayjs | null,
    stylistSchedule: StylistSchedule | null,
    resetTimeSelection: () => void,
    resetServiceSelection: () => void,
    fetchTimes: (date: Dayjs | null) => void,
    setIsSelectedDateHoliday: (isHoliday: boolean) => void
  ) => {
    if (!date || !stylistSchedule) return;

    resetTimeSelection();
    resetServiceSelection();
    setSelectedDate(date);

    const holiday = isHoliday(date, stylistSchedule);
    setIsSelectedDateHoliday(holiday);

    if (!holiday) {
      fetchTimes(date);
    }
  };

  const handleMenuSelect = (
    salonId: string,
    menu: Menu | null,
    stylistId: number | null,
    stylistName: string,
    selectedDate: Dayjs | null,
    selectedTime: string | null,
    selectedType: string | null,
    setSelectedMenuName: (name: string) => void
  ) => {
    if (!menu) {
      setSelectedMenuName('');
      return;
    }

    let formattedDate = '없음';
    if (selectedDate && typeof selectedDate.format === 'function') {
      try {
        formattedDate = selectedDate.format('YYYY-MM-DD');
      } catch (error) {
        console.error('날짜 포맷 변환 오류:', error);
      }
    }

    const updatedReservationInfo: ReservationInfo = {
      salonId: salonId || '아이디값이없습니다.',
      stylistId: stylistId,
      stylistName: stylistName || '이름 없음',
      selectedDate: formattedDate,
      selectedTime: selectedTime || '없음',
      selectedType: selectedType || '없음',
      userId: '', // 결제/확정 단계에서 채움
      selectedMenu: {
        serviceName: menu.serviceName,
        serviceDescription: menu.serviceDescription,
        price: menu.price,
        id: menu.id
      }
    };

    setReservationInfo(updatedReservationInfo); 
    setSelectedMenuName(menu.serviceName);
  };

  return {
    selectedDate,
    reservationInfo, 
    handleDateSelect,
    handleMenuSelect
  };
};
