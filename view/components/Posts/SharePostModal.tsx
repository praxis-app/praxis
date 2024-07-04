import { Box, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useIsPostShareableQuery } from '../../graphql/posts/queries/gen/IsPostShareable.gen';
import { useIsProposalShareableQuery } from '../../graphql/proposals/queries/gen/IsProposalShareable.gen';
import GroupAvatar from '../Groups/GroupAvatar';
import JoinGroupButton from '../Groups/JoinGroupButton';
import Flex from '../Shared/Flex';
import Modal from '../Shared/Modal';
import ProgressBar from '../Shared/ProgressBar';
import PostForm from './PostForm';

interface Props {
  isOpen: boolean;
  onClose(): void;
  sharedFromUserId: number;
  sharedPostId?: number;
  sharedProposalId?: number;
  currentUserId: number;
}

const SharePostModal = ({
  isOpen,
  onClose,
  sharedFromUserId,
  sharedPostId,
  sharedProposalId,
  currentUserId,
}: Props) => {
  const {
    data: postData,
    loading: postLoading,
    error: postError,
  } = useIsPostShareableQuery({
    variables: { postId: sharedPostId! },
    skip: !sharedPostId,
  });

  const {
    data: proposalData,
    loading: proposalLoading,
    error: proposalError,
  } = useIsProposalShareableQuery({
    variables: { proposalId: sharedProposalId! },
    skip: !sharedProposalId,
  });

  const { t } = useTranslation();
  const theme = useTheme();

  const group = postData?.post.group || proposalData?.proposal.group;
  const canShareContent = group?.isJoinedByMe;

  const isLoading = postLoading || proposalLoading;
  const isError = postError || proposalError;

  return (
    <Modal
      contentStyles={{ paddingTop: 3, minHeight: 'fit-content' }}
      title={t('actions.share')}
      maxWidth="md"
      onClose={onClose}
      open={isOpen}
      centeredTitle
    >
      {isError && <Typography>{t('errors.somethingWentWrong')}</Typography>}
      {isLoading && <ProgressBar />}

      {canShareContent && (
        <PostForm
          onSubmit={onClose}
          sharedFromUserId={sharedFromUserId}
          sharedPostId={sharedProposalId ? undefined : sharedPostId}
          sharedProposalId={sharedProposalId}
        />
      )}

      {group && !canShareContent && (
        <>
          <Typography marginBottom={2}>
            {t('posts.prompts.joinToShare', { groupName: group?.name })}
          </Typography>

          <Box
            border={`1px solid ${theme.palette.divider}`}
            borderRadius="8px"
            padding={2}
          >
            <Flex alignItems="center" gap={2.5} paddingBottom={2}>
              <GroupAvatar
                group={group}
                imageStyles={{
                  borderRadius: '8px',
                }}
                sx={{
                  borderRadius: '8px',
                  width: '80px',
                  height: '80px',
                }}
              />
              <Box>
                <Typography variant="h5">{group.name}</Typography>

                {group.description && (
                  <Typography>{group.description}</Typography>
                )}
              </Box>
            </Flex>

            <JoinGroupButton
              groupId={group.id}
              currentUserId={currentUserId}
              isGroupMember={group.isJoinedByMe}
              fullWidth
              isPrimary
            />
          </Box>
        </>
      )}
    </Modal>
  );
};

export default SharePostModal;
