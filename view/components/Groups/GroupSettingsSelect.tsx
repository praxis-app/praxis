import { Box, Select, SelectChangeEvent, Typography } from '@mui/material';
import { FormikErrors } from 'formik';
import { ReactNode } from 'react';
import { GroupSettingsFieldName } from '../../constants/group.constants';
import { useIsDesktop } from '../../hooks/shared.hooks';
import Flex from '../Shared/Flex';

const SETTING_DESCRIPTION_WIDTH = '60%';

interface Props {
  children: ReactNode;
  description: string;
  errors?: FormikErrors<any>;
  fieldName: GroupSettingsFieldName;
  label: string;
  onChange: (event: SelectChangeEvent<any>, child: ReactNode) => void;
  value?: number | string | null;
}

const GroupSettingsSelect = ({
  children,
  description,
  errors,
  fieldName,
  label,
  onChange,
  value,
}: Props) => {
  const isDesktop = useIsDesktop();

  return (
    <Flex
      justifyContent="space-between"
      flexDirection={isDesktop ? 'row' : 'column'}
    >
      <Box width={isDesktop ? SETTING_DESCRIPTION_WIDTH : '100%'}>
        <Typography>{label}</Typography>

        <Typography
          fontSize={12}
          color="text.secondary"
          paddingBottom={isDesktop ? 0 : 2}
        >
          {description}
        </Typography>

        {!!errors?.[fieldName] && (
          <Typography
            color="error"
            fontSize={12}
            marginTop={0.5}
            maxHeight={[undefined, 2.5]}
          >
            {errors[fieldName]?.toString()}
          </Typography>
        )}
      </Box>

      <Select
        value={value}
        name={fieldName}
        onChange={onChange}
        error={!!errors?.[fieldName]}
        sx={{ color: 'text.secondary' }}
        variant={isDesktop ? 'standard' : 'outlined'}
        disableUnderline
      >
        {children}
      </Select>
    </Flex>
  );
};

export default GroupSettingsSelect;
