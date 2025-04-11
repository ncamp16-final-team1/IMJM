import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Container, Divider } from '@mui/material';
import { CalendarMonth as CalendarIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/ko';
import { getStylistSchedule } from '../../services/reservation/getStylistSchedule';

export interface StylistSchedule {
  stylistId: number;
  salonId: string;
  name: string;
  callNumber: String;
  introduction: String;
  salonHolidayMask: number;
  stylistHolidayMask: number;
  profile: string;
}

const StylistSchedulePage = () => {
  const { stylistId } = useParams();
  const [stylistSchedule, setStylistSchedule] = useState<StylistSchedule | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  
  // 휴무일 체크 함수 (비트마스크 사용)
  const shouldDisableDate = (date: Dayjs) => {
    if (!stylistSchedule) return false;
    
    const dayOfWeek = (date.day() + 6) % 7; 
    
    // 매장 휴무일 또는 스타일리스트 휴무일 체크
    const isSalonHoliday = (stylistSchedule.salonHolidayMask & (1 << dayOfWeek)) !== 0;
    const isStylistHoliday = (stylistSchedule.stylistHolidayMask & (1 << dayOfWeek)) !== 0;
    
    return isSalonHoliday || isStylistHoliday;
  };

  useEffect(() => {
    if (!stylistId) {
      console.error("stylistId가 없습니다.");
      return;
    }

    getStylistSchedule(stylistId)
      .then(setStylistSchedule)
      .catch((error) => console.error('스타일리스트 가져오기 실패:', error));
  }, [stylistId]);

  // 아직 로딩 중이면 잠깐 대기
  if (!stylistSchedule) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container disableGutters maxWidth="sm" sx={{ p: 0 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2, 
          overflow: 'hidden',
          '& *::-webkit-scrollbar': { display: 'none' },
          '& *': {
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          },
        }}
      >
        {/* 프로필 이미지 섹션 */}
        <Box sx={{ width: '100%', height: 300, overflow: 'hidden' }}>
          <img 
            src={stylistSchedule.profile || "이미지 로딩에 실패!"} 
            alt="stylist profile" 
            style={{ 
              width: '100%', 
              height: '300px', 
              objectFit: 'cover',
              objectPosition: 'center'
            }} 
          />
        </Box>
        
        {/* 프로필 정보 섹션 */}
        <Box sx={{ p: 2 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
            {stylistSchedule.name}
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1,
            color: 'text.secondary' 
          }}>
            <LocationIcon sx={{ fontSize: 18, mr: 0.5, color: 'gray' }} />
            <Typography variant="body2" color="text.secondary">
              {stylistSchedule.introduction || "소개가 없습니다"}
            </Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {/* 일정 선택 안내 */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1 
          }}>
            <CalendarIcon sx={{ fontSize: 20, mr: 1, color: 'gray' }} />
            <Typography variant="body2" color="text.secondary">
              Please select a date and time
            </Typography>
          </Box>
          
          {/* 캘린더 섹션 */}
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
              {dayjs().format('MMMM YYYY')}
            </Typography>
            
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
              <StaticDatePicker
                displayStaticWrapperAs="desktop"
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue)}
                minDate={dayjs()} 
                maxDate={dayjs().add(1, 'month')} 
                shouldDisableDate={shouldDisableDate} 
                dayOfWeekFormatter={(day) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][day.day()]}
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
        </Box>
      </Paper>
    </Container>
  );
};



export default StylistSchedulePage;