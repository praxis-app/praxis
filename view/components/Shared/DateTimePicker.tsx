import { DateTimePickerProps } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';

type Props = Pick<
  DateTimePickerProps<any>,
  'defaultValue' | 'label' | 'minDateTime' | 'onChange' | 'value'
>;

const DateTimePicker = ({
  defaultValue,
  label,
  minDateTime,
  onChange,
  value,
}: Props) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <MuiDateTimePicker
      defaultValue={defaultValue}
      label={label}
      minDateTime={minDateTime}
      onChange={onChange}
      slotProps={{ textField: { variant: 'standard' } }}
      sx={{ marginBottom: 1.5 }}
      value={value}
    />
  </LocalizationProvider>
);

export default DateTimePicker;
