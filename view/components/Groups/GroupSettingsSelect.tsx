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
  errors?: FormikErrors<any>;
  fieldName: GroupSettingsFieldName;
  label: string;
  onChange: (event: SelectChangeEvent<any>, child: ReactNode) => void;
  value?: number | string | null;
  divider?: boolean;
  dividerStyles?: SxProps;
}

const GroupSettingsSelect = ({
  children,
  description,
  errors,
  fieldName,
  label,
  onChange,
  value,
  divider = true,
  dividerStyles,
}: Props) => {
  const isDesktop = useIsDesktop();

  const selectStyles: SxProps = {
    color: 'text.secondary',
    marginY: isDesktop ? 0 : 1.5,
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
        <Box width={isDesktop ? SETTING_DESCRIPTION_WIDTH : '100%'}>
          <Typography>{label}</Typography>

          <Typography
            fontSize={12}
            color="text.secondary"
            paddingBottom={isDesktop ? 0 : 0.5}
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
          sx={selectStyles}
          variant={isDesktop ? 'standard' : 'filled'}
          disableUnderline
        >
          {children}
        </Select>
      </Flex>

      {divider && (
        <Divider
          sx={{
            marginTop: isDesktop ? 3 : 2.25,
            marginBottom: 3,
            ...dividerStyles,
          }}
        />
      )}
    </>
  );
};

export default GroupSettingsSelect;
