import { Box, SxProps } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ProposalCardFragment } from '../../apollo/proposals/generated/ProposalCard.fragment';
import { useIsDesktop } from '../../hooks/shared.hooks';
import CommentForm from '../Comments/CommentForm';
import Modal from '../Shared/Modal';
import ProposalCard from './ProposalCard';

interface Props {
  proposal: ProposalCardFragment;
  open: boolean;
  onClose(): void;
}

const ProposalModal = ({ proposal, open, onClose }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    ref.current?.scrollIntoView();
  }, [proposal.commentCount]);

  const title = t('proposals.labels.usersProposal', {
    name: proposal.user.name[0].toUpperCase() + proposal.user.name.slice(1),
  });

  const contentStyles: SxProps = {
    width: isDesktop ? '700px' : '100%',
    paddingBottom: 0,
    minHeight: '50vh',
  };

  const renderCommentForm = () => {
    if (proposal.group && !proposal.group.isJoinedByMe) {
      return null;
    }
    return (
      <Box
        bgcolor="background.paper"
        bottom={0}
        left={0}
        paddingTop="12px"
        paddingX="16px"
        width="100%"
      >
        <CommentForm proposalId={proposal.id} expanded />
      </Box>
    );
  };

  return (
    <Modal
      contentStyles={contentStyles}
      footerContent={renderCommentForm()}
      maxWidth="md"
      onClose={onClose}
      open={open}
      title={title}
      centeredTitle
    >
      <ProposalCard proposal={proposal} inModal />
      <Box ref={ref} />
    </Modal>
  );
};

export default ProposalModal;
