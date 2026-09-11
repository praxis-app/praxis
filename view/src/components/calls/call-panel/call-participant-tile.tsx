import { ParticipantTile } from '@livekit/components-react';
import { type CSSProperties, useLayoutEffect, useRef, useState } from 'react';

const TILE_ASPECT_RATIO = 16 / 9;

const fitAspectRatio = (width: number, height: number) => {
  if (width <= 0 || height <= 0) {
    return null;
  }

  if (width / height > TILE_ASPECT_RATIO) {
    return {
      height,
      width: height * TILE_ASPECT_RATIO,
    };
  }

  return {
    height: width / TILE_ASPECT_RATIO,
    width,
  };
};

interface Props {
  layoutKey: string;
}

export const CallParticipantTile = ({ layoutKey }: Props) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const [tileSize, setTileSize] = useState<{
    height: number;
    width: number;
  } | null>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;

    if (!frame) {
      return;
    }

    let animationFrame: number | null = null;
    const updateTileSize = () => {
      const nextSize = fitAspectRatio(frame.clientWidth, frame.clientHeight);
      setTileSize((currentSize) => {
        if (
          currentSize &&
          nextSize &&
          Math.round(currentSize.width) === Math.round(nextSize.width) &&
          Math.round(currentSize.height) === Math.round(nextSize.height)
        ) {
          return currentSize;
        }

        return nextSize;
      });
    };

    const scheduleTileSizeUpdate = () => {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }

      animationFrame = requestAnimationFrame(updateTileSize);
    };

    scheduleTileSizeUpdate();

    const observer = new ResizeObserver(scheduleTileSizeUpdate);
    observer.observe(frame);
    window.addEventListener('resize', scheduleTileSizeUpdate);
    window.visualViewport?.addEventListener('resize', scheduleTileSizeUpdate);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', scheduleTileSizeUpdate);
      window.visualViewport?.removeEventListener(
        'resize',
        scheduleTileSizeUpdate,
      );

      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [layoutKey]);

  const tileStyle: CSSProperties = tileSize
    ? {
        height: tileSize.height,
        width: tileSize.width,
      }
    : {
        height: '100%',
        width: '100%',
      };

  return (
    <div
      ref={frameRef}
      className="flex h-full min-h-0 w-full min-w-0 items-center justify-center overflow-hidden"
    >
      <ParticipantTile
        className="bg-muted text-foreground [&_.lk-focus-toggle-button]:text-foreground! [&_.lk-participant-metadata-item]:text-foreground! aspect-video max-h-full max-w-full flex-none overflow-hidden rounded-md border border-[--color-border] data-[lk-speaking=true]:border-green-500 [&_.lk-focus-toggle-button]:bg-[rgb(255_255_255/85%)]! dark:[&_.lk-focus-toggle-button]:bg-[rgb(0_0_0/60%)]! dark:[&_.lk-focus-toggle-button]:text-white! [&_.lk-participant-metadata]:select-none [&_.lk-participant-metadata-item]:bg-[rgb(255_255_255/85%)]! dark:[&_.lk-participant-metadata-item]:bg-[rgb(0_0_0/60%)]! dark:[&_.lk-participant-metadata-item]:text-white! [&_.lk-participant-placeholder]:bg-white! dark:[&_.lk-participant-placeholder]:bg-[rgb(29_30_32)]! [&_.lk-participant-placeholder_svg_path]:fill-[rgb(229_231_235)]! [&_.lk-participant-placeholder_svg_path]:[fill-opacity:1]! dark:[&_.lk-participant-placeholder_svg_path]:fill-white! dark:[&_.lk-participant-placeholder_svg_path]:[fill-opacity:0.25]!"
        data-testid="call-participant-tile"
        style={tileStyle}
      />
    </div>
  );
};
