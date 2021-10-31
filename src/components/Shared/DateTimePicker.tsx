// API: https://material-ui-pickers.dev/api/DateTimePicker

import {
  DateTimePicker as MUIDateTimePicker,
  DateTimePickerProps,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DayjsUtils from "@date-io/dayjs";

const DateTimePicker = (props: DateTimePickerProps) => {
  return (
    <MuiPickersUtilsProvider utils={DayjsUtils}>
      <MUIDateTimePicker minutesStep={5} {...props} />
    </MuiPickersUtilsProvider>
  );
};

export default DateTimePicker;
