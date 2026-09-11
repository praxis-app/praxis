import { cn } from '@/lib/shared.utils';
import chroma from 'chroma-js';
import ColorHash from 'color-hash';
import { LazyLoadImage } from '../images/lazy-load-image';
import { Avatar, AvatarBadge, AvatarFallback } from '../ui/avatar';

interface Props {
  name: string;
  userId?: string;
  className?: string;
  fallbackClassName?: string;
  imageSrc?: string;
  imageId?: string;
  isOnline?: boolean;
  showOnlineStatus?: boolean;
  animateOnlineStatus?: boolean;
  skipLoadAnimation?: boolean;
}

export const UserAvatar = ({
  name,
  userId,
  className,
  imageSrc,
  fallbackClassName,
  imageId,
  isOnline,
  showOnlineStatus = false,
  animateOnlineStatus = false,
  skipLoadAnimation = false,
}: Props) => {
  const getStringAvatarProps = () => {
    const colorHash = new ColorHash();
    const baseColor = colorHash.hex(userId || name);
    const color = chroma(baseColor).brighten(1.5).hex();
    const backgroundColor = chroma(baseColor).darken(1.35).hex();

    return {
      style: { color, backgroundColor },
    };
  };

  return (
    <Avatar className={className} title={name}>
      <LazyLoadImage
        alt={name}
        imageId={imageId}
        src={imageSrc}
        userId={userId}
        skipAnimation={skipLoadAnimation}
        className={cn(
          (imageId || imageSrc) && 'min-h-full min-w-full rounded-full',
        )}
      />

      {!imageSrc && !imageId && (
        <AvatarFallback
          className={cn(
            'min-h-full min-w-full rounded-full text-lg font-light',
            fallbackClassName,
          )}
          {...getStringAvatarProps()}
        >
          {name[0].toUpperCase()}
        </AvatarFallback>
      )}

      {showOnlineStatus && isOnline && (
        <AvatarBadge
          position="bottomRight"
          className="border-card h-3.75 w-3.75 border-[2.5px]"
        >
          <span className="relative">
            {animateOnlineStatus && (
              <span className="bg-positive absolute h-full w-full animate-ping rounded-full opacity-75"></span>
            )}
            <span className="bg-positive absolute h-full w-full rounded-full"></span>
          </span>
        </AvatarBadge>
      )}
    </Avatar>
  );
};
