import { Grid, SxProps, Typography, useTheme } from '@mui/material';
import ChangeIcon from './ChangeIcon';
import Flex from '../../Shared/Flex';
import { ChangeType } from '../../../constants/shared.constants';

interface Props {
  proposedValue?: string | number | null;
  oldValue?: string | number | null;
  label: string;
}

const ProposedChange = ({ proposedValue, oldValue, label }: Props) => {
  const theme = useTheme();

  const changeStyles: SxProps = {
    borderColor: theme.palette.divider,
    borderRadius: 1,
    borderStyle: 'solid',
    borderWidth: 1,
    fontSize: 14,
    marginBottom: 1,
    paddingX: 0.6,
    paddingY: 0.5,
  };

  return (
    <Grid item xs={6}>
      <Typography fontFamily="Inter Bold" fontSize={15} gutterBottom>
        {label}
      </Typography>

      <Flex sx={changeStyles}>
        <ChangeIcon
          changeType={ChangeType.Remove}
          sx={{ marginRight: '0.8ch' }}
        />
        <Typography color="primary" fontSize="inherit" marginRight="0.25ch">
          {oldValue}
        </Typography>
      </Flex>

      <Flex sx={changeStyles}>
        <ChangeIcon changeType={ChangeType.Add} sx={{ marginRight: '0.8ch' }} />
        <Typography color="primary" fontSize="inherit" marginRight="0.25ch">
          {proposedValue}
        </Typography>
      </Flex>
    </Grid>
  );
};

export default ProposedChange;
