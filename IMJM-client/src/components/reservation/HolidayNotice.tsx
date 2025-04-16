
import { Box, Typography } from '@mui/material';
import { HolidayNoticeProps } from '../../type/reservation/reservation';

const HolidayNotice = ({ isSelectedDateHoliday }: HolidayNoticeProps) => {
  if (!isSelectedDateHoliday) return null;

  return (
    <Box sx={{ mt: 2, p: 2, backgroundColor: '#ffebee', borderRadius: 1 }}>
      <Typography color="error">
        선택하신 날짜는 휴무일입니다. 다른 날짜를 선택해주세요.
      </Typography>
    </Box>
  );
};

export default HolidayNotice;