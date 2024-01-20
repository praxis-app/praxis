import { AddCircle, ArrowForwardIos } from '@mui/icons-material';
import {
  Card,
  CardActionArea,
  CardContent as MuiCardContent,
  SxProps,
  Typography,
  styled,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { NavigationPaths } from '../../constants/shared.constants';
import { AddGroupRoleMemberTabFragment } from '../../graphql/groups/fragments/gen/AddGroupRoleMemberTab.gen';
import { useUpdateGroupRoleMutation } from '../../graphql/groups/mutations/gen/UpdateGroupRole.gen';
import { AddServerRoleMemberTabFragment } from '../../graphql/roles/fragments/gen/AddServerRoleMemberTab.gen';
import { useUpdateServerRoleMutation } from '../../graphql/roles/mutations/gen/UpdateServerRole.gen';
import { UserAvatarFragment } from '../../graphql/users/fragments/gen/UserAvatar.gen';
import Flex from '../Shared/Flex';
import Modal from '../Shared/Modal';
import AddRoleMemberOption from './AddRoleMemberOption';
import RoleMember from './RoleMember';
import { toastVar } from '../../graphql/cache';

const FlexCardContent = styled(MuiCardContent)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  paddingBottom: 12,
  paddingTop: 13,
}));

const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': {
    paddingBottom: 16,
  },
}));

interface Props {
  availableUsersToAdd: UserAvatarFragment[];
  role: AddServerRoleMemberTabFragment | AddGroupRoleMemberTabFragment;
}

const AddRoleMemberTab = ({
  availableUsersToAdd,
  role: { id, members },
}: Props) => {
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [updateGroupRole, { loading: updateGroupRoleLoading }] =
    useUpdateGroupRoleMutation();

  const [updateServerRole, { loading: updateServerRoleLoading }] =
    useUpdateServerRoleMutation();

  const { pathname } = useLocation();
  const { t } = useTranslation();

  const addCircleStyles: SxProps = {
    fontSize: 23,
    marginRight: 1.25,
  };

  const handleAddMembersCardClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const onCompleted = () => {
    handleCloseModal();
    setSelectedUserIds([]);
  };

  const onError = (err: Error) => {
    toastVar({
      status: 'error',
      title: err.message,
    });
  };

  const handleSubmit = async () => {
    const isGroupRole = pathname.includes(NavigationPaths.Groups);
    const roleData = { id, selectedUserIds };

    if (isGroupRole) {
      await updateGroupRole({
        variables: { groupRoleData: roleData },
        onCompleted,
        onError,
      });
      return;
    }
    await updateServerRole({
      variables: { serverRoleData: roleData },
      onCompleted,
      onError,
    });
  };

  return (
    <>
      <Card sx={{ cursor: 'pointer' }} onClick={handleAddMembersCardClick}>
        <CardActionArea>
          <FlexCardContent>
            <Flex>
              <AddCircle color="primary" sx={addCircleStyles} />
              <Typography color="primary">
                {t('roles.actions.addMembers')}
              </Typography>
            </Flex>
            <ArrowForwardIos
              color="primary"
              fontSize="small"
              sx={{ transform: 'translateY(2px)' }}
            />
          </FlexCardContent>
        </CardActionArea>
      </Card>

      <Modal
        title={t('roles.actions.addMembers')}
        actionLabel={t('roles.actions.add')}
        closingAction={handleSubmit}
        isLoading={updateGroupRoleLoading || updateServerRoleLoading}
        onClose={handleCloseModal}
        open={isModalOpen}
      >
        {availableUsersToAdd.map((user) => (
          <AddRoleMemberOption
            key={user.id}
            selectedUserIds={selectedUserIds}
            setSelectedUserIds={setSelectedUserIds}
            user={user}
          />
        ))}
      </Modal>

      {!!members.length && (
        <Card>
          <CardContent>
            {members.map((member) => (
              <RoleMember roleMember={member} roleId={id} key={member.id} />
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default AddRoleMemberTab;
