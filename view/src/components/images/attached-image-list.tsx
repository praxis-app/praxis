import { Box } from '@/components/ui/box';
import { cn } from '@/lib/shared.utils';
import { type ImageRes } from '@/types/image.types';
import { AttachedImage } from './attached-image';

interface Props {
  images: ImageRes[];
  serverId?: string;
  channelId?: string;
  messageId?: string;
  pollId?: string;
  className?: string;
  fillCard?: boolean;
  imageClassName?: string;
  onImageLoad?(): void;
  topRounded?: boolean;
}

export const AttachedImageList = ({
  images,
  serverId,
  channelId,
  messageId,
  pollId,
  className,
  fillCard,
  imageClassName,
  onImageLoad,
  topRounded,
}: Props) => (
  <Box className={cn(fillCard ? '-mx-8' : '', className)}>
    {images.map((image, index) => {
      const isLastImage = index + 1 === images.length;
      const isFirstImage = index === 0;

      const imageClasses = cn(
        !isLastImage && 'mb-1.5',
        topRounded && isFirstImage && 'rounded-t-lg',
        imageClassName,
      );

      return (
        <AttachedImage
          key={image.id}
          image={image}
          serverId={serverId}
          channelId={channelId}
          messageId={messageId}
          pollId={pollId}
          onImageLoad={onImageLoad}
          className={imageClasses}
        />
      );
    })}
  </Box>
);
