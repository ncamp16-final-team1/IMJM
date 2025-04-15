// src/components/reservation/TimeSlots.tsx
import { Box, Typography } from '@mui/material';
import { TimeSlotProps } from '../../type/reservation/reservation'; // 프로젝트 구조에 맞게 경로 유지

// TimeSlot 컴포넌트 업데이트
const TimeSlot = ({
    allTimeSlots,
    isAM,
    isLoading,
    selectedTime,
    handleTimeSelect,
    isTimeSlotAvailable,
    isSelectedDateHoliday,
    selectedDate
  }: TimeSlotProps) => {
  // isAM이 함수인 경우의 필터링 로직 제거 (이미 TimeSlotsSection에서 필터링됨)
  
  if (allTimeSlots.length === 0) {
    return null;
  }

  return (
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
        {isAM ? 'A.M' : 'P.M'}
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
          {allTimeSlots.map((time) => {
            const isAvailable = isTimeSlotAvailable(time, isSelectedDateHoliday, selectedDate);
            const isSelected = selectedTime === time;
            
            return (
              <Box
                key={time}
                onClick={() => handleTimeSelect(time, isSelectedDateHoliday, selectedDate)}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  width: { xs: '99px', sm: '108px' },
                  textAlign: 'center',
                  backgroundColor: isSelected && isAvailable
                    ? '#F7A399' 
                    : isAvailable 
                      ? '#FDC7BF' 
                      : '#f5f5f5',
                  color: isAvailable ? 'text.primary' : 'text.disabled',
                  cursor: isAvailable ? 'pointer' : 'default',
                  opacity: isAvailable ? 1 : 0.4,
                  border: isAvailable 
                    ? isSelected
                      ? '1px solid #F06292'
                      : '1px solid #FDC7BF' 
                    : '1px solid #e0e0e0',
                  fontWeight: isSelected && isAvailable ? 'bold' : 'normal',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: isAvailable 
                      ? isSelected 
                        ? '#F7A399'
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
  );
};

export default TimeSlot;