import { InputBaseComponentProps, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Slider, { SliderProps } from '@mui/material/Slider';
import { ChangeEvent } from 'react';
import { useIsDesktop } from '../../hooks/shared.hooks';

interface Props extends Omit<SliderProps, 'value'> {
  name: string;
  disabled?: boolean;
  onInputBlur: () => void;
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSliderChange: (_: Event, newValue: number) => void;
  showPercentSign?: boolean;
  value?: number | null;
  onClick?: () => void;
  width?: number | number[] | string;
}

const SliderInput = ({
  name,
  disabled,
  onInputBlur,
  onInputChange,
  onClick,
  width,
  onSliderChange,
  showPercentSign,
  value,
  ...sliderProps
}: Props) => {
  const isDesktop = useIsDesktop();

  const inputProps: InputBaseComponentProps = {
    min: 0,
    max: 100,
    type: 'number',
  };

  return (
    <Grid
      width={width || [150, 200]}
      alignItems="center"
      onClick={onClick}
      container
    >
      <Grid item xs paddingRight="15px">
        <Slider
          value={typeof value === 'number' ? value : 0}
          disabled={disabled}
          name={name}
          onChange={onSliderChange}
          size={isDesktop ? 'small' : 'medium'}
          step={5}
          {...sliderProps}
        />
      </Grid>
      <Grid item xs={isDesktop ? 3.2 : 1.9} paddingRight="5px">
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
        <Grid xs={1} item>
          <Typography paddingBottom={0.25}>%</Typography>
        </Grid>
      )}
    </Grid>
  );
};

export default SliderInput;
