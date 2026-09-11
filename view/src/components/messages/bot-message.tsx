import { MIDDOT_WITH_SPACES } from '@/constants/shared.constants';
import { cn } from '@/lib/shared.utils';
import { timeAgo } from '@/lib/time.utils';
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { MdVisibility } from 'react-icons/md';
import appIconImg from '../../assets/images/app-icon.png';
import { type MessageRes } from '../../types/message.types';
import { FormattedText } from '../shared/formatted-text';
import { Button } from '../ui/button';
import { UserAvatar } from '../users/user-avatar';

interface Props {
  bodyClassName?: string;
  children?: ReactNode;
  currentUserOnly?: boolean;
  onDismiss?: () => void;
  message?: MessageRes;
}

const generatePulseColor = () => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 70 + Math.random() * 20;
  const lightness = 45 + Math.random() * 10;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const useProcessingGlow = (isProcessing: boolean) => {
  const [currentColor, setCurrentColor] = useState<string | null>(() =>
    isProcessing ? generatePulseColor() : null,
  );
  const [transitionDuration, setTransitionDuration] = useState('250ms');

  useEffect(() => {
    if (!isProcessing) {
      setCurrentColor(null);
      setTransitionDuration('250ms');
      return;
    }

    const updateGlow = () => {
      setCurrentColor(generatePulseColor());
      setTransitionDuration(`${600 + Math.random() * 300}ms`);
    };

    updateGlow();
    const interval = setInterval(updateGlow, 1200);

    return () => clearInterval(interval);
  }, [isProcessing]);

  return useMemo<CSSProperties>(() => {
    const transition = `box-shadow ${transitionDuration} ease-in-out`;

    if (!isProcessing || !currentColor) {
      return {
        borderRadius: '0.75rem',
        boxShadow: '0 0 0 0 transparent',
        transition,
      };
    }

    const glowColor = currentColor
      .replace('hsl(', 'hsla(')
      .replace(')', ', 0.35)');

    return {
      borderRadius: '0.75rem',
      boxShadow: `inset 0 0 0 1px ${glowColor}, inset 0 0 6px 2px ${glowColor}, inset 0 0 12px 4px ${glowColor}`,
      transition,
    };
  }, [currentColor, isProcessing, transitionDuration]);
};

export const BotMessage = ({
  children,
  bodyClassName,
  currentUserOnly,
  onDismiss,
  message,
}: Props) => {
  const { t } = useTranslation();
  const isProcessing = message?.commandStatus === 'processing';
  const contentGlowStyle = useProcessingGlow(isProcessing);

  const botName =
    message?.bot?.displayName ||
    message?.bot?.name ||
    t('messages.names.praxisBot');
  const formattedDate = timeAgo(message?.createdAt || Date());

  const renderContent = () => {
    if (children) {
      return children;
    }
    if (!message) {
      return null;
    }
    if (isProcessing) {
      return (
        <div className="text-foreground mt-1 px-3 py-1.5 text-sm font-medium">
          {t('messages.prompts.processingCommand')}
        </div>
      );
    }
    if (!message.body) {
      return null;
    }
    return <FormattedText text={message.body} />;
  };

  return (
    <div className="flex max-w-full min-w-0 gap-4">
      <UserAvatar name={botName} imageSrc={appIconImg} className="mt-0.5" />

      <div className="max-w-full min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="font-medium">{botName}</div>
          <div className="text-muted-foreground text-sm font-light">
            {formattedDate}
          </div>
        </div>

        <div
          className={cn('max-w-full min-w-0 transition-all', bodyClassName)}
          style={contentGlowStyle}
        >
          {renderContent()}
        </div>

        {(currentUserOnly || onDismiss) && (
          <div className="flex items-center gap-1 pt-1">
            {currentUserOnly && (
              <div className="flex items-center gap-1">
                <MdVisibility className="text-muted-foreground text-sm" />
                <div className="text-muted-foreground text-xs">
                  {t('messages.prompts.onlyVisibleToYou')}
                </div>
              </div>
            )}
            {currentUserOnly && onDismiss && (
              <div className="text-muted-foreground px-0.5 text-sm">
                {MIDDOT_WITH_SPACES}
              </div>
            )}
            {onDismiss && (
              <Button
                onClick={onDismiss}
                variant="link"
                className="text-blurple-2 dark:text-blurple-3 mt-0.5 p-0 text-xs font-normal"
              >
                {t('messages.actions.dismissMessage')}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
