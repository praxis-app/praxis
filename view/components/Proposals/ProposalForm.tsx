import {
  Divider,
  FormControl,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import {
  Form,
  Formik,
  FormikErrors,
  FormikFormProps,
  FormikHelpers,
} from 'formik';
import { produce } from 'immer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toastVar } from '../../apollo/cache';
import {
  CreateProposalInput,
  ProposalActionInput,
  UpdateProposalInput,
} from '../../apollo/gen';
import { useDeleteImageMutation } from '../../apollo/images/generated/DeleteImage.mutation';
import { useCreateProposalMutation } from '../../apollo/proposals/generated/CreateProposal.mutation';
import { ProposalFormFragment } from '../../apollo/proposals/generated/ProposalForm.fragment';
import { useUpdateProposalMutation } from '../../apollo/proposals/generated/UpdateProposal.mutation';
import {
  HomeFeedDocument,
  HomeFeedQuery,
} from '../../apollo/users/generated/HomeFeed.query';
import { useMeQuery } from '../../apollo/users/generated/Me.query';
import {
  ProposalActionFieldName,
  ProposalActionType,
} from '../../constants/proposal.constants';
import {
  FieldNames,
  NavigationPaths,
  TypeNames,
} from '../../constants/shared.constants';
import { getProposalActionTypeOptions } from '../../utils/proposal.utils';
import { getRandomString } from '../../utils/shared.utils';
import AttachedImagePreview from '../Images/AttachedImagePreview';
import ImageInput from '../Images/ImageInput';
import Flex from '../Shared/Flex';
import PrimaryActionButton from '../Shared/PrimaryActionButton';
import TextFieldWithAvatar from '../Shared/TextFieldWithAvatar';
import ProposalActionEvent from './ProposalActions/ProposalActionEvent';
import ProposalActionFields from './ProposalActions/ProposalActionFields';
import ProposalActionRole from './ProposalActions/ProposalActionRole';
import ProposeEventModal from './ProposalActions/ProposeEventModal';
import ProposeRoleModal from './ProposalActions/ProposeRoleModal';

type ProposalFormErrors = {
  action: FormikErrors<ProposalActionInput>;
  groupId?: string;
};

interface Props extends FormikFormProps {
  currentUserId: number;
  editProposal?: ProposalFormFragment;
  groupId?: number;
}

const ProposalForm = ({
  currentUserId,
  editProposal,
  groupId,
  ...formProps
}: Props) => {
  const [clicked, setClicked] = useState(false);
  const [selectInputsKey, setSelectInputsKey] = useState('');
  const { data } = useMeQuery();

  const [createProposal] = useCreateProposalMutation();
  const [updateProposal] = useUpdateProposalMutation();
  const [deleteImage] = useDeleteImageMutation();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const action: ProposalActionInput = {
    actionType: editProposal?.action.actionType || '',
    groupDescription: editProposal?.action.groupDescription || '',
    groupName: editProposal?.action.groupName || '',
  };
  const initialValues: CreateProposalInput = {
    body: editProposal?.body || '',
    action,
    groupId,
  };
  const actionTypeOptions = getProposalActionTypeOptions(t);
  const joinedGroups = data?.me?.joinedGroups;

  const validateProposal = ({ action, groupId }: CreateProposalInput) => {
    const errors: ProposalFormErrors = {
      action: {},
    };
    if (!action.actionType) {
      errors.action.actionType = t('proposals.errors.missingActionType');
    }
    if (
      action.actionType === ProposalActionType.ChangeName &&
      !action.groupName
    ) {
      errors.action.groupName = t('proposals.errors.missingGroupName');
    }
    if (
      action.actionType === ProposalActionType.ChangeDescription &&
      !action.groupDescription
    ) {
      errors.action.groupDescription = t(
        'proposals.errors.missingGroupDescription',
      );
    }
    if (
      action.actionType === ProposalActionType.ChangeCoverPhoto &&
      !editProposal?.action.groupCoverPhoto &&
      !action.groupCoverPhoto
    ) {
      errors.action.groupCoverPhoto = t(
        'proposals.errors.missingGroupCoverPhoto',
      );
    }
    if (
      (action.actionType === ProposalActionType.CreateRole ||
        action.actionType === ProposalActionType.ChangeRole) &&
      !action.role
    ) {
      errors.action.role = t('proposals.errors.missingRole');
    }
    if (!groupId && !editProposal) {
      errors.groupId = t('proposals.errors.missingGroupId');
    }
    if (!Object.keys(errors.action).length && !errors.groupId) {
      return {};
    }
    return errors;
  };

  const handleCreate = async (
    formValues: CreateProposalInput,
    { resetForm, setSubmitting }: FormikHelpers<CreateProposalInput>,
  ) =>
    await createProposal({
      variables: {
        proposalData: formValues,
      },
      update(cache, { data }) {
        if (!data) {
          return;
        }
        const {
          createProposal: { proposal },
        } = data;
        cache.updateQuery<HomeFeedQuery>(
          { query: HomeFeedDocument },
          (homePageData) =>
            produce(homePageData, (draft) => {
              draft?.me?.homeFeed.unshift(proposal);
            }),
        );
        cache.modify({
          id: cache.identify(proposal.user),
          fields: {
            profileFeed(existingRefs, { toReference }) {
              return [toReference(proposal), ...existingRefs];
            },
          },
        });
        if (!proposal.group) {
          return;
        }
        cache.modify({
          id: cache.identify(proposal.group),
          fields: {
            feed(existingRefs, { toReference }) {
              return [toReference(proposal), ...existingRefs];
            },
          },
        });
      },
      onCompleted() {
        resetForm();
        setClicked(false);
        setSubmitting(false);
      },
    });

  const handleUpdate = async (
    formValues: Omit<UpdateProposalInput, 'id'>,
    editProposal: ProposalFormFragment,
  ) => {
    navigate(NavigationPaths.Home);
    await updateProposal({
      variables: {
        proposalData: {
          id: editProposal.id,
          ...formValues,
        },
      },
    });
  };

  const handleSubmit = async (
    formValues: CreateProposalInput,
    formHelpers: FormikHelpers<CreateProposalInput>,
  ) => {
    try {
      if (editProposal) {
        await handleUpdate(formValues, editProposal);
        return;
      }
      await handleCreate(formValues, formHelpers);
    } catch (err) {
      toastVar({
        status: 'error',
        title: String(err),
      });
      console.error(err);
    }
  };

  const handleDeleteSavedImage = async (id: number) => {
    if (!editProposal) {
      return;
    }
    await deleteImage({
      variables: { id },
      update(cache) {
        const cacheId = cache.identify({ id, __typename: TypeNames.Image });
        cache.evict({ id: cacheId });
        cache.gc();
      },
    });
  };

  const handleImageInputChange =
    (setFieldValue: (field: string, value: File[]) => void) =>
    (images: File[]) =>
      setFieldValue(FieldNames.Images, images);

  const handleRemoveImage =
    (
      setFieldValue: (field: string, value: File[]) => void,
      images: CreateProposalInput['images'],
    ) =>
    (imageName: string) => {
      if (!images) {
        return;
      }
      setFieldValue(
        FieldNames.Images,
        images.filter((image) => image.name !== imageName),
      );
    };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validate={validateProposal}
      enableReinitialize
      {...formProps}
    >
      {({
        dirty,
        errors,
        handleChange,
        isSubmitting,
        submitCount,
        setFieldValue,
        touched,
        values,
      }) => (
        <Form onClick={() => setClicked(true)}>
          <FormGroup>
            <TextFieldWithAvatar
              autoComplete="off"
              name={FieldNames.Body}
              onChange={handleChange}
              placeholder={t('proposals.prompts.createProposal')}
              value={values.body}
              multiline
            />

            {!!(clicked || editProposal || values.body?.length) && (
              <>
                <FormControl
                  error={
                    !!errors.action?.actionType && touched.action?.actionType
                  }
                  sx={{ marginBottom: 1 }}
                  variant="standard"
                >
                  <InputLabel>{t('proposals.labels.action')}</InputLabel>
                  <Select
                    key={selectInputsKey}
                    name={ProposalActionFieldName.ActionType}
                    onChange={handleChange}
                    value={values.action.actionType}
                  >
                    {actionTypeOptions.map((option) => (
                      <MenuItem value={option.value} key={option.value}>
                        {option.message}
                      </MenuItem>
                    ))}
                  </Select>
                  {!!(errors.action?.actionType && submitCount) && (
                    <Typography color="error" fontSize="small" marginTop={0.5}>
                      {t('proposals.errors.missingActionType')}
                    </Typography>
                  )}
                </FormControl>

                {joinedGroups && !editProposal && (
                  <FormControl
                    error={!!(errors.groupId && touched.groupId)}
                    sx={{ marginBottom: values.action.actionType ? 1 : 0.25 }}
                    variant="standard"
                  >
                    <InputLabel>{t('groups.labels.group')}</InputLabel>
                    <Select
                      key={selectInputsKey}
                      name="groupId"
                      onChange={handleChange}
                      value={values.groupId || ''}
                    >
                      {joinedGroups.map(({ id, name }) => (
                        <MenuItem value={id} key={id}>
                          {name}
                        </MenuItem>
                      ))}
                    </Select>
                    {!!(errors.groupId && submitCount) && (
                      <Typography
                        color="error"
                        fontSize="small"
                        marginTop={0.5}
                        gutterBottom
                      >
                        {t('proposals.errors.missingGroupId')}
                      </Typography>
                    )}
                  </FormControl>
                )}

                <ProposalActionFields
                  editProposal={editProposal}
                  errors={errors}
                  setFieldValue={setFieldValue}
                  submitCount={submitCount}
                  touched={touched}
                  values={values}
                />

                {values.action.role && (
                  <ProposalActionRole
                    actionType={values.action.actionType as ProposalActionType}
                    role={values.action.role}
                    marginTop={3}
                    preview
                  />
                )}

                {values.action.event && (
                  <ProposalActionEvent
                    coverPhotoFile={values.action.event.coverPhoto}
                    event={values.action.event}
                    preview
                  />
                )}

                {errors.action?.role && !!submitCount && (
                  <Typography
                    color="error"
                    fontSize="small"
                    marginTop={0.5}
                    gutterBottom
                  >
                    {errors.action.role}
                  </Typography>
                )}
              </>
            )}

            {editProposal?.action.role && (
              <Typography marginTop={1.5}>
                {t('proposals.prompts.cannotEditProposedRoles')}
              </Typography>
            )}

            <AttachedImagePreview
              handleDelete={handleDeleteSavedImage}
              savedImages={editProposal?.images || []}
              selectedImages={values.images || []}
              handleRemove={handleRemoveImage(
                setFieldValue,
                values.images || [],
              )}
            />
          </FormGroup>

          {!clicked && !editProposal && <Divider sx={{ marginBottom: 1.3 }} />}

          <Flex sx={{ justifyContent: 'space-between' }}>
            <ImageInput
              key={values.images?.length}
              onChange={handleImageInputChange(setFieldValue)}
              multiple
            />

            <PrimaryActionButton
              disabled={isSubmitting || !dirty}
              isLoading={isSubmitting}
              sx={{ marginTop: 1.5 }}
              type="submit"
            >
              {editProposal
                ? t('actions.save')
                : t('proposals.actions.createProposal')}
            </PrimaryActionButton>
          </Flex>

          <ProposeRoleModal
            key={`${values.action.actionType}-${values.groupId}`}
            actionType={values.action.actionType}
            groupId={values.groupId}
            setFieldValue={setFieldValue}
            onClose={() => {
              setFieldValue('groupId', null);
              setFieldValue('action', action);
              setSelectInputsKey(getRandomString());
            }}
          />
          <ProposeEventModal
            actionType={values.action.actionType}
            currentUserId={currentUserId}
            groupId={values.groupId}
            onClose={() => {
              setFieldValue('groupId', null);
              setFieldValue('action', action);
              setSelectInputsKey(getRandomString());
            }}
            setFieldValue={setFieldValue}
          />
        </Form>
      )}
    </Formik>
  );
};

export default ProposalForm;
