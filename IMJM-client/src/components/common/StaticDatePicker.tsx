import { StaticDatePicker } from '@mui/x-date-pickers/StaticDatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TextField } from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';

interface StaticDatePickerProps {
  value: Dayjs | null;
  onChange: (newValue: Dayjs | null) => void;
  disablePast?: boolean;
  slotProps: any;
}

const StaticDatePickerComponent = ({
  value,
  onChange,
  disablePast = false,
}: StaticDatePickerProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <StaticDatePicker
        displayStaticWrapperAs="desktop"
        value={value}
        onChange={onChange}
        disablePast={disablePast}
        format="YYYY-MM-DD"
        slotProps={{
          textField: {
            fullWidth: true,
            size: 'small',
          } as any,
        }}
      />
    </LocalizationProvider>
  );
};

export default StaticDatePickerComponent;