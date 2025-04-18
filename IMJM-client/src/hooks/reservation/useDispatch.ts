import { useState } from 'react';
import { useDispatch } from 'react-redux';
import dayjs, { Dayjs } from 'dayjs';
import { Menu, ReservationInfo, StylistSchedule } from '../../type/reservation/reservation';
import { isHoliday } from '../../utils/reservation/dateUtils';
import { setReservationInfo } from '../../components/features/reservation/reservationSlice';

export const useReservation = () => {
  const dispatch = useDispatch();
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());

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

    resetTimeSelection();
    resetServiceSelection();
    setSelectedDate(date);

    const holiday = isHoliday(date, stylistSchedule);
    setIsSelectedDateHoliday(holiday);

    if (!holiday) {
      fetchTimes(date);
    }
  };

  // 메뉴 선택 핸들러
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
    // menu가 null인 경우 (취소 버튼 클릭 시)
    if (!menu) {
      setSelectedMenuName('');
      return;
    }

    // selectedDate 타입 체크 및 안전한 형식 변환
    let formattedDate = '없음';
    if (selectedDate && typeof selectedDate.format === 'function') {
      try {
        formattedDate = selectedDate.format('YYYY-MM-DD');
      } catch (error) {
        console.error('날짜 포맷 변환 오류:', error);
      }
    }

    const updatedReservationInfo: ReservationInfo = {
      salonId: salonId || "아이디값이없습니다.",
      stylistId: stylistId,
      stylistName: stylistName || '이름 없음',
      selectedDate: formattedDate,
      selectedTime: selectedTime || '없음',
      selectedType: selectedType || '없음',
      userId: '', // 결제/확정 단계에서 채움
      selectedMenu: {
        serviceName: menu.serviceName,
        serviceDescription: menu.serviceDescription,
        price: menu.price
      }
    };

    dispatch(setReservationInfo(updatedReservationInfo));
    setSelectedMenuName(menu.serviceName);
  };

  return {
    selectedDate,
    handleDateSelect,
    handleMenuSelect
  };
};