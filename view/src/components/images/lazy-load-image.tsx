import { useImageSrc } from '@/hooks/use-image-src';
import { cn } from '@/lib/shared.utils';
import {
  type ComponentProps,
  type SyntheticEvent,
  forwardRef,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

interface Props extends ComponentProps<'img'> {
  alt: string;
  skipAnimation?: boolean;
  isPlaceholder?: boolean;
  imageId?: string;
  channelId?: string;
  messageId?: string;
  pollId?: string;
  eventId?: string;
  eventCoverPhoto?: boolean;
  userId?: string;
  serverImageServerId?: string;
  src?: string;
  className?: string;
  imageClassName?: string;
  onError?: () => void;
}

/**
 * LazyLoadImage component with ref forwarding support.
 *
 * Uses dual ref system:
 * - internalRef: For useImageSrc/useInView intersection observer (needs stable RefObject)
 * - forwardedRef: For parent components like DialogTrigger (needs DOM element access)
 *
 * This is necessary because:
 * 1. IntersectionObserver requires a stable RefObject<HTMLElement | null>
 * 2. DialogTrigger with asChild needs a ref to the DOM element for accessibility/focus
 * 3. ForwardedRef can be null or a function, which breaks IntersectionObserver
 */
export const LazyLoadImage = forwardRef<HTMLDivElement, Props>(
  (
    {
      alt,
      skipAnimation = false,
      isPlaceholder,
      imageId,
      channelId,
      messageId,
      pollId,
      eventId,
      eventCoverPhoto,
      userId,
      serverImageServerId,
      onLoad,
      src,
      className,
      imageClassName,
      onError,
      ...imgProps
    },
    forwardedRef,
  ) => {
    const internalRef = useRef<HTMLDivElement | null>(null);

    const setRef = (node: HTMLDivElement | null) => {
      internalRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    };

    const { src: srcFromImageId, isError: fetchFailed } = useImageSrc({
      enabled: !isPlaceholder,
      ref: internalRef,
      imageId,
      channelId,
      messageId,
      pollId,
      eventId,
      eventCoverPhoto,
      userId,
      serverImageServerId,
    });

    const [loaded, setLoaded] = useState(!!srcFromImageId);
    const [failedSrc, setFailedSrc] = useState<string>();

    const { t } = useTranslation();

    const notifyFetchFailed = useEffectEvent(() => onError?.());

    useEffect(() => {
      if (fetchFailed) {
        notifyFetchFailed();
      }
    }, [fetchFailed]);

    const resolvedSrc = src || srcFromImageId;
    const failed = fetchFailed || (!!resolvedSrc && failedSrc === resolvedSrc);
    const showImage = !!resolvedSrc && !failed && (!isPlaceholder || !!src);
    const showFileMissing = failed && !showImage && !isPlaceholder;

    const shouldShowPlaceholderBackground =
      isPlaceholder || !loaded || !showImage;

    const handleLoad = (event: SyntheticEvent<HTMLImageElement, Event>) => {
      onLoad?.(event);
      setLoaded(true);
    };

    const handleError = () => {
      setFailedSrc(resolvedSrc);
      onError?.();
    };

    return (
      <>
        <div
          ref={setRef}
          className={cn(
            'relative overflow-hidden transition-colors duration-200',
            shouldShowPlaceholderBackground && 'bg-muted',
            className, // TODO: Determine if this is also needed for the container
          )}
        >
          {showImage ? (
            <img
              alt={alt}
              onLoad={handleLoad}
              onError={handleError}
              src={resolvedSrc}
              loading={resolvedSrc ? 'lazy' : undefined}
              className={cn(
                'h-full w-full object-cover',
                !skipAnimation && 'transition-[filter,opacity] duration-300',
                !skipAnimation && !loaded && 'opacity-0 blur-sm',
                !skipAnimation && loaded && 'blur-0 opacity-100',
                className,
                imageClassName,
              )}
              {...imgProps}
            />
          ) : null}
        </div>
        {showFileMissing && (
          <div className="text-muted-foreground text-sm">
            {t('images.errors.fileMissing')}
          </div>
        )}
      </>
    );
  },
);

LazyLoadImage.displayName = 'LazyLoadImage';
