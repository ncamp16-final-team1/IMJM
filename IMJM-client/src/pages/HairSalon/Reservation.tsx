import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Container, Divider, 
  Snackbar, Alert, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions
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
  const navigate = useNavigate();
  const [stylistSchedule, setStylistSchedule] = useState<StylistSchedule | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); // 로그인 상태
  const [openLoginDialog, setOpenLoginDialog] = useState<boolean>(false); // 로그인 다이얼로그
  const [userClickedDate, setUserClickedDate] = useState<Dayjs | null>(null); // 사용자가 선택한 날짜

  // 로그인 상태 확인 함수
  const checkLoginStatus = async (): Promise<boolean> => {

     // 개발 환경에서는 항상 로그인된 상태 반환
  // if (process.env.NODE_ENV === 'development') {
  //   return true;
  // }
    try {
      const res = await axios.get('/api/auth/check');
      return res.status === 200;
    } catch (error) {
      console.error("로그인 확인 실패:", error);
      return false;
    }
  };

  // 시간대 불러오기 함수
  const fetchAvailableTimes = async (date: Dayjs | null) => {
    if (!stylistId || !date) return;
    try {
      const res = await axios.get('/api/hairsalon/reservations/available-times', {
        params: {
          stylistId,
          date: date.format('YYYY-MM-DD')
        }
      });
      setAvailableTimes(res.data.availableTimes);
      console.log("시간대 응답:", res.data);
    } catch (error) {
      console.error("시간대 불러오기 실패:", error);
    }
  };
  
  // 날짜 선택 핸들러
  const handleDateSelect = async (date: Dayjs | null) => {
    if (!date) return;
  
    setSelectedDate(date);
    
    // 로그인 상태 확인
    const loggedIn = await checkLoginStatus();
    setIsLoggedIn(loggedIn);
    
    if (loggedIn) {
      // 로그인된 경우 사용자가 선택한 날짜 기록하고 시간대 불러오기
      setUserClickedDate(date);
      const isSameDate = userClickedDate?.isSame(date, 'day');
      if (!isSameDate || (isSameDate && availableTimes.length === 0)) {
        fetchAvailableTimes(date);
      }
    } else {
      // 로그인되지 않은 경우 다이얼로그 표시
      setOpenLoginDialog(true);
    }
  };

  // 로그인 페이지로 이동
  const handleGoToLogin = () => {
    navigate('/login', { state: { from: `/reservation/${stylistId}` } });
  };

  // 로그인 다이얼로그 닫기
  const handleCloseLoginDialog = () => {
    setOpenLoginDialog(false);
  };

  useEffect(() => {
    if (!stylistId) return;
    getStylistSchedule(stylistId)
      .then(setStylistSchedule)
      .catch((error) => console.error('스타일리스트 가져오기 실패:', error));
    
    // 초기 로그인 상태 확인
    checkLoginStatus().then(setIsLoggedIn);
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
                    backgroundColor: '#3f51b5 !important',
                    color: 'white !important',
                    borderRadius: '50%',
                  },
                  '& .MuiButtonBase-root.MuiPickersDay-root.Mui-selected': {
                    backgroundColor: '#3f51b5 !important',
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

      {/* 예약 가능 시간대 - 로그인 되어 있고 사용자가 날짜를 선택했을 때만 표시 */}
      {isLoggedIn && userClickedDate && availableTimes.length > 0 && (
        <Box sx={{ mt: 0 }}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            가능한 시간대
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {availableTimes.map((time) => (
              <Box
                key={time}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  backgroundColor: '#e3f2fd',
                  cursor: 'pointer',
                }}
              >
                {time}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* 로그인 필요 다이얼로그 */}
      <Dialog open={openLoginDialog} onClose={handleCloseLoginDialog}>
        <DialogTitle>로그인 필요</DialogTitle>
        <DialogContent>
          <Typography>
            예약을 하기 위해서는 로그인이 필요합니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLoginDialog} color="primary">
            취소
          </Button>
          <Button onClick={handleGoToLogin} color="primary" variant="contained">
            로그인
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Reservation;