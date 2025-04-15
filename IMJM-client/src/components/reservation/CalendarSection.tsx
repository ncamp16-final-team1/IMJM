// src/components/reservation/CalendarSection.tsx
import { Box, Typography, Divider } from '@mui/material';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { CalendarSectionProps } from '../../type/reservation/reservation';

const CalendarSection = ({
    stylistSchedule,
    selectedDate,
    handleDateSelect,
    isHoliday
  }: CalendarSectionProps) => {
  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ marginY: 5, borderColor: 'grey.500', borderWidth: 2 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <CalendarIcon sx={{ fontSize: 20, mr: 1, color: 'gray' }} />
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'bold', fontSize: '18px' }}>
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
  );
};

export default CalendarSection;