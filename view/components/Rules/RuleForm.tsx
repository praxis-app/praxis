// TODO: Convert to a modal since its only ever used in modals

import { useReactiveVar } from '@apollo/client';
import { Button, FormGroup } from '@mui/material';
import { Form, Formik, FormikErrors } from 'formik';
import { produce } from 'immer';
import { useTranslation } from 'react-i18next';
import { isLoggedInVar, toastVar } from '../../graphql/cache';
import { CreateRuleInput, UpdateRuleInput } from '../../graphql/gen';
import { RuleFormFragment } from '../../graphql/rules/fragments/gen/RuleForm.gen';
import { useCreateRuleMutation } from '../../graphql/rules/mutations/gen/CreateRule.gen';
import { useUpdateRuleMutation } from '../../graphql/rules/mutations/gen/UpdateRule.gen';
import {
  ServerRulesDocument,
  ServerRulesQuery,
} from '../../graphql/rules/queries/gen/ServerRules.gen';
import Flex from '../Shared/Flex';
import PrimaryActionButton from '../Shared/PrimaryActionButton';
import { TextField } from '../Shared/TextField';

enum RuleFormFieldName {
  Title = 'title',
  Description = 'description',
}

interface Props {
  onSubmit(): void;
  onCancel(): void;
  editRule?: RuleFormFragment;
}

const RuleForm = ({ editRule, onSubmit, onCancel }: Props) => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [createRule] = useCreateRuleMutation();
  const [updateRule] = useUpdateRuleMutation();

  const { t } = useTranslation();

  const initialValues: CreateRuleInput = {
    [RuleFormFieldName.Title]: editRule?.title || '',
    [RuleFormFieldName.Description]: editRule?.description || '',
  };

  const handleSubmit = async (values: CreateRuleInput) => {
    if (editRule) {
      await updateRule({
        variables: {
          ruleData: {
            id: editRule.id,
            title: values[RuleFormFieldName.Title],
            description: values[RuleFormFieldName.Description],
          },
        },
        onError(err) {
          toastVar({
            status: 'error',
            title: err.message,
          });
        },
        onCompleted() {
          onSubmit();
        },
      });
      return;
    }
    await createRule({
      variables: {
        ruleData: {
          title: values[RuleFormFieldName.Title],
          description: values[RuleFormFieldName.Description],
        },
      },
      update(cache, { data }) {
        if (!data) {
          return;
        }
        cache.updateQuery<ServerRulesQuery>(
          {
            query: ServerRulesDocument,
            variables: { isLoggedIn },
          },
          (groupsData) =>
            produce(groupsData, (draft) => {
              draft?.serverRules.push(data.createRule.rule);
            }),
        );
      },
      onError(err) {
        toastVar({
          status: 'error',
          title: err.message,
        });
      },
      onCompleted() {
        onSubmit();
      },
    });
  };

  const validate = ({
    title,
    description,
  }: CreateRuleInput | UpdateRuleInput) => {
    const errors: FormikErrors<CreateRuleInput | UpdateRuleInput> = {};
    if (!title?.trim()) {
      errors.title = t('rules.errors.titleMissing');
    }
    if (!description?.trim()) {
      errors.description = t('rules.errors.descriptionMissing');
    }
    return errors;
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validate={validate}
    >
      {({ dirty, isSubmitting, errors, submitCount }) => (
        <Form>
          <FormGroup sx={{ marginBottom: 2 }}>
            <TextField
              autoComplete="off"
              label={t('rules.placeholders.title')}
              name={RuleFormFieldName.Title}
              error={!!errors.title && !!submitCount}
            />
            <TextField
              autoComplete="off"
              label={t('rules.placeholders.description')}
              name={RuleFormFieldName.Description}
              error={!!errors.description && !!submitCount}
              multiline
            />
          </FormGroup>

          <Flex justifyContent="flex-end" gap="8px">
            <Button
              sx={{
                marginTop: 1.5,
                textTransform: 'none',
                borderRadius: 9999,
                paddingX: '20px',
              }}
              onClick={onCancel}
            >
              {t('actions.cancel')}
            </Button>
            <PrimaryActionButton
              disabled={isSubmitting || !dirty}
              isLoading={isSubmitting}
              sx={{ marginTop: 1.5 }}
              type="submit"
            >
              {editRule ? t('actions.save') : t('actions.create')}
            </PrimaryActionButton>
          </Flex>
        </Form>
      )}
    </Formik>
  );
};

export default RuleForm;
