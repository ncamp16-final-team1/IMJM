import { useState } from 'react';
import { Dayjs } from 'dayjs';
import axios from 'axios';
import dayjs from 'dayjs';

// 메뉴 초기화 함수 콜백을 파라미터로 추가
export const useTimeSlots = (
  stylistId: string | undefined,
  resetMenu: () => void // 메뉴 초기화 콜백 추가
) => {
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [allTimeSlots, setAllTimeSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // 시간대 불러오기 함수
  const fetchAvailableTimes = async (date: Dayjs | null) => {
    if (!stylistId || !date) return;
    setIsLoading(true);
    
    try {
      const res = await axios.get('/api/salon/reservations/available-times', {
        params: {
          stylistId,
          date: date.format('YYYY-MM-DD')
        }
      });
      setAvailableTimes(res.data.availableTimes || []);
      setBookedTimes(res.data.bookedTimes || []);
    
      const allTimes = [...res.data.availableTimes || [], ...res.data.bookedTimes || []];
      allTimes.sort((a, b) => {
        return a.localeCompare(b);
      });
      
      setAllTimeSlots(allTimes);

    } catch (error) {
      setAvailableTimes([]);
      setBookedTimes([]);
      setAllTimeSlots([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 시간대가 예약 가능한지 확인하는 함수
  const isTimeSlotAvailable = (time: string, isSelectedDateHoliday: boolean, selectedDate: Dayjs | null) => {
    if (isSelectedDateHoliday || !selectedDate) return false;
  
    if (selectedDate.isSame(dayjs(), 'day')) {
      const currentTime = dayjs();
      const [hour, minute] = time.split(':');
      const slotTime = selectedDate.hour(parseInt(hour)).minute(parseInt(minute));
      
      return slotTime.isAfter(currentTime) && availableTimes.includes(time);
    }
    
    return availableTimes.includes(time);
  };

  // 시간대 선택 핸들러
  const handleTimeSelect = (
    time: string,
    isSelectedDateHoliday: boolean,
    selectedDate: Dayjs | null,
    onTimeSelect: () => void
  ) => {
    if (isTimeSlotAvailable(time, isSelectedDateHoliday, selectedDate)) {
      if (selectedTime === time) {
        setSelectedTime(null);
        resetMenu(); // ✅ 메뉴 초기화
        onTimeSelect();
      } else {
        setSelectedTime(time);
        resetMenu(); // ✅ 메뉴 초기화
        onTimeSelect();
      }
    }
  };

  return {
    availableTimes,
    bookedTimes,
    allTimeSlots,
    isLoading,
    selectedTime,
    setSelectedTime,
    fetchAvailableTimes,
    isTimeSlotAvailable,
    handleTimeSelect
  };
};
