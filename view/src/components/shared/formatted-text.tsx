import { TruncationSizes } from '@/constants/shared.constants';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { cn } from '@/lib/shared.utils';
import { formatUserText } from '@/lib/text.utils';
import { useEffect, useState } from 'react';

interface Props {
  text?: string | null;
  urlTrimSize?: number;
  className?: string;
}

export const FormattedText = ({ text, urlTrimSize, className }: Props) => {
  const [formattedText, setFormattedText] = useState<string>();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (!text) {
      return;
    }
    const formatText = async () => {
      const urlSize =
        urlTrimSize || isDesktop
          ? TruncationSizes.Large
          : TruncationSizes.Medium;
      setFormattedText(await formatUserText(text, urlSize));
    };
    formatText();
  }, [text, isDesktop, urlTrimSize]);

  if (!formattedText) {
    return null;
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: formattedText }}
      className={cn(
        'max-w-full min-w-0 wrap-break-word whitespace-pre-wrap',
        className,
      )}
    />
  );
};
