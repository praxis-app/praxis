import { Badge } from '@/components/ui/badge';
import { type ReactNode } from 'react';
import { type IconType } from 'react-icons';

interface Props {
  Icon: IconType;
  children: ReactNode;
}

export const AuditLogInviteChip = ({ Icon, children }: Props) => (
  <Badge
    variant="outline"
    className="min-h-7.5 gap-1.5 px-2.5 py-1 text-sm font-normal whitespace-normal"
  >
    <Icon className="text-muted-foreground" aria-hidden="true" />
    {children}
  </Badge>
);
