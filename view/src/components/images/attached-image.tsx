import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/shared.utils';
import { type ImageRes } from '@/types/image.types';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LazyLoadImage } from './lazy-load-image';

interface Props {
  image: ImageRes;
  serverId?: string;
  channelId?: string;
  messageId?: string;
  pollId?: string;
  onImageLoad?(): void;
  className?: string;
}

export const AttachedImage = ({
  image,
  serverId,
  channelId,
  messageId,
  pollId,
  onImageLoad,
  className,
}: Props) => {
  const queryClient = useQueryClient();
  const previouslyLoaded = queryClient.getQueryData([
    'images',
    serverId,
    channelId,
    image.id,
    messageId,
    pollId,
    undefined,
    false,
    undefined,
  ]);

  const [isLoaded, setIsLoaded] = useState(!!previouslyLoaded);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isError, setIsError] = useState(false);

  const { t } = useTranslation();

  const handleLoad = () => {
    onImageLoad?.();
    setIsLoaded(true);
  };

  const handleClick = () => {
    if (isLoaded) {
      setIsDialogOpen(true);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <LazyLoadImage
          imageId={image.id}
          channelId={channelId}
          messageId={messageId}
          pollId={pollId}
          src={image.src}
          alt={t('images.labels.attachedImage')}
          className={cn(
            'w-full cursor-default',
            isLoaded && 'h-auto cursor-pointer',
            !isLoaded && (isError ? 'h-2' : 'h-75'),
            className,
          )}
          isPlaceholder={image.isPlaceholder}
          onClick={handleClick}
          onError={() => setIsError(true)}
          onLoad={handleLoad}
        />
      </DialogTrigger>

      <DialogContent
        className="bg-background/95 text-foreground flex h-screen min-h-screen w-screen max-w-none flex-col items-center justify-center gap-0 overflow-hidden border-none p-2 supports-[height:100dvh]:h-dvh supports-[height:100dvh]:min-h-dvh supports-[height:100svh]:h-svh supports-[height:100svh]:min-h-svh sm:p-4 md:flex md:h-screen md:min-h-screen md:w-screen md:max-w-none md:min-w-full md:rounded-none md:p-6 supports-[height:100dvh]:md:h-dvh supports-[height:100dvh]:md:min-h-dvh supports-[height:100svh]:md:h-svh supports-[height:100svh]:md:min-h-svh dark:bg-black/90 dark:text-white"
        closeButtonClassName="text-foreground data-[state=open]:text-foreground top-3 right-3 z-10 bg-transparent opacity-100 shadow-none data-[state=open]:bg-transparent dark:text-white dark:data-[state=open]:text-white md:top-4 md:right-4 [&_svg:not([class*='size-'])]:size-5"
      >
        <VisuallyHidden>
          <DialogHeader>
            <DialogTitle>{t('images.labels.attachedImage')}</DialogTitle>
            <DialogDescription>
              {t('images.descriptions.attachedImage')}
            </DialogDescription>
          </DialogHeader>
        </VisuallyHidden>

        {isDialogOpen && (
          <LazyLoadImage
            alt={t('images.labels.attachedImage')}
            className="flex h-full w-full items-center justify-center overflow-visible bg-transparent"
            imageClassName="object-contain md:rounded-lg"
            imageId={image.id}
            channelId={channelId}
            messageId={messageId}
            pollId={pollId}
            src={image.src}
            onError={() => setIsError(true)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
