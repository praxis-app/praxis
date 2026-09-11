import { useMeQuery } from '@/hooks/use-me-query';
import { useRecordServerVisit } from '@/hooks/use-record-server-visit';
import { type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const AuthWrapper = ({ children }: Props) => {
  useMeQuery({ retry: import.meta.env.PROD ? 1 : 0 });
  useRecordServerVisit();
  return <>{children}</>;
};
