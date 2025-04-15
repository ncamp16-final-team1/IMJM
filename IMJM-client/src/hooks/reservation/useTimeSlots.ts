// src/hooks/useTimeSlots.ts
import { useState } from 'react';
import { Dayjs } from 'dayjs';
import axios from 'axios';
import dayjs from 'dayjs';

export const useTimeSlots = (stylistId: string | undefined) => {
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
      const res = await axios.get('/api/hairsalon/reservations/available-times', {
        params: {
          stylistId,
          date: date.format('YYYY-MM-DD')
        }
      });
      
      // 사용 가능한 시간대와 예약된 시간대 설정
      setAvailableTimes(res.data.availableTimes || []);
      setBookedTimes(res.data.bookedTimes || []);
      
      // 모든 시간대 = 사용 가능한 시간대 + 예약된 시간대
      const allTimes = [...res.data.availableTimes || [], ...res.data.bookedTimes || []];
      
      // 정렬: 시간 순으로
      allTimes.sort((a, b) => {
        return a.localeCompare(b);
      });
      
      setAllTimeSlots(allTimes);
      console.log("시간대 응답:", res.data);
    } catch (error) {
      console.error("시간대 불러오기 실패:", error);
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
  
    // 선택된 날짜가 오늘인 경우
    if (selectedDate.isSame(dayjs(), 'day')) {
      const currentTime = dayjs();
      const [hour, minute] = time.split(':');
      // 선택된 날짜에 시간 설정
      const slotTime = selectedDate.hour(parseInt(hour)).minute(parseInt(minute));
      
      // 현재 시간 이후의 시간만 활성화
      return slotTime.isAfter(currentTime) && availableTimes.includes(time);
    }
    
    return availableTimes.includes(time);
  };

  // 시간대 선택 핸들러
  const handleTimeSelect = (time: string, isSelectedDateHoliday: boolean, selectedDate: Dayjs | null, onTimeSelect: () => void) => {
    if (isTimeSlotAvailable(time, isSelectedDateHoliday, selectedDate)) {
      // 이미 선택된 시간을 다시 클릭하면 선택 취소
      if (selectedTime === time) {
        setSelectedTime(null);
        onTimeSelect();
      } else {
        // 새로운 시간 선택
        setSelectedTime(time);
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