import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useProposalSharesModalQuery } from '../../graphql/proposals/queries/gen/ProposalSharesModal.gen';
import PostShareCompact from '../Posts/PostShareCompact';
import Modal from '../Shared/Modal';
import ProgressBar from '../Shared/ProgressBar';

interface Props {
  proposalId: number;
  isOpen: boolean;
  onClose(): void;
  isVerified: boolean;
}

const ProposalSharesModal = ({
  proposalId,
  isOpen,
  onClose,
  isVerified,
}: Props) => {
  const { data, loading, error } = useProposalSharesModalQuery({
    variables: { proposalId, isVerified },
    skip: !isOpen,
  });

  const { t } = useTranslation();

  const me = data?.me;
  const serverPermissions = me?.serverPermissions;
  const canManagePosts = serverPermissions?.managePosts;
  const shares = data?.proposal.shares;

  return (
    <Modal
      title={t('posts.headers.peopleWhoShared')}
      contentStyles={{ minHeight: 'fit-content' }}
      maxWidth="md"
      onClose={onClose}
      open={isOpen}
      centeredTitle
    >
      {error && <Typography>{t('errors.somethingWentWrong')}</Typography>}
      {loading && <ProgressBar />}

      {shares?.map((share, index) => (
        <PostShareCompact
          key={share.id}
          post={share}
          currentUserId={me?.id}
          canManagePosts={canManagePosts}
          isVerified={isVerified}
          isLast={index === shares.length - 1}
        />
      ))}
    </Modal>
  );
};

export default ProposalSharesModal;
