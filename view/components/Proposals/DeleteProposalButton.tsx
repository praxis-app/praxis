import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { NavigationPaths } from '../../constants/shared.constants';
import { toastVar } from '../../graphql/cache';
import { useDeleteProposalMutation } from '../../graphql/proposals/mutations/gen/DeleteProposal.gen';
import { removeProposal } from '../../utils/proposal.utils';

interface Props {
  proposalId: number;
}

const DeleteProposalButton = ({ proposalId }: Props) => {
  const [deleteProposal] = useDeleteProposalMutation();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleClick = async () => {
    navigate(NavigationPaths.Home);
    await deleteProposal({
      variables: { id: proposalId },
      update: removeProposal(proposalId),
      onError(err) {
        toastVar({
          status: 'error',
          title: err.message,
        });
      },
    });
  };

  const handleClickWithConfirm = () =>
    window.confirm(t('prompts.deleteItem', { itemType: 'proposal' })) &&
    handleClick();

  return (
    <Button
      color="error"
      onClick={handleClickWithConfirm}
      sx={{ marginTop: 1.5 }}
      variant="outlined"
      fullWidth
    >
      {t('actions.delete')}
    </Button>
  );
};

export default DeleteProposalButton;
