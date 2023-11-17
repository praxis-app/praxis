import {
  Card,
  CardProps,
  FormGroup,
  CardContent as MuiCardContent,
  styled,
} from '@mui/material';
import { Form, Formik } from 'formik';
import { produce } from 'immer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { FieldNames } from '../../constants/shared.constants';
import { toastVar } from '../../graphql/cache';
import { CreateGroupInput, UpdateGroupInput } from '../../graphql/gen';
import { GroupFormFragment } from '../../graphql/groups/fragments/gen/GroupForm.gen';
import { useCreateGroupMutation } from '../../graphql/groups/mutations/gen/CreateGroup.gen';
import { useUpdateGroupMutation } from '../../graphql/groups/mutations/gen/UpdateGroup.gen';
import {
  GroupsDocument,
  GroupsQuery,
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
}

const GroupForm = ({ editGroup, ...cardProps }: Props) => {
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
        cache.updateQuery<GroupsQuery>(
          { query: GroupsDocument },
          (groupsData) =>
            produce(groupsData, (draft) => {
              draft?.groups.unshift({
                ...createGroup.group,
                isJoinedByMe: true,
                memberCount: 1,
                memberRequestCount: 0,
              });
            }),
        );
      },
      onCompleted({ createGroup: { group } }) {
        const groupPagePath = getGroupPath(group.name);
        navigate(groupPagePath);
      },
      onError() {
        throw new Error(t('groups.errors.couldNotCreate'));
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
      onError() {
        throw new Error(t('groups.errors.couldNotUpdate'));
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
      const title = isEntityTooLarge(err)
        ? t('errors.imageTooLarge')
        : String(err);
      toastVar({
        status: 'error',
        title,
      });
    }
  };

  const handleRemoveSelectedImage = () => {
    setCoverPhoto(undefined);
    setImageInputKey(getRandomString());
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
                <ImageInput
                  refreshKey={imageInputKey}
                  setImage={setCoverPhoto}
                />
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
      </CardContent>
    </Card>
  );
};

export default GroupForm;
