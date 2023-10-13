import { produce } from 'immer';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toastVar } from '../../../graphql/cache';
import { useDeleteServerRoleMutation } from '../../../graphql/roles/mutations/gen/DeleteServerRole.gen';
import {
  ServerRolesDocument,
  ServerRolesQuery,
} from '../../../graphql/roles/queries/gen/ServerRoles.gen';
import {
  NavigationPaths,
  TypeNames,
} from '../../../constants/shared.constants';
import DeleteButton from '../../Shared/DeleteButton';

interface Props {
  roleId: number;
}

const DeleteServerRoleButton = ({ roleId }: Props) => {
  const [deleteRole] = useDeleteServerRoleMutation();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClick = async () => {
    navigate(NavigationPaths.Roles);
    await deleteRole({
      variables: { id: roleId },
      update(cache) {
        cache.updateQuery<ServerRolesQuery>(
          { query: ServerRolesDocument },
          (rolesData) =>
            produce(rolesData, (draft) => {
              if (!draft) {
                return;
              }
              const index = draft.serverRoles.findIndex(
                (role) => role.id === roleId,
              );
              draft.serverRoles.splice(index, 1);
            }),
        );
        const cacheId = cache.identify({
          id: roleId,
          __typename: TypeNames.ServerRole,
        });
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

export default DeleteServerRoleButton;
