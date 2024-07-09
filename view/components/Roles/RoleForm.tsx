import {
  Card,
  CardProps,
  FormGroup,
  CardContent as MuiCardContent,
  styled,
} from '@mui/material';
import { Form, Formik, FormikHelpers } from 'formik';
import { ColorResult } from 'react-color';
import { useTranslation } from 'react-i18next';
import { FieldNames } from '../../constants/shared.constants';
import { GroupRoleFragment } from '../../graphql/groups/fragments/gen/GroupRole.gen';
import { ServerRoleFragment } from '../../graphql/roles/fragments/gen/ServerRole.gen';
import ColorPicker from '../Shared/ColorPicker';
import Flex from '../Shared/Flex';
import PrimaryActionButton from '../Shared/PrimaryActionButton';
import { TextField } from '../Shared/TextField';

const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': {
    paddingBottom: 18,
  },
}));

interface InitialValues {
  name: string;
}

type HandleSubmit = (
  formValues: InitialValues,
  formHelpers: FormikHelpers<InitialValues>,
) => Promise<void>;

interface Props extends CardProps {
  color: string;
  colorPickerKey: string;
  editRole?: ServerRoleFragment | GroupRoleFragment;
  handleSubmit: HandleSubmit;
  initialValues: InitialValues;
  setColor(color: string): void;
}

const RoleForm = ({
  color,
  colorPickerKey,
  editRole,
  handleSubmit,
  initialValues,
  setColor,
  ...cardProps
}: Props) => {
  const { t } = useTranslation();

  const handleChangeComplete = (color: ColorResult) => setColor(color.hex);

  const unsavedColorChange = () => {
    if (!editRole) {
      return false;
    }
    return editRole.color !== color;
  };

  const isSubmitButtonDisabled = (isSubmitting: boolean, dirty: boolean) => {
    if (isSubmitting) {
      return true;
    }
    if (unsavedColorChange()) {
      return false;
    }
    return !dirty;
  };

  return (
    <Card {...cardProps}>
      <CardContent>
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ isSubmitting, dirty }) => (
            <Form>
              <FormGroup>
                <TextField
                  autoComplete="off"
                  label={t('groups.form.name')}
                  name={FieldNames.Name}
                />

                <ColorPicker
                  color={color}
                  key={colorPickerKey}
                  label={t('roles.form.colorPickerLabel')}
                  onChange={handleChangeComplete}
                  sx={{ marginBottom: 1.25 }}
                />
              </FormGroup>

              <Flex justifyContent="end">
                <PrimaryActionButton
                  disabled={isSubmitButtonDisabled(isSubmitting, dirty)}
                  isLoading={isSubmitting}
                  sx={{ marginTop: 1.5 }}
                  type="submit"
                >
                  {editRole ? t('actions.save') : t('actions.create')}
                </PrimaryActionButton>
              </Flex>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
};

export default RoleForm;
