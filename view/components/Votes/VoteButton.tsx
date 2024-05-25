import { Reference } from '@apollo/client';
import {
  HowToVote,
  PanTool,
  ThumbDown,
  ThumbUp,
  ThumbsUpDown,
} from '@mui/icons-material';
import { Menu, MenuItem } from '@mui/material';
import { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DecisionMakingModel,
  ProposalActionType,
  ProposalStage,
} from '../../constants/proposal.constants';
import { NavigationPaths, TypeNames } from '../../constants/shared.constants';
import { VoteTypes } from '../../constants/vote.constants';
import { toastVar } from '../../graphql/cache';
import { useRolesByGroupIdLazyQuery } from '../../graphql/roles/queries/gen/RolesByGroupId.gen';
import {
  CreateVoteMutation,
  useCreateVoteMutation,
} from '../../graphql/votes/mutations/gen/CreateVote.gen';
import { useDeleteVoteMutation } from '../../graphql/votes/mutations/gen/DeleteVote.gen';
import {
  UpdateVoteMutation,
  useUpdateVoteMutation,
} from '../../graphql/votes/mutations/gen/UpdateVote.gen';
import { Blurple } from '../../styles/theme';
import { getGroupPath } from '../../utils/group.utils';
import CardFooterButton from '../Shared/CardFooterButton';

const ICON_STYLES = {
  fontSize: 20,
  marginRight: 1,
};

interface Props {
  decisionMakingModel: string;
  isClosed?: boolean;
  isRatified: boolean;
  menuAnchorEl: HTMLElement | null;
  myVoteId?: number;
  myVoteType?: string;
  onClick(e: MouseEvent<HTMLButtonElement>): void;
  proposalId?: number;
  questionnaireTicketId?: number;
  setMenuAnchorEl: (el: HTMLElement | null) => void;
}

