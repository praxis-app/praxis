import { Warning } from '@mui/icons-material';
import {
  Box,
  Divider,
  Select,
  SelectChangeEvent,
  SxProps,
  Typography,
} from '@mui/material';
import { FormikErrors } from 'formik';
import { ReactNode } from 'react';
import { GroupSettingsFieldName } from '../../constants/group.constants';
import { useIsDesktop } from '../../hooks/shared.hooks';
import Flex from '../Shared/Flex';

const SETTING_DESCRIPTION_WIDTH = '60%';

interface Props {
  children: ReactNode;
  description: string;
  divider?: boolean;
  dividerStyles?: SxProps;
  errors?: FormikErrors<any>;
  fieldName: GroupSettingsFieldName;
  label: string;
  onChange: (event: SelectChangeEvent<any>, child: ReactNode) => void;
  value?: number | string | null;
  warningMessage?: string;
}

const GroupSettingsSelect = ({
  children,
  description,
  divider = true,
  dividerStyles,
  errors,
  fieldName,
  label,
  onChange,
  value,
  warningMessage,
}: Props) => {
  const isDesktop = useIsDesktop();

  const selectStyles: SxProps = {
    color: 'text.secondary',
    width: isDesktop ? undefined : '100%',

    '& .MuiSelect-select': {
      paddingY: isDesktop ? undefined : 1.5,
    },
    borderRadius: '4px',
  };

  return (
    <>
      <Flex
        justifyContent="space-between"
        flexDirection={isDesktop ? 'row' : 'column'}
      >
        <Box
          width={isDesktop ? SETTING_DESCRIPTION_WIDTH : '100%'}
          marginBottom={isDesktop ? 0 : 3}
        >
          <Typography>{label}</Typography>
          <Typography fontSize={12} color="text.secondary">
            {description}
          </Typography>
        </Box>

        <Select
          value={value}
          name={fieldName}
          onChange={onChange}
          error={!!errors?.[fieldName]}
          sx={selectStyles}
          variant={isDesktop ? 'standard' : 'filled'}
          disableUnderline
        >
          {children}
        </Select>
      </Flex>

      {!!errors?.[fieldName] && (
        <Typography
          color="error"
          fontSize={12}
          maxHeight={[undefined, 2.5]}
          marginTop={isDesktop ? -1 : 1.5}
          marginBottom={isDesktop ? 1.5 : 0}
        >
          {errors[fieldName]?.toString()}
        </Typography>
      )}

      {warningMessage && (
        <Typography
          color="#ffb74d"
          fontSize={12}
          marginTop={isDesktop ? 1 : 2.5}
          width={isDesktop ? SETTING_DESCRIPTION_WIDTH : '100%'}
        >
          <Warning
            sx={{
              fontSize: 14,
              marginBottom: -0.3,
              marginRight: '0.5ch',
            }}
          />
          {warningMessage}
        </Typography>
      )}

      {divider && (
        <Divider
          sx={{
            marginTop: isDesktop ? 3 : 3.5,
            marginBottom: 3,
            ...dividerStyles,
          }}
        />
      )}
    </>
  );
};

export default GroupSettingsSelect;
