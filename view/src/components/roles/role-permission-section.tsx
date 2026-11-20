import { Card } from '@/components/ui/card';
import { type ReactNode } from 'react';

interface Props {
  label: string;
  children: ReactNode;
}

export const RolePermissionSection = ({ label, children }: Props) => (
  <fieldset>
    <legend className="text-muted-foreground mb-2 px-1 text-sm font-medium">
      {label}
    </legend>
    <Card className="gap-0 divide-y py-0">{children}</Card>
  </fieldset>
);
