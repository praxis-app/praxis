import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Slider from '@mui/material/Slider';

interface Props {
  name: string;
  onInputBlur: () => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSliderChange: (_: Event, newValue: number) => void;
  showPercentSign?: boolean;
  value?: number | null;
}

const SliderInput = ({
  name,
  onInputBlur,
  onInputChange,
  onSliderChange,
  showPercentSign,
  value,
}: Props) => {
  const inputProps = {
    step: 5,
    min: 0,
    max: 100,
    type: 'number',
  };

  return (
    <Grid container alignItems="center" width={[150, 200]}>
      <Grid item xs paddingRight="15px">
        <Slider
          name={name}
          onChange={onSliderChange}
          size="small"
          step={5}
          value={typeof value === 'number' ? value : 0}
        />
      </Grid>
      <Grid item paddingRight="5px">
        <Input
          inputProps={inputProps}
          name={name}
          onBlur={onInputBlur}
          onChange={onInputChange}
          size="small"
          value={value}
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
