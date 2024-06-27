import { Box, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NavigationPaths } from '../../constants/shared.constants';
import { SharedPostFragment } from '../../graphql/posts/fragments/gen/SharedPost.gen';
import AttachedImageList from '../Images/AttachedImageList';
import FormattedText from '../Shared/FormattedText';
import Link from '../Shared/Link';

interface Props {
  post: SharedPostFragment;
}

const SharedPost = ({ post: { id, body, images } }: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Box borderRadius="8px" border={`1px solid ${theme.palette.divider}`}>
      {!!images.length && (
        <Link
          aria-label={t('images.labels.attachedImages')}
          href={`${NavigationPaths.Posts}/${id}`}
        >
          <AttachedImageList images={images} topRounded />
        </Link>
      )}

      <Box
        paddingX="12px"
        paddingBottom="8px"
        paddingTop={images.length ? '2px' : '7px'}
      >
        <FormattedText text={body} />
      </Box>
    </Box>
  );
};

export default SharedPost;
