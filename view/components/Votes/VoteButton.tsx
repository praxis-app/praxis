import { HowToVote } from '@mui/icons-material';
import { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Blurple } from '../../styles/theme';
import CardFooterButton from '../Shared/CardFooterButton';
import VoteMenu from './VoteMenu';

interface Props {
  decisionMakingModel: string;
  isClosed?: boolean;
  isRatified: boolean;
  myVoteId?: number;
  myVoteType?: string;
  onClick(e: MouseEvent<HTMLButtonElement>): void;
  proposalId?: number;
  questionnaireTicketId?: number;
  menuAnchorEl: HTMLElement | null;
  setMenuAnchorEl: (el: HTMLElement | null) => void;
}

const VoteButton = ({
  decisionMakingModel,
  isClosed,
  isRatified,
  myVoteId,
  myVoteType,
  proposalId,
  questionnaireTicketId,
  menuAnchorEl,
  setMenuAnchorEl,
  onClick,
}: Props) => {
  const { t } = useTranslation();

  const getVoteButtonLabel = () => {
    if (isRatified) {
      return t('proposals.labels.ratified');
    }
    if (isClosed) {
      return t('proposals.labels.closed');
    }
    return t('proposals.actions.vote');
  };

  return (
    <>
      <CardFooterButton
        onClick={onClick}
        sx={myVoteId ? { color: Blurple.SavoryBlue } : {}}
      >
        <HowToVote sx={{ marginRight: '0.4ch' }} />
        {getVoteButtonLabel()}
      </CardFooterButton>

      <VoteMenu
        anchorEl={menuAnchorEl}
        decisionMakingModel={decisionMakingModel}
        myVoteId={myVoteId}
        myVoteType={myVoteType}
        onClose={() => setMenuAnchorEl(null)}
        proposalId={proposalId}
        questionnaireTicketId={questionnaireTicketId}
      />
    </>
  );
};

export default VoteButton;
