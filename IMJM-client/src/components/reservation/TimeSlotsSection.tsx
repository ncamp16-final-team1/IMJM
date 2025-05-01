
import { Box, Typography, Divider } from '@mui/material';
import TimeSlot from './TimeSlots';
import { TimeSlotsSectionProps } from '../../type/reservation/reservation';


const TimeSlotsSection = ({
    isSelectedDateHoliday,
    selectedDate,
    isLoading,
    allTimeSlots,
    selectedTime,
    handleTimeSelect,
    isTimeSlotAvailable,
    isAM
  }: TimeSlotsSectionProps) => {
    if (isSelectedDateHoliday) return null;
    return (
      <Box sx={{ mt: 2 }}>
        <Divider sx={{ marginY: 5, borderColor: 'grey.500', borderWidth: 2 }} />
        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ fontWeight: 'bold', fontSize: '18px' }}>
          Reservation time
        </Typography>
        
        {isLoading ? (
          <Typography color="text.secondary">
            시간대 정보를 불러오는 중입니다...
          </Typography>
        ) : allTimeSlots.length > 0 ? (  
          <>
 
            {allTimeSlots.filter(time => isAM(time)).length > 0 && (
              <TimeSlot
                allTimeSlots={allTimeSlots.filter(time => isAM(time))}
                isAM={true}
                isLoading={isLoading}
                selectedTime={selectedTime}
                handleTimeSelect={handleTimeSelect}
                isTimeSlotAvailable={isTimeSlotAvailable}
                isSelectedDateHoliday={isSelectedDateHoliday}
                selectedDate={selectedDate}
              />
            )}
            

            {allTimeSlots.filter(time => !isAM(time)).length > 0 && (
              <TimeSlot
                allTimeSlots={allTimeSlots.filter(time => !isAM(time))}
                isAM={false}
                isLoading={isLoading}
                selectedTime={selectedTime}
                handleTimeSelect={handleTimeSelect}
                isTimeSlotAvailable={isTimeSlotAvailable}
                isSelectedDateHoliday={isSelectedDateHoliday}
                selectedDate={selectedDate}
              />
            )}
          </>
        ) : (
          <Typography color="text.secondary">
            예약 가능한 시간이 없습니다.
          </Typography>
        )}
      </Box>
    );
  };

export default TimeSlotsSection;