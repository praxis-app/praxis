import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toastVar } from '../../../apollo/cache';
import { useDeleteGroupRoleMutation } from '../../../apollo/groups/generated/DeleteGroupRole.mutation';
import { DeleteGroupRoleButtonFragment } from '../../../apollo/groups/generated/DeleteGroupRoleButton.fragment';
import { NavigationPaths } from '../../../constants/shared.constants';
import DeleteButton from '../../Shared/DeleteButton';

interface Props {
  role: DeleteGroupRoleButtonFragment;
}

const DeleteGroupRoleButton = ({ role: { id, group, __typename } }: Props) => {
  const [deleteRole] = useDeleteGroupRoleMutation();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClick = async () => {
    const groupRolesPath = `${NavigationPaths.Groups}/${group?.name}/roles`;
    navigate(groupRolesPath);

    await deleteRole({
      variables: { id },
      update(cache) {
        const cacheId = cache.identify({ id, __typename });
        cache.evict({ id: cacheId });
        cache.gc();
      },
      onError() {
        toastVar({
          status: 'error',
          title: t('errors.somethingWentWrong'),
        });
      },
    });
  };

  const handleClickWithConfirm = () =>
    window.confirm(t('prompts.deleteItem', { itemType: 'role' })) &&
    handleClick();

  return (
    <DeleteButton onClick={handleClickWithConfirm}>
      {t('roles.actions.delete')}
    </DeleteButton>
  );
};

export default DeleteGroupRoleButton;