const VoteButton = ({
  decisionMakingModel,
  isClosed,
  isRatified,
  menuAnchorEl,
  myVoteId,
  myVoteType,
  onClick,
  proposalId,
  questionnaireTicketId,
  setMenuAnchorEl,
}: Props) => {
  const [createVote, { loading: createVoteLoading }] = useCreateVoteMutation();
  const [updateVote, { loading: updateVoteLoading }] = useUpdateVoteMutation();
  const [deleteVote, { loading: deleteVoteLoading }] = useDeleteVoteMutation();

  const [getGroupRoles, { loading: groupRolesLoading }] =
    useRolesByGroupIdLazyQuery();

  const { pathname } = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isMajorityVote =
    decisionMakingModel === DecisionMakingModel.MajorityVote;

  const cacheReference = {
    __typename: proposalId ? TypeNames.Proposal : TypeNames.QuestionnaireTicket,
    id: proposalId || questionnaireTicketId,
  };

  const isDisabled =
    createVoteLoading ||
    updateVoteLoading ||
    deleteVoteLoading ||
    groupRolesLoading;

  const getVoteButtonLabel = () => {
    if (isRatified) {
      return t('proposals.labels.ratified');
    }
    if (isClosed) {
      return t('proposals.labels.closed');
    }
    return t('proposals.actions.vote');
  };

  const getMenuItemStyles = (voteType: string) => {
    if (!myVoteType || myVoteType !== voteType) {
      return;
    }
    return { color: Blurple.Marina };
  };

  const handleCompleted = async (
    data: CreateVoteMutation | UpdateVoteMutation,
  ) => {
    const {
      vote: { proposal },
    } = 'createVote' in data ? data.createVote : data.updateVote;
    if (!proposal) {
      return;
    }
    const {
      action: { actionType },
      group,
      stage,
    } = proposal;

    const isRatified = stage === ProposalStage.Ratified;

    if (isRatified) {
      const isRoleProposal =
        actionType === ProposalActionType.CreateRole ||
        actionType === ProposalActionType.ChangeRole;

      // Load group roles if a role was added or changed
      if (isRoleProposal && group) {
        await getGroupRoles({ variables: { id: group.id } });
      }

      toastVar({
        status: 'info',
        title: t('proposals.toasts.ratifiedSuccess'),
      });
    }

    if (
      pathname.includes(NavigationPaths.Groups) &&
      actionType === ProposalActionType.ChangeName &&
      isRatified &&
      group
    ) {
      const groupPath = getGroupPath(group.name);
      navigate(groupPath);
    }
  };

  const handleCreate = async (voteType: string) =>
    await createVote({
      variables: {
        voteData: {
          questionnaireTicketId,
          proposalId,
          voteType,
        },
      },
      update(cache, { data }) {
        if (!data) {
          return;
        }
        const {
          createVote: { vote },
        } = data;

        cache.modify({
          id: cache.identify(cacheReference),
          fields: {
            votes(existingVoteRefs: Reference[], { toReference }) {
              return [toReference(vote), ...existingVoteRefs];
            },
          },
        });
      },
      onCompleted: handleCompleted,
      onError(err) {
        toastVar({
          status: 'error',
          title: err.message,
        });
      },
    });

  const handleUpdate = async (id: number, voteType: string) =>
    await updateVote({
      variables: {
        voteData: { id, voteType },
      },
      onCompleted: handleCompleted,
      onError(err) {
        toastVar({
          status: 'error',
          title: err.message,
        });
      },
    });

  const handleDelete = async (id: number, voteType: string) =>
    await deleteVote({
      variables: { id },
      update(cache) {
        cache.modify({
          id: cache.identify(cacheReference),
          fields: {
            votes(existingVoteRefs: Reference[], { readField }) {
              return existingVoteRefs.filter(
                (ref) => readField('id', ref) !== id,
              );
            },
            voteCount(existingCount: number) {
              return Math.max(0, existingCount - 1);
            },
            agreementVoteCount(existingCount: number) {
              if (!questionnaireTicketId || voteType !== VoteTypes.Agreement) {
                return existingCount;
              }
              return Math.max(0, existingCount - 1);
            },
            myVote: () => null,
          },
        });
      },
      onError(err) {
        toastVar({
          status: 'error',
          title: err.message,
        });
      },
    });

  const handleClickMenuItem = (voteType: string) => async () => {
    if (questionnaireTicketId && voteType === VoteTypes.Block) {
      const confirmed = window.confirm(t('questions.prompts.confirmBlock'));
      if (!confirmed) {
        return;
      }
    }
    setMenuAnchorEl(null);

    if (myVoteId && myVoteType !== voteType) {
      await handleUpdate(myVoteId, voteType);
      return;
    }
    if (myVoteId) {
      await handleDelete(myVoteId, voteType);
      return;
    }
    await handleCreate(voteType);
  };

  return (
    <>
      <CardFooterButton
        onClick={onClick}
        disabled={isDisabled}
        sx={myVoteId ? { color: Blurple.SavoryBlue } : {}}
      >
        <HowToVote sx={{ marginRight: '0.4ch' }} />
        {getVoteButtonLabel()}
      </CardFooterButton>

      <Menu
        anchorEl={menuAnchorEl}
        anchorOrigin={{
          horizontal: 'left',
          vertical: 'bottom',
        }}
        transformOrigin={{
          horizontal: 'left',
          vertical: 'top',
        }}
        onClose={() => setMenuAnchorEl(null)}
        open={!!menuAnchorEl}
        keepMounted
      >
        <MenuItem
          onClick={handleClickMenuItem(VoteTypes.Agreement)}
          sx={getMenuItemStyles(VoteTypes.Agreement)}
        >
          <ThumbUp sx={ICON_STYLES} />
          {t('votes.actions.agree')}
        </MenuItem>

        {isMajorityVote ? (
          <MenuItem
            onClick={handleClickMenuItem(VoteTypes.Disagreement)}
            sx={getMenuItemStyles(VoteTypes.Disagreement)}
          >
            <ThumbDown sx={ICON_STYLES} />
            {t('votes.actions.disagree')}
          </MenuItem>
        ) : (
          [
            <MenuItem
              key={VoteTypes.StandAside}
              onClick={handleClickMenuItem(VoteTypes.StandAside)}
              sx={getMenuItemStyles(VoteTypes.StandAside)}
            >
              <ThumbDown sx={ICON_STYLES} />
              {t('votes.actions.standAside')}
            </MenuItem>,

            <MenuItem
              key={VoteTypes.Reservations}
              onClick={handleClickMenuItem(VoteTypes.Reservations)}
              sx={getMenuItemStyles(VoteTypes.Reservations)}
            >
              <ThumbsUpDown sx={ICON_STYLES} />
              {t('votes.actions.reservations')}
            </MenuItem>,

            <MenuItem
              key={VoteTypes.Block}
              onClick={handleClickMenuItem(VoteTypes.Block)}
              sx={getMenuItemStyles(VoteTypes.Block)}
            >
              <PanTool sx={ICON_STYLES} />
              {t('votes.actions.block')}
            </MenuItem>,
          ]
        )}
      </Menu>
    </>
  );
};

export default VoteButton;
