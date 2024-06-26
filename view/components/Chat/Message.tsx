import { Box, Typography } from '@mui/material';
import { MessageFragment } from '../../graphql/chat/fragments/gen/Message.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { timeAgo } from '../../utils/time.utils';
import { getUserProfilePath } from '../../utils/user.utils';
import AttachedImageList from '../Images/AttachedImageList';
import Flex from '../Shared/Flex';
import FormattedText from '../Shared/FormattedText';
import Link from '../Shared/Link';
import UserAvatar from '../Users/UserAvatar';

interface Props {
  message: MessageFragment;
  onImageLoad(): void;
}

const Message = ({
  message: { user, body, images, createdAt },
  onImageLoad,
}: Props) => {
  const userName = user.displayName || user.name;
  const userPath = getUserProfilePath(user.name);
  const formattedDate = timeAgo(createdAt);

  const isDesktop = useIsDesktop();

  return (
    <Flex gap={2} paddingBottom={2}>
      <UserAvatar user={user} sx={{ marginTop: 0.5 }} withLink />

      <Box>
        <Flex gap={1}>
          <Link href={userPath}>
            <Typography fontFamily="Inter Bold">{userName}</Typography>
          </Link>
          <Typography
            color="text.secondary"
            sx={{ cursor: 'default' }}
            title={formattedDate}
          >
            {formattedDate}
          </Typography>
        </Flex>

        <FormattedText text={body} lineHeight={1.2} paddingBottom={0.4} />

        {!!images.length && (
          <AttachedImageList
            images={images}
            onImageLoad={onImageLoad}
            imageSx={{ borderRadius: 2 }}
            width={isDesktop ? 350 : '100%'}
            paddingTop={0.7}
          />
        )}
      </Box>
    </Flex>
  );
};

export default Message;
