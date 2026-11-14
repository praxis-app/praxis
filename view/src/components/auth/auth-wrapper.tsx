import { NoticeDialog } from '@/components/shared/notice-dialog';
import { useAccountAccess } from '@/hooks/use-account-access';
import { useMeQuery } from '@/hooks/use-me-query';
import { useRecordServerVisit } from '@/hooks/use-record-server-visit';
import { type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export const AuthWrapper = ({ children }: Props) => {
  const { data: meData, error: meError } = useMeQuery({
    retry: import.meta.env.PROD ? 1 : 0,
  });
  useAccountAccess(meData?.user.id, meError);
  useRecordServerVisit();
  return (
    <>
      {children}
      <NoticeDialog />
    </>
  );
};
