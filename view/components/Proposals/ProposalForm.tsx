import {
  Divider,
  FormControl,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
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
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ProposalActionFieldName,
  ProposalFormFieldName,
} from '../../constants/proposal.constants';
import { NavigationPaths, TypeNames } from '../../constants/shared.constants';
import { toastVar } from '../../graphql/cache';
import {
  CreateProposalInput,
  ProposalActionInput,
  ProposalActionType,
  UpdateProposalInput,
} from '../../graphql/gen';
import {
  GroupFeedDocument,
  GroupFeedQuery,
  GroupFeedQueryVariables,
} from '../../graphql/groups/queries/gen/GroupFeed.gen';
import { useDeleteImageMutation } from '../../graphql/images/mutations/gen/DeleteImage.gen';
import { ProposalFormFragment } from '../../graphql/proposals/fragments/gen/ProposalForm.gen';
import { useCreateProposalMutation } from '../../graphql/proposals/mutations/gen/CreateProposal.gen';
import { useUpdateProposalMutation } from '../../graphql/proposals/mutations/gen/UpdateProposal.gen';
import { ToggleFormsFragment } from '../../graphql/users/fragments/gen/ToggleForms.gen';
import {
  HomeFeedDocument,
  HomeFeedQuery,
  HomeFeedQueryVariables,
} from '../../graphql/users/queries/gen/HomeFeed.gen';
import {
  UserProfileFeedDocument,
  UserProfileFeedQuery,
  UserProfileFeedQueryVariables,
} from '../../graphql/users/queries/gen/UserProfileFeed.gen';
import { isEntityTooLarge } from '../../utils/error.utils';
import { validateImageInput } from '../../utils/image.utils';
import { getProposalActionTypeOptions } from '../../utils/proposal.utils';
import { getRandomString } from '../../utils/shared.utils';
import AttachedImagePreview from '../Images/AttachedImagePreview';
import ImageInput from '../Images/ImageInput';
import DateTimePicker from '../Shared/DateTimePicker';
import Flex from '../Shared/Flex';
import PrimaryActionButton from '../Shared/PrimaryActionButton';
import TextFieldWithAvatar from '../Shared/TextFieldWithAvatar';
import ProposalActionEvent from './ProposalActions/ProposalActionEvent';
import ProposalActionFields from './ProposalActions/ProposalActionFields';
import ProposalActionGroupSettings from './ProposalActions/ProposalActionGroupSettings';
import ProposalActionRole from './ProposalActions/ProposalActionRole';
import ProposeEventModal from './ProposalActions/ProposeEventModal';
import ProposeGroupSettingsModal from './ProposalActions/ProposeGroupSettingsModal';
import ProposeRoleModal from './ProposalActions/ProposeRoleModal';

type ProposalFormErrors = {
  action: FormikErrors<ProposalActionInput>;
  body?: string;
  groupId?: string;
};

interface Props extends FormikFormProps {
  currentUserId: number;
  editProposal?: ProposalFormFragment;
  groupId?: number;
  joinedGroups: ToggleFormsFragment['joinedGroups'];
}

