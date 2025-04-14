import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Container, Divider
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ko';

import axios from 'axios';
import { getStylistSchedule } from '../../services/reservation/getStylistSchedule';

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



// 휴무일 판단 함수
const isHoliday = (date: Dayjs, schedule: StylistSchedule) => {
  const dayOfWeek = (date.day() + 6) % 7;
  const salonClosed = (schedule.salonHolidayMask & (1 << dayOfWeek)) !== 0;
  const stylistClosed = (schedule.stylistHolidayMask & (1 << dayOfWeek)) !== 0;
  return salonClosed || stylistClosed;
};

const Reservation = () => {
  const { stylistId } = useParams();
  const [stylistSchedule, setStylistSchedule] = useState<StylistSchedule | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [allTimeSlots, setAllTimeSlots] = useState<string[]>([]);
  const [isSelectedDateHoliday, setIsSelectedDateHoliday] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [allServiceMenu, setAllServiceMenu] = useState<ServiceMenu[]>([]);  //서비스 메뉴 객체체

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

  // 서비스메뉴 불러오는 함수
  // const fetchAllServiceMenu = 
  
  // 날짜 선택 핸들러
  const handleDateSelect = (date: Dayjs | null) => {
    if (!date || !stylistSchedule) return;
    
    setSelectedDate(date);
    
    // 휴무일인지 확인
    const holiday = isHoliday(date, stylistSchedule);
    setIsSelectedDateHoliday(holiday);
    
    // 휴무일이 아닌 경우에만 시간대 불러오기
    if (!holiday) {
      fetchAvailableTimes(date);
    } else {
      // 휴무일이면 시간대 초기화
      setAvailableTimes([]);
      setBookedTimes([]);
      setAllTimeSlots([]);
    }
  };

  // 시간대가 예약 가능한지 확인하는 함수
  const isTimeSlotAvailable = (time: string) => {
    if (isSelectedDateHoliday) return false;
    return availableTimes.includes(time);
  };

  // 시간대 선택 핸들러 수정
const handleTimeSelect = (time: string) => {
  if (isTimeSlotAvailable(time)) {
    // 이미 선택된 시간을 다시 클릭하면 선택 취소
    if (selectedTime === time) {
      setSelectedTime(null);
    } else {
      // 새로운 시간 선택
      setSelectedTime(time);
    }
    console.log(`${selectedDate?.format('YYYY-MM-DD')} ${time} 선택됨`);
    // allServiceMenu()
  }
};

  // 시간이 오전인지 확인하는 함수
  const isAM = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    return hour < 12;
  };

  useEffect(() => {
    if (!stylistId) return;
    
    // 스타일리스트 정보 불러오기
    getStylistSchedule(stylistId)
      .then((data) => {
        setStylistSchedule(data);
        
        // 스타일리스트 정보를 불러온 후 현재 선택된 날짜가 휴무일인지 확인
        const today = dayjs();
        const holiday = isHoliday(today, data);
        setIsSelectedDateHoliday(holiday);
        
        // 휴무일이 아닌 경우에만 시간대 불러오기
        if (!holiday) {
          fetchAvailableTimes(today);
        } else {
          setIsLoading(false);
        }
      })
      .catch((error) => {
        console.error('스타일리스트 가져오기 실패:', error);
        setIsLoading(false);
      });
  }, [stylistId]);

  if (!stylistSchedule) return <Typography>Loading...</Typography>;

  return (
    <Container disableGutters maxWidth="sm" sx={{ p: 0 }}>
      <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {/* 프로필 이미지 */}
        <Box sx={{ width: '100%', height: 300, overflow: 'hidden' }}>
          <img
            src={stylistSchedule.profile || ''}
            alt="stylist profile"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center'
            }}
          />
        </Box>

        {/* 소개 및 캘린더 */}
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {stylistSchedule.name}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationIcon sx={{ fontSize: 18, mr: 0.5, color: 'gray' }} />
            <Typography variant="body2" color="text.secondary">
              {stylistSchedule.introduction || "소개가 없습니다"}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <CalendarIcon sx={{ fontSize: 20, mr: 1, color: 'gray' }} />
            <Typography variant="body2" color="text.secondary">
              날짜와 시간을 선택해주세요
            </Typography>
          </Box>

          {/* 캘린더 */}
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
            <StaticDatePicker
              displayStaticWrapperAs="desktop"
              value={selectedDate}
              onChange={handleDateSelect}
              minDate={dayjs()}
              maxDate={dayjs().add(1, 'month')}
              shouldDisableDate={(date) => stylistSchedule && isHoliday(date, stylistSchedule)}
              slotProps={{
                actionBar: { hidden: true },
                toolbar: { hidden: true }
              }}
              sx={{
                width: '100%',
                '& .MuiDateCalendar-root': {
                  width: '100%',
                },
                '& .MuiDayCalendar-header': {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  justifyItems: 'center',
                  padding: '0',
                  marginBottom: '8px',
                },
                '& .MuiDayCalendar-weekDayLabel': {
                  width: '36px',
                  height: '36px',
                  margin: '0',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '12px',
                  color: 'text.secondary',
                },
                '& .MuiDayCalendar-monthContainer': {
                  display: 'grid',
                  gridTemplateRows: 'repeat(6, auto)',
                  gap: '0',
                  padding: '0',
                  overflow: 'hidden',
                },
                '& .MuiDayCalendar-weekContainer': {
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  justifyItems: 'center',
                  margin: '1',
                },
                '& .MuiPickersDay-root': {
                  width: '36px',
                  height: '36px',
                  fontSize: '14px',
                  margin: '0',
                  fontWeight: 'normal',
                },
                '& .MuiPickersDay-today': {
                  border: 'none',
                  color: 'inherit',
                  fontWeight: 'bold',
                },
                '& .Mui-selected': {
                  backgroundColor: '#F06292 !important',
                  color: 'white !important',
                  borderRadius: '50%',
                },
                '& .MuiButtonBase-root.MuiPickersDay-root.Mui-selected': {
                  backgroundColor: '#F06292 !important',
                },
                // 비활성화된 날짜 스타일
                '& .Mui-disabled': {
                  opacity: 0.5,
                  backgroundColor: 'rgba(0, 0, 0, 0.05)'
                }
              }}
            />
          </LocalizationProvider>
        </Box>
      </Paper>

      {/* 휴무일인 경우 안내 메시지 표시 */}
      {isSelectedDateHoliday && (
        <Box sx={{ mt: 2, p: 2, backgroundColor: '#ffebee', borderRadius: 1 }}>
          <Typography color="error">
            선택하신 날짜는 휴무일입니다. 다른 날짜를 선택해주세요.
          </Typography>
        </Box>
      )}
      
     {/* 예약 가능 시간대 - 휴무일이 아닐 때만 표시 */}
      {!isSelectedDateHoliday && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            예약 시간
          </Typography>
          
          {isLoading ? (
            <Typography color="text.secondary">
              시간대 정보를 불러오는 중입니다...
            </Typography>
          ) : allTimeSlots.length > 0 ? (
            <>
              {/* 오전 시간대 */}
              {allTimeSlots.filter(time => isAM(time)).length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary"
                    sx={{ 
                      mb: 1, 
                      fontWeight: 'bold',
                      borderBottom: '1px solid #e0e0e0',
                      pb: 1
                    }}
                  >
                    오전
                  </Typography>
                  {/* 중앙 정렬을 위한 컨테이너 */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center'
                  }}>
                    {/* 한 줄에 4개 항목을 표시하기 위한 고정 너비 컨테이너 */}
                    <Box sx={{ 
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 2,
                      width: { xs: '450px', sm: '480px' }, // 모바일과 태블릿 너비 조정
                      justifyContent: 'flex-start'
                    }}>
                      {allTimeSlots.filter(time => isAM(time)).map((time) => {
                        const isAvailable = isTimeSlotAvailable(time);
                        const isSelected = selectedTime === time;
                        
                        return (
                          <Box
                            key={time}
                            onClick={() => handleTimeSelect(time)}
                            sx={{
                              px: 2,
                              py: 1,
                              borderRadius: 1,
                              // 4개 항목이 한 줄에 들어가도록 너비 계산
                              width: { xs: '99px', sm: '108px' },
                              textAlign: 'center',
                              // 선택된 항목만 배경 색상을 약간 어둡게
                              backgroundColor: isSelected && isAvailable
                                ? '#F7A399' // 선택된 경우 더 진한 핑크
                                : isAvailable 
                                  ? '#FDC7BF' // 이용 가능한 경우
                                  : '#f5f5f5', // 이용 불가능한 경우
                              color: isAvailable ? 'text.primary' : 'text.disabled',
                              cursor: isAvailable ? 'pointer' : 'default',
                              opacity: isAvailable ? 1 : 0.6,
                              // 선택된 항목은 테두리 색상 변경
                              border: isAvailable 
                                ? isSelected
                                  ? '1px solid #F06292' // 진한 핑크 테두리
                                  : '1px solid #FDC7BF' 
                                : '1px solid #e0e0e0',
                              fontWeight: isSelected && isAvailable ? 'bold' : 'normal', // 선택된 항목은 글자 굵게
                              transition: 'all 0.2s',
                              '&:hover': {
                                backgroundColor: isAvailable 
                                  ? isSelected 
                                    ? '#F7A399' // 선택된 경우 더 진한 핑크 유지
                                    : '#FDC7BF' 
                                  : '#f5f5f5',
                                transform: isAvailable ? 'scale(1.05)' : 'none',
                              }
                            }}
                          >
                            {time}
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </Box>
              )}
              
              {/* 오후 시간대 */}
              {allTimeSlots.filter(time => !isAM(time)).length > 0 && (
                <Box>
                  <Typography 
                    variant="subtitle2" 
                    color="text.secondary"
                    sx={{ 
                      mb: 1, 
                      fontWeight: 'bold',
                      borderBottom: '1px solid #e0e0e0',
                      pb: 1
                    }}
                  >
                    오후
                  </Typography>
                  {/* 중앙 정렬을 위한 컨테이너 */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center'
                  }}>
                    {/* 한 줄에 4개 항목을 표시하기 위한 고정 너비 컨테이너 */}
                    <Box sx={{ 
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 2,
                      width: { xs: '450px', sm: '480px' }, // 모바일과 태블릿 너비 조정 
                      justifyContent: 'flex-start'
                    }}>
                      {allTimeSlots.filter(time => !isAM(time)).map((time) => {
                        const isAvailable = isTimeSlotAvailable(time);
                        const isSelected = selectedTime === time;
                        
                        return (
                          <Box
                            key={time}
                            onClick={() => handleTimeSelect(time)}
                            sx={{
                              px: 2,
                              py: 1,
                              borderRadius: 1,
                              // 4개 항목이 한 줄에 들어가도록 너비 계산
                              width: { xs: '99px', sm: '108px' },
                              textAlign: 'center',
                              // 선택된 항목만 배경 색상을 약간 어둡게
                              backgroundColor: isSelected && isAvailable
                                ? '#F7A399' // 선택된 경우 더 진한 핑크
                                : isAvailable 
                                  ? '#FDC7BF' // 이용 가능한 경우
                                  : '#f5f5f5', // 이용 불가능한 경우
                              color: isAvailable ? 'text.primary' : 'text.disabled',
                              cursor: isAvailable ? 'pointer' : 'default',
                              opacity: isAvailable ? 1 : 0.6,
                              // 선택된 항목은 테두리 색상 변경
                              border: isAvailable 
                                ? isSelected
                                  ? '1px solid #F06292' // 진한 핑크 테두리
                                  : '1px solid #FDC7BF' 
                                : '1px solid #e0e0e0',
                              fontWeight: isSelected && isAvailable ? 'bold' : 'normal', // 선택된 항목은 글자 굵게
                              transition: 'all 0.2s',
                              '&:hover': {
                                backgroundColor: isAvailable 
                                  ? isSelected 
                                    ? '#F7A399' // 선택된 경우 더 진한 핑크 유지
                                    : '#FDC7BF' 
                                  : '#f5f5f5',
                                transform: isAvailable ? 'scale(1.05)' : 'none',
                              }
                            }}
                          >
                            {time}
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </Box>
              )}
            </>
          ) : (
            <Typography color="text.secondary">
              예약 가능한 시간이 없습니다.
            </Typography>
          )}
        </Box>
      )}



    </Container>
  );
};

export default Reservation;