import { AddCircle, ArrowForwardIos } from '@mui/icons-material';
import {
  Card,
  CardActionArea,
  CardContent as MuiCardContent,
  Typography,
  styled,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { AddGroupRoleMemberTabFragment } from '../../apollo/groups/generated/AddGroupRoleMemberTab.fragment';
import { useUpdateGroupRoleMutation } from '../../apollo/groups/generated/UpdateGroupRole.mutation';
import { AddServerRoleMemberTabFragment } from '../../apollo/roles/generated/AddServerRoleMemberTab.fragment';
import { useUpdateServerRoleMutation } from '../../apollo/roles/generated/UpdateServerRole.mutation';
import { UserAvatarFragment } from '../../apollo/users/generated/UserAvatar.fragment';
import { NavigationPaths } from '../../constants/shared.constants';
import Flex from '../Shared/Flex';
import Modal from '../Shared/Modal';
import AddRoleMemberOption from './AddRoleMemberOption';
import RoleMember from './RoleMember';

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

  const [updateGroupRole] = useUpdateGroupRoleMutation();
  const [updateServerRole] = useUpdateServerRoleMutation();

  const { pathname } = useLocation();
  const { t } = useTranslation();

  const addCircleStyles = {
    fontSize: 23,
    marginRight: 1.25,
  };

  const handleAddMembersCardClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const onCompleted = () => {
    handleCloseModal();
    setSelectedUserIds([]);
  };

  const handleSubmit = async () => {
    const isGroupRole = pathname.includes(NavigationPaths.Groups);
    const roleData = { id, selectedUserIds };

    if (isGroupRole) {
      await updateGroupRole({
        variables: { groupRoleData: roleData },
        onCompleted,
      });
      return;
    }
    await updateServerRole({
      variables: { serverRoleData: roleData },
      onCompleted,
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
