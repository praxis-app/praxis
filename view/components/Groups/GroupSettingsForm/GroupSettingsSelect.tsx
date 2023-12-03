import { Box, Select, SelectChangeEvent, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { GroupSettingsFieldName } from '../../../constants/group.constants';
import Flex from '../../Shared/Flex';

const SETTING_DESCRIPTION_WIDTH = '60%';

interface Props {
  children: ReactNode;
  description: string;
  fieldName: GroupSettingsFieldName;
  label: string;
  onChange: (event: SelectChangeEvent<any>, child: ReactNode) => void;
  value?: number | string | null;
}

const GroupSettingsSelect = ({
  children,
  description,
  fieldName,
  label,
  onChange,
  value,
}: Props) => {
  return (
    <Flex justifyContent="space-between">
      <Box width={SETTING_DESCRIPTION_WIDTH}>
        <Typography>{label}</Typography>

        <Typography fontSize={12} color="text.secondary">
          {description}
        </Typography>
      </Box>

      <Select
        name={fieldName}
        onChange={onChange}
        sx={{ color: 'text.secondary' }}
        value={value}
        variant="standard"
        disableUnderline
      >
        {children}
      </Select>
    </Flex>
  );
};

export default GroupSettingsSelect;
