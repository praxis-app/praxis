import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Input from '@mui/material/Input';
import Slider from '@mui/material/Slider';
import { useState } from 'react';

const SliderInput = () => {
  const [value, setValue] = useState(30);

  const handleSliderChange = (_: Event, newValue: number) => {
    setValue(newValue);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value === '' ? 0 : Number(event.target.value));
  };

  const handleBlur = () => {
    if (value < 0) {
      setValue(0);
    } else if (value > 100) {
      setValue(100);
    }
  };

  return (
    <Box sx={{ width: 250 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs>
          <Slider
            value={typeof value === 'number' ? value : 0}
            onChange={handleSliderChange}
          />
        </Grid>
        <Grid item>
          <Input
            value={value}
            size="small"
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputProps={{
              step: 10,
              min: 0,
              max: 100,
              type: 'number',
            }}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SliderInput;
