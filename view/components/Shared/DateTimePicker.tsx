import { DateTimePickerProps } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { MobileDateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';

type Props = Pick<
  DateTimePickerProps<any>,
  | 'defaultValue'
  | 'disablePast'
  | 'label'
  | 'minDateTime'
  | 'onChange'
  | 'value'
  | 'sx'
>;

const DateTimePicker = ({
  defaultValue,
  disablePast,
  label,
  minDateTime,
  onChange,
  value,
  sx,
}: Props) => (
  <LocalizationProvider dateAdapter={AdapterDayjs}>
    <MuiDateTimePicker
      defaultValue={defaultValue}
      disablePast={disablePast}
      label={label}
      minDateTime={minDateTime}
      onChange={onChange}
      slotProps={{ textField: { variant: 'standard' } }}
      sx={{ marginBottom: 1.5, ...sx }}
      value={value}
    />
  </LocalizationProvider>
);

export default DateTimePicker;
