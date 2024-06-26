import { BrokenImage } from '@mui/icons-material';
import { Box, BoxProps, Typography, useTheme } from '@mui/material';
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

interface Props extends BoxProps {
  post?: SharedPostFragment | null;
}

const SharedPost = ({ post, ...boxProps }: Props) => {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const theme = useTheme();

  const user = post?.user;
  const username = user?.displayName || user?.name;
  const truncatedUsername = truncate(username, {
    length: isDesktop ? TruncationSizes.Medium : 20,
  });

  const userProfilePath = getUserProfilePath(user?.name);
  const postPath = `${NavigationPaths.Posts}/${post?.id}`;
  const formattedDate = timeAgo(post?.createdAt);

  return (
    <Box
      borderRadius="8px"
      border={`1px solid ${theme.palette.divider}`}
      {...boxProps}
    >
      {!!post?.images.length && (
        <Link aria-label={t('images.labels.attachedImages')} href={postPath}>
          <AttachedImageList images={post.images} topRounded />
        </Link>
      )}

      <Box
        paddingX="12px"
        paddingBottom="8px"
        paddingTop={post?.images.length ? '6px' : '10px'}
      >
        {post && (
          <Flex marginBottom={0.8}>
            <UserAvatar user={user} size={32.5} sx={{ marginRight: 1.3 }} />

            <Flex flexDirection="column">
              <Link
                href={userProfilePath}
                sx={{
                  fontFamily: 'Inter Medium',
                  fontSize: 14,
                  lineHeight: 1.2,
                }}
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
        )}

        {post?.body && (
          <Link href={postPath}>
            <FormattedText text={post.body} />
          </Link>
        )}

        {!post && (
          <Flex gap={1.2}>
            <BrokenImage sx={{ fontSize: isDesktop ? '32px' : '30px' }} />
            <Box>
              <Typography
                fontSize={isDesktop ? '17px' : '16px'}
                fontFamily="Inter Medium"
                marginBottom={isDesktop ? 0.2 : 0.1}
              >
                {t('posts.noContent.header')}
              </Typography>
              <Typography color="text.secondary">
                {t('posts.noContent.message')}
              </Typography>
            </Box>
          </Flex>
        )}
      </Box>
    </Box>
  );
};

export default SharedPost;
