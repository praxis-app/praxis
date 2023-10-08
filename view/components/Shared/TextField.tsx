import { TextFieldProps } from '@mui/material';
import { Field as FormikField, FieldAttributes } from 'formik';
import { TextField as FormikMUITextField } from 'formik-mui';

export const TextField = (props: FieldAttributes<TextFieldProps>) => (
  <FormikField
    component={FormikMUITextField}
    sx={{ marginBottom: 1.5 }}
    variant="standard"
    {...props}
  />
);
