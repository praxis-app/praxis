import { Box, useTheme } from '@mui/material';
import { truncate } from 'lodash';
import { useTranslation } from 'react-i18next';
import {
  NavigationPaths,
  TruncationSizes,
} from '../../constants/shared.constants';
import { SharedPostFragment } from '../../graphql/posts/fragments/gen/SharedPost.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { timeAgo } from '../../utils/time.utils';
import { getUserProfilePath } from '../../utils/user.utils';
import AttachedImageList from '../Images/AttachedImageList';
import Flex from '../Shared/Flex';
import FormattedText from '../Shared/FormattedText';
import Link from '../Shared/Link';
import UserAvatar from '../Users/UserAvatar';

interface Props {
  post: SharedPostFragment;
}

const SharedPost = ({ post: { id, body, images, user, createdAt } }: Props) => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const theme = useTheme();

  const username = user.displayName || user.name;
  const truncatedUsername = truncate(username, {
    length: isDesktop ? TruncationSizes.Medium : 20,
  });

  const userProfilePath = getUserProfilePath(user.name);
  const postPath = `${NavigationPaths.Posts}/${id}`;
  const formattedDate = timeAgo(createdAt);

  return (
    <Box borderRadius="8px" border={`1px solid ${theme.palette.divider}`}>
      {!!images.length && (
        <Link aria-label={t('images.labels.attachedImages')} href={postPath}>
          <AttachedImageList images={images} topRounded />
        </Link>
      )}

      <Box
        paddingX="12px"
        paddingBottom="8px"
        paddingTop={images.length ? '6px' : '10px'}
      >
        <Flex marginBottom={0.8}>
          <UserAvatar user={user} size={32.5} sx={{ marginRight: 1.3 }} />
          <Flex flexDirection="column">
            <Link
              href={userProfilePath}
              sx={{ fontFamily: 'Inter Medium', fontSize: 14, lineHeight: 1.2 }}
            >
              {truncatedUsername}
            </Link>
            <Link
              href={postPath}
              sx={{ color: 'text.secondary', lineHeight: 1.2, fontSize: 13 }}
            >
              {formattedDate}
            </Link>
          </Flex>
        </Flex>
        <FormattedText text={body} />
      </Box>
    </Box>
  );
};

export default SharedPost;
