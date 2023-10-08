import { DateTimePickerProps } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';

const DateTimePicker = ({
  defaultValue,
  label,
  onChange,
  value,
}: DateTimePickerProps<any>) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <MuiDateTimePicker
      defaultValue={defaultValue}
      label={label}
      onChange={onChange}
      slotProps={{ textField: { variant: 'standard' } }}
      sx={{ marginBottom: 1.5 }}
      value={value}
    />
  </LocalizationProvider>
);

export default DateTimePicker;
