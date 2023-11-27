import { TextFieldProps } from '@mui/material';
import { FieldAttributes, Field as FormikField } from 'formik';
import { TextField as FormikMUITextField } from 'formik-mui';

type Props = FieldAttributes<TextFieldProps>;

export const TextField = ({ sx, ...props }: Props) => (
  <FormikField
    component={FormikMUITextField}
    sx={{ marginBottom: 1.5, ...sx }}
    variant="standard"
    {...props}
  />
);
