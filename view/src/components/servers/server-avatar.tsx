import { LazyLoadImage } from '@/components/images/lazy-load-image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/shared.utils';
import { type ServerRes } from '@/types/server.types';
import chroma from 'chroma-js';
import ColorHash from 'color-hash';
import { LuServer } from 'react-icons/lu';

interface Props {
  server: Pick<ServerRes, 'id' | 'name' | 'image'>;
  imageSrc?: string;
  className?: string;
  fallbackClassName?: string;
  fallback?: 'initial' | 'icon';
}

export const ServerAvatar = ({
  server,
  imageSrc,
  className,
  fallbackClassName,
  fallback = 'initial',
}: Props) => {
  const colorHash = new ColorHash();
  const baseColor = colorHash.hex(server.id || server.name);
  const avatarColors = {
    color: chroma(baseColor).brighten(1.5).hex(),
    backgroundColor: chroma(baseColor).darken(1.35).hex(),
  };

  return (
    <Avatar className={className} title={server.name}>
      <LazyLoadImage
        alt={server.name}
        src={imageSrc}
        imageId={server.image?.id}
        serverImageServerId={server.id}
        className={cn(
          (imageSrc || server.image?.id) &&
            'min-h-full min-w-full rounded-full',
        )}
      />
      {!imageSrc && !server.image?.id && (
        <AvatarFallback
          className={cn(
            'min-h-full min-w-full rounded-full',
            fallback === 'initial'
              ? 'text-lg font-light uppercase'
              : 'bg-muted text-muted-foreground',
            fallbackClassName,
          )}
          style={fallback === 'initial' ? avatarColors : undefined}
        >
          {fallback === 'icon' ? (
            <LuServer aria-hidden="true" className="size-[45%]" />
          ) : (
            server.name.trim()[0]
          )}
        </AvatarFallback>
      )}
    </Avatar>
  );
};
