import {
  Card,
  CardProps,
  FormGroup,
  CardContent as MuiCardContent,
  styled,
} from '@mui/material';
import { Form, Formik, FormikErrors } from 'formik';
import { produce } from 'immer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FieldNames, VALID_NAME_REGEX } from '../../constants/shared.constants';
import { toastVar } from '../../graphql/cache';
import { CreateGroupInput, UpdateGroupInput } from '../../graphql/gen';
import { GroupFormFragment } from '../../graphql/groups/fragments/gen/GroupForm.gen';
import { useCreateGroupMutation } from '../../graphql/groups/mutations/gen/CreateGroup.gen';
import { useUpdateGroupMutation } from '../../graphql/groups/mutations/gen/UpdateGroup.gen';
import {
  GroupsDocument,
  GroupsQuery,
  GroupsQueryVariables,
} from '../../graphql/groups/queries/gen/Groups.gen';
import { isEntityTooLarge } from '../../utils/error.utils';
import { getGroupPath } from '../../utils/group.utils';
import { validateImageInput } from '../../utils/image.utils';
import { getRandomString } from '../../utils/shared.utils';
import AttachedImagePreview from '../Images/AttachedImagePreview';
import ImageInput from '../Images/ImageInput';
import Flex from '../Shared/Flex';
import PrimaryActionButton from '../Shared/PrimaryActionButton';
import { TextField } from '../Shared/TextField';

const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': {
    paddingBottom: 12,
  },
}));

interface Props extends CardProps {
  editGroup?: GroupFormFragment;
  inModal?: boolean;
}

const GroupForm = ({ editGroup, inModal, ...cardProps }: Props) => {
  const [imageInputKey, setImageInputKey] = useState('');
  const [coverPhoto, setCoverPhoto] = useState<File>();
  const [createGroup] = useCreateGroupMutation();
  const [updateGroup] = useUpdateGroupMutation();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const initialValues = {
    name: editGroup ? editGroup.name : '',
    description: editGroup ? editGroup.description : '',
  };

  const handleCreate = async (formValues: CreateGroupInput) =>
    await createGroup({
      variables: {
        groupData: {
          ...formValues,
          coverPhoto,
        },
      },
      async update(cache, { data }) {
        if (!data) {
          return;
        }
        const { createGroup } = data;
        for (const joinedGroupsArg of [true, false]) {
          cache.updateQuery<GroupsQuery, GroupsQueryVariables>(
            {
              query: GroupsDocument,
              variables: {
                input: { limit: 10, offset: 0, joinedGroups: joinedGroupsArg },
              },
            },
            (groupsData) =>
              produce(groupsData, (draft) => {
                if (!draft) {
                  return;
                }
                draft.groups.unshift({
                  ...createGroup.group,
                  isJoinedByMe: true,
                  memberCount: 1,
                  memberRequestCount: 0,
                });
                if (joinedGroupsArg) {
                  draft.joinedGroupsCount = draft.joinedGroupsCount + 1;
                } else {
                  draft.groupsCount = draft.groupsCount + 1;
                }
              }),
          );
        }
      },
      onCompleted({ createGroup: { group } }) {
        const groupPagePath = getGroupPath(group.name);
        navigate(groupPagePath);
      },
      onError(err) {
        const title = isEntityTooLarge(err)
          ? t('errors.imageTooLarge')
          : err.message;
        toastVar({
          status: 'error',
          title,
        });
      },
    });

  const handleUpdate = async (
    formValues: Omit<UpdateGroupInput, 'id'>,
    editGroup: GroupFormFragment,
  ) =>
    await updateGroup({
      variables: {
        groupData: {
          id: editGroup.id,
          ...formValues,
          coverPhoto,
        },
      },
      onCompleted({ updateGroup: { group } }) {
        const groupPagePath = getGroupPath(group.name);
        navigate(groupPagePath);
      },
      onError(err) {
        const title = isEntityTooLarge(err)
          ? t('errors.imageTooLarge')
          : err.message;
        toastVar({
          status: 'error',
          title,
        });
      },
    });

  const handleSubmit = async ({
    name,
    description,
    ...formValues
  }: CreateGroupInput | UpdateGroupInput) => {
    const values = {
      description: description?.trim(),
      name: name?.trim(),
      ...formValues,
    };
    try {
      if (coverPhoto) {
        validateImageInput(coverPhoto);
      }
      if (editGroup) {
        await handleUpdate(values, editGroup);
        return;
      }
      await handleCreate(values as CreateGroupInput);
    } catch (err) {
      toastVar({
        status: 'error',
        title: err.message,
      });
    }
  };

  const validate = ({
    name,
    description,
  }: CreateGroupInput | UpdateGroupInput) => {
    const errors: FormikErrors<CreateGroupInput | UpdateGroupInput> = {};

    if (name && !VALID_NAME_REGEX.test(name)) {
      errors.name = t('groups.errors.invalidName');
    }
    if (name && name.length < 5) {
      errors.name = t('groups.errors.shortName');
    }
    if (name && name.length > 25) {
      errors.name = t('groups.errors.longName');
    }
    if (description && description.length > 1000) {
      errors.description = t('groups.errors.longDescription');
    }
    return errors;
  };

  const handleRemoveSelectedImage = () => {
    setCoverPhoto(undefined);
    setImageInputKey(getRandomString());
  };

  const renderForm = () => (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validate={validate}
    >
      {({ isSubmitting, dirty }) => (
        <Form>
          <FormGroup>
            <TextField
              autoComplete="off"
              label={t('groups.form.name')}
              name={FieldNames.Name}
            />
            <TextField
              autoComplete="off"
              label={t('groups.form.description')}
              name={FieldNames.Description}
              multiline
            />
            {coverPhoto && (
              <AttachedImagePreview
                handleRemove={handleRemoveSelectedImage}
                selectedImages={[coverPhoto]}
              />
            )}
          </FormGroup>

          <Flex sx={{ justifyContent: 'space-between' }}>
            <ImageInput refreshKey={imageInputKey} setImage={setCoverPhoto} />
            <PrimaryActionButton
              disabled={isSubmitting || (!dirty && !coverPhoto)}
              isLoading={isSubmitting}
              sx={{ marginTop: 1.5 }}
              type="submit"
            >
              {editGroup ? t('actions.save') : t('actions.create')}
            </PrimaryActionButton>
          </Flex>
        </Form>
      )}
    </Formik>
  );

  if (inModal) {
    return renderForm();
  }

  return (
    <Card {...cardProps}>
      <CardContent>{renderForm()}</CardContent>
    </Card>
  );
};

export default GroupForm;
