import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Slider from '@mui/material/Slider';

interface Props {
  onInputBlur: () => void;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSliderChange: (_: Event, newValue: number) => void;
  value?: number | null;
  name: string;
}

const SliderInput = ({
  onInputBlur,
  onInputChange,
  onSliderChange,
  value,
  name,
}: Props) => {
  const inputProps = {
    step: 10,
    min: 0,
    max: 100,
    type: 'number',
  };

  return (
    <Grid container alignItems="center" width={200}>
      <Grid item xs paddingRight="15px">
        <Slider
          name={name}
          onChange={onSliderChange}
          size="small"
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
      <Grid>
        <Typography paddingBottom={0.25}>%</Typography>
      </Grid>
    </Grid>
  );
};

export default SliderInput;
