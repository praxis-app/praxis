import { type ReactNode } from 'react';
import { type IconType } from 'react-icons';

interface Props {
  icon: IconType;
  message: string;
  action?: ReactNode;
}

export const AuditLogFeedMessage = ({ icon: Icon, message, action }: Props) => (
  <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center">
    <Icon className="text-muted-foreground size-8" aria-hidden="true" />
    <p className="text-muted-foreground text-sm">{message}</p>
    {action}
  </div>
);
