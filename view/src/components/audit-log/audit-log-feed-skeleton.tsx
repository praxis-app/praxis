import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';

const SKELETON_ENTRY_COUNT = 4;

export const AuditLogFeedSkeleton = () => {
  const { t } = useTranslation();

  return (
    <div
      role="status"
      aria-label={t('auditLog.states.loading')}
      className="space-y-3"
    >
      {Array.from({ length: SKELETON_ENTRY_COUNT }, (_, index) => (
        <Card key={index} aria-hidden="true" className="gap-3 py-4">
          <CardContent className="space-y-3 px-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-3 w-28" />
            </div>
            <Skeleton className="h-3 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
