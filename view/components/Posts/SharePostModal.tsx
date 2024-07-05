import { Box, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useIsPostShareableQuery } from '../../graphql/posts/queries/gen/IsPostShareable.gen';
import { useIsProposalShareableQuery } from '../../graphql/proposals/queries/gen/IsProposalShareable.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { getGroupPath } from '../../utils/group.utils';
import JoinGroupButton from '../Groups/JoinGroupButton';
import CoverPhoto from '../Images/CoverPhoto';
import Link from '../Shared/Link';
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
    skip: !sharedPostId || !isOpen,
  });

  const {
    data: proposalData,
    loading: proposalLoading,
    error: proposalError,
  } = useIsProposalShareableQuery({
    variables: { proposalId: sharedProposalId! },
    skip: !sharedProposalId || !isOpen,
  });

  const { t } = useTranslation();
  const theme = useTheme();
  const isDesktop = useIsDesktop();

  const group = postData?.post.group || proposalData?.proposal.group;
  const groupPath = getGroupPath(group?.name || '');
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
          <Typography>
            {t(
              sharedPostId
                ? 'posts.prompts.joinToShare'
                : 'proposals.prompts.joinToShare',
              { groupName: group?.name },
            )}
          </Typography>

          <Box
            border={`1px solid ${theme.palette.divider}`}
            borderRadius="8px"
            marginBottom={isDesktop ? 2.5 : 0}
            marginTop={isDesktop ? 3.5 : 0}
            marginX={isDesktop ? 3 : 0}
          >
            <Link href={groupPath}>
              <CoverPhoto
                imageId={group.coverPhoto?.id}
                sx={{ height: isDesktop ? 120 : 110 }}
                topRounded
              />
            </Link>

            <Box padding={2} paddingTop={1.2}>
              <Link href={groupPath}>
                <Typography fontFamily="Inter Medium" fontSize={22}>
                  {group.name}
                </Typography>

                {group.description && (
                  <Typography>{group.description}</Typography>
                )}
              </Link>

              <JoinGroupButton
                groupId={group.id}
                currentUserId={currentUserId}
                isGroupMember={group.isJoinedByMe}
                sx={{ marginTop: 1, borderRadius: '8px' }}
                fullWidth
                isPrimary
              />
            </Box>
          </Box>
        </>
      )}
    </Modal>
  );
};

export default SharePostModal;
