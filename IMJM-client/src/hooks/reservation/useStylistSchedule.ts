import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { StylistSchedule } from '../../type/reservation/reservation';
import { getStylistSchedule } from '../../services/reservation/getStylistSchedule';
import { isHoliday } from '../../utils/reservation/dateUtils';


export const useStylistSchedule = (stylistId: string | undefined) => {
  const [stylistSchedule, setStylistSchedule] = useState<StylistSchedule | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSelectedDateHoliday, setIsSelectedDateHoliday] = useState<boolean>(false);

  useEffect(() => {
    if (!stylistId) return;
    

    getStylistSchedule(stylistId)
      .then((data) => {
        setStylistSchedule(data);
        const today = dayjs();
        const holiday = isHoliday(today, data);
        setIsSelectedDateHoliday(holiday);
      })
      .catch((error) => {
        console.error('스타일리스트 가져오기 실패:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [stylistId]);

  return {
    stylistSchedule,
    isLoading,
    isSelectedDateHoliday,
    setIsSelectedDateHoliday
  };
};