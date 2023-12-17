import { InputBaseComponentProps, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Slider from '@mui/material/Slider';
import { ChangeEvent } from 'react';

interface Props {
  name: string;
  disabled?: boolean;
  onInputBlur: () => void;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSliderChange: (_: Event, newValue: number) => void;
  showPercentSign?: boolean;
  value?: number | null;
  onClick?: () => void;
}

const SliderInput = ({
  name,
  disabled,
  onInputBlur,
  onInputChange,
  onClick,
  onSliderChange,
  showPercentSign,
  value,
}: Props) => {
  const inputProps: InputBaseComponentProps = {
    min: 0,
    max: 100,
    type: 'number',
  };

  return (
    <Grid width={[150, 200]} alignItems="center" onClick={onClick} container>
      <Grid item xs paddingRight="15px">
        <Slider
          value={typeof value === 'number' ? value : 0}
          disabled={disabled}
          name={name}
          onChange={onSliderChange}
          size="small"
          step={5}
        />
      </Grid>
      <Grid item paddingRight="5px">
        <Input
          value={value}
          disabled={disabled}
          inputProps={inputProps}
          name={name}
          onBlur={onInputBlur}
          onChange={onInputChange}
          size="small"
          disableUnderline
        />
      </Grid>
      {showPercentSign && (
        <Grid>
          <Typography paddingBottom={0.25}>%</Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default SliderInput;
