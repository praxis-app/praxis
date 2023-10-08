import {
  Card,
  CardContent as MuiCardContent,
  FormControl,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  styled,
} from '@mui/material';
import { Form, Formik, FormikHelpers } from 'formik';
import { produce } from 'immer';
import { useTranslation } from 'react-i18next';
import { toastVar } from '../../apollo/cache';
import { useCreateServerInviteMutation } from '../../apollo/invites/generated/CreateServerInvite.mutation';
import {
  ServerInvitesDocument,
  ServerInvitesQuery,
} from '../../apollo/invites/generated/ServerInvites.query';
import { Time } from '../../constants/shared.constants';
import {
  MAX_USES_OPTIONS,
  ServerInviteFieldNames,
} from '../../constants/server-invite.constants';
import Flex from '../Shared/Flex';
import PrimaryActionButton from '../Shared/PrimaryActionButton';

const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': {
    paddingBottom: 24,
  },
}));

interface FormValues {
  expiresAt: number | '';
  maxUses: number | '';
}

const ServerInviteForm = () => {
  const [createInvite] = useCreateServerInviteMutation();
  const { t } = useTranslation();

  const initialValues: FormValues = {
    expiresAt: '',
    maxUses: '',
  };

  const expiresAtOptions = [
    {
      message: t('invites.form.expiresAtOptions.oneDay'),
      value: Time.Day,
    },
    {
      message: t('invites.form.expiresAtOptions.sevenDays'),
      value: Time.Week,
    },
    {
      message: t('invites.form.expiresAtOptions.oneMonth'),
      value: Time.Month,
    },
    {
      message: t('invites.form.expiresAtOptions.never'),
      value: '',
    },
  ];

  const getFormattedExpiresAt = (expiresAt: number | '') => {
    if (expiresAt === '') {
      return null;
    }
    return new Date(Date.now() + expiresAt * 1000);
  };

  const handleSubmit = async (
    { maxUses, expiresAt }: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>,
  ) => {
    try {
      await createInvite({
        variables: {
          serverInviteData: {
            expiresAt: getFormattedExpiresAt(expiresAt),
            maxUses: maxUses === '' ? null : maxUses,
          },
        },
        async update(cache, { data }) {
          if (!data) {
            return;
          }
          const {
            createServerInvite: { serverInvite },
          } = data;
          cache.updateQuery<ServerInvitesQuery>(
            { query: ServerInvitesDocument },
            (serverInvitesData) =>
              produce(serverInvitesData, (draft) => {
                draft?.serverInvites.unshift(serverInvite);
              }),
          );
        },
        onCompleted() {
          setSubmitting(false);
          resetForm();
        },
      });
    } catch (err) {
      toastVar({
        status: 'error',
        title: String(err),
      });
    }
  };

  return (
    <Card>
      <CardContent>
        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ handleChange, values, isSubmitting }) => (
            <Form>
              <FormGroup sx={{ marginBottom: 1.5 }}>
                <FormControl variant="standard" sx={{ marginBottom: 1 }}>
                  <InputLabel>{t('invites.form.labels.expiresAt')}</InputLabel>
                  <Select
                    name={ServerInviteFieldNames.ExpiresAt}
                    onChange={handleChange}
                    value={values.expiresAt}
                  >
                    {expiresAtOptions.map((option) => (
                      <MenuItem value={option.value} key={option.value}>
                        {option.message}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl variant="standard">
                  <InputLabel>{t('invites.form.labels.maxUses')}</InputLabel>
                  <Select
                    name={ServerInviteFieldNames.MaxUses}
                    onChange={handleChange}
                    value={values.maxUses}
                  >
                    {MAX_USES_OPTIONS.map((option) => (
                      <MenuItem value={option} key={option}>
                        {t('invites.form.maxUsesOptions.xUses', {
                          count: option,
                        })}
                      </MenuItem>
                    ))}
                    <MenuItem value={''}>
                      {t('invites.form.maxUsesOptions.noLimit')}
                    </MenuItem>
                  </Select>
                </FormControl>
              </FormGroup>

              <Flex justifyContent="end">
                <PrimaryActionButton
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  sx={{ marginTop: 1.5 }}
                  type="submit"
                >
                  {t('invites.actions.generateLink')}
                </PrimaryActionButton>
              </Flex>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
};

export default ServerInviteForm;