const ProposalForm = ({
  currentUserId,
  editProposal,
  groupId,
  joinedGroups,
  ...formProps
}: Props) => {
  const [clicked, setClicked] = useState(false);
  const [selectInputsKey, setSelectInputsKey] = useState('');

  const [createProposal] = useCreateProposalMutation();
  const [updateProposal] = useUpdateProposalMutation();
  const [deleteImage] = useDeleteImageMutation();

  const { pathname } = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const action: ProposalActionInput = {
    actionType: editProposal?.action.actionType || ('' as ProposalActionType),
    groupDescription: editProposal?.action.groupDescription || '',
    groupName: editProposal?.action.groupName || '',
  };
  const initialValues: CreateProposalInput = {
    body: editProposal?.body || '',
    action,
    groupId,
  };
  const actionTypeOptions = getProposalActionTypeOptions(t);
  const isGroupPage = pathname.includes(NavigationPaths.Groups);

  const getSelectedGroupVotingTimeLimit = (
    groupId: number | null | undefined,
  ) => {
    const selectedGroup = joinedGroups?.find((group) => group.id === groupId);
    return selectedGroup?.settings.votingTimeLimit;
  };

  const getClosingAtMinDateTime = (groupId: number | null | undefined) => {
    const votingTimeLimit = getSelectedGroupVotingTimeLimit(groupId);
    if (!votingTimeLimit) {
      return null;
    }
    return dayjs().add(votingTimeLimit, 'minutes');
  };

  const validateProposal = ({ body, action, groupId }: CreateProposalInput) => {
    const errors: ProposalFormErrors = {
      action: {},
    };
    if (body && body.length > 6000) {
      errors.body = t('proposals.errors.longBody');
    }
    if (!action.actionType) {
      errors.action.actionType = t('proposals.errors.missingActionType');
    }
    if (action.actionType === 'CHANGE_GROUP_NAME' && !action.groupName) {
      errors.action.groupName = t('proposals.errors.missingGroupName');
    }
    if (
      action.actionType === 'CHANGE_GROUP_DESCRIPTION' &&
      !action.groupDescription
    ) {
      errors.action.groupDescription = t(
        'proposals.errors.missingGroupDescription',
      );
    }
    if (
      action.actionType === 'CHANGE_GROUP_COVER_PHOTO' &&
      !editProposal?.action.groupCoverPhoto &&
      !action.groupCoverPhoto
    ) {
      errors.action.groupCoverPhoto = t(
        'proposals.errors.missingGroupCoverPhoto',
      );
    }
    if (
      (action.actionType === 'CREATE_GROUP_ROLE' ||
        action.actionType === 'CHANGE_GROUP_ROLE') &&
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
        cache.updateQuery<HomeFeedQuery, HomeFeedQueryVariables>(
          {
            query: HomeFeedDocument,
            variables: {
              input: { limit: 10, offset: 0, feedType: 'YOUR_FEED' },
              isLoggedIn: true,
            },
          },
          (homePageData) =>
            produce(homePageData, (draft) => {
              draft?.me?.homeFeed.nodes.unshift(proposal);
            }),
        );
        cache.updateQuery<UserProfileFeedQuery, UserProfileFeedQueryVariables>(
          {
            query: UserProfileFeedDocument,
            variables: {
              name: proposal.user.name,
              isLoggedIn: true,
              limit: 10,
              offset: 0,
            },
          },
          (userProfileFeedData) =>
            produce(userProfileFeedData, (draft) => {
              draft?.user.profileFeed.unshift(proposal);
            }),
        );
        if (proposal.group) {
          cache.updateQuery<GroupFeedQuery, GroupFeedQueryVariables>(
            {
              query: GroupFeedDocument,
              variables: {
                name: proposal.group.name,
                isLoggedIn: true,
                isVerified: true,
                limit: 10,
                offset: 0,
              },
            },
            (groupFeedData) =>
              produce(groupFeedData, (draft) => {
                draft?.group.feed.unshift(proposal);
              }),
          );
        }
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
    { body, images, ...formValues }: CreateProposalInput,
    formHelpers: FormikHelpers<CreateProposalInput>,
  ) => {
    const values = {
      ...formValues,
      body: body?.trim(),
      images,
    };
    try {
      const allImages = [
        ...(images || []),
        formValues.action.groupCoverPhoto,
      ].filter((image) => !!image);

      if (allImages.length) {
        validateImageInput(allImages);
      }
      if (editProposal) {
        await handleUpdate(values, editProposal);
        return;
      }
      await handleCreate(values, formHelpers);
    } catch (err) {
      const title = isEntityTooLarge(err)
        ? t('errors.imageTooLarge')
        : String(err);
      toastVar({
        status: 'error',
        title,
      });
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
      setFieldValue(ProposalFormFieldName.Images, images);

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
        ProposalFormFieldName.Images,
        images.filter((image) => image.name !== imageName),
      );
    };

  const handleGroupSelectChange = (
    { target }: SelectChangeEvent<number>,
    setFieldValue: (field: string, value: any) => void,
  ) => {
    const closingAt = getClosingAtMinDateTime(+target.value);
    if (closingAt) {
      setFieldValue(
        ProposalFormFieldName.ClosingAt,
        closingAt.add(1, 'minutes'),
      );
    } else {
      setFieldValue(ProposalFormFieldName.ClosingAt, null);
    }
    setFieldValue(ProposalFormFieldName.GroupId, target.value);
  };

  const handleModalClose = (
    setFieldValue: (field: string, value: ProposalActionInput | null) => void,
  ) => {
    if (!isGroupPage) {
      setFieldValue(ProposalFormFieldName.GroupId, null);
    }
    setFieldValue(ProposalFormFieldName.Action, action);
    setFieldValue(ProposalFormFieldName.ClosingAt, null);
    setSelectInputsKey(getRandomString());
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
              name={ProposalFormFieldName.Body}
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

                {joinedGroups && !editProposal && !isGroupPage && (
                  <FormControl
                    error={!!(errors.groupId && touched.groupId)}
                    sx={{ marginBottom: 1 }}
                    variant="standard"
                  >
                    <InputLabel>{t('groups.labels.group')}</InputLabel>
                    <Select
                      key={selectInputsKey}
                      name="groupId"
                      onChange={(event) =>
                        handleGroupSelectChange(event, setFieldValue)
                      }
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

                <DateTimePicker
                  label={t('proposals.labels.closingTime')}
                  minDateTime={getClosingAtMinDateTime(values?.groupId)}
                  onChange={(value: Dayjs | null) =>
                    setFieldValue(ProposalFormFieldName.ClosingAt, value)
                  }
                  value={values.closingAt || null}
                  sx={{ marginBottom: values.action.actionType ? 1 : 0.25 }}
                  disablePast
                />

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
                    actionType={values.action.actionType}
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

                {values.action.groupSettings && (
                  <ProposalActionGroupSettings
                    groupSettings={values.action.groupSettings}
                    groupId={values.groupId}
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

          <ProposeRoleModal
            key={`${values.action.actionType}-${values.groupId}`}
            actionType={values.action.actionType}
            groupId={values.groupId}
            onClose={() => handleModalClose(setFieldValue)}
            setFieldValue={setFieldValue}
          />
          <ProposeEventModal
            actionType={values.action.actionType}
            currentUserId={currentUserId}
            groupId={values.groupId}
            onClose={() => handleModalClose(setFieldValue)}
            setFieldValue={setFieldValue}
          />
          <ProposeGroupSettingsModal
            actionType={values.action.actionType}
            currentUserId={currentUserId}
            groupId={values.groupId}
            onClose={() => handleModalClose(setFieldValue)}
            setFieldValue={setFieldValue}
          />

          {!clicked && !editProposal && <Divider sx={{ marginBottom: 1.3 }} />}

          <Flex sx={{ justifyContent: 'space-between' }}>
            <ImageInput
              key={values.images?.length}
              onChange={handleImageInputChange(setFieldValue)}
              disabled={values.action.actionType === 'CHANGE_GROUP_COVER_PHOTO'}
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
        </Form>
      )}
    </Formik>
  );
};

export default ProposalForm;
