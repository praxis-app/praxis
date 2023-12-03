import { SxProps, Typography, useTheme } from '@mui/material';
import { ChangeType } from '../../../constants/shared.constants';
import Flex from '../../Shared/Flex';
import ChangeIcon from './ChangeIcon';
import { ReactNode } from 'react';

interface Props {
  value?: string | number | null;
  valueIcon?: ReactNode;
  changeType: ChangeType;
}

const Change = ({ value, valueIcon, changeType }: Props) => {
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
    <Flex sx={changeStyles}>
      <ChangeIcon changeType={changeType} sx={{ marginRight: '0.8ch' }} />
      {valueIcon}
      <Typography color="primary" fontSize="inherit" marginRight="0.25ch">
        {value}
      </Typography>
    </Flex>
  );
};

export default Change;
