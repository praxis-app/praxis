import { Grid, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { ChangeType } from '../../../constants/shared.constants';
import Change from './Change';

interface Props {
  label: string;
  oldValue?: string | number | null;
  oldValueIcon?: ReactNode;
  proposedValue?: string | number | null;
  proposedValueIcon?: ReactNode;
}

const ChangeDelta = ({
  label,
  oldValue,
  oldValueIcon,
  proposedValue,
  proposedValueIcon,
}: Props) => (
  <Grid item xs={6}>
    <Typography fontFamily="Inter Bold" fontSize={15} gutterBottom>
      {label}
    </Typography>

    <Change
      changeType={ChangeType.Remove}
      value={oldValue}
      valueIcon={oldValueIcon}
    />
    <Change
      changeType={ChangeType.Add}
      value={proposedValue}
      valueIcon={proposedValueIcon}
    />
  </Grid>
);

export default ChangeDelta;
