import { AuditLogDetails } from '@/components/audit-log/audit-log-details';
import { Card, CardContent } from '@/components/ui/card';
import { type AuditLogEntryRes } from '@/types/moderation.types';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const AuditLogEntry = ({ entry }: { entry: AuditLogEntryRes }) => {
  const { t } = useTranslation();
  const targetLabel = entry.target.label || t('auditLog.labels.unavailable');
  const originLabel =
    entry.origin === 'proposal'
      ? t('auditLog.origins.proposal')
      : entry.origin === 'system'
        ? t('auditLog.origins.system')
        : entry.actor?.label || t('auditLog.origins.unknownActor');

  return (
    <Card className="gap-3 py-4">
      <CardContent className="space-y-2 px-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-medium">
              {t(`auditLog.actions.${entry.action}`)}
            </div>
            <div className="text-muted-foreground text-sm">
              {entry.proposalPath ? (
                <Link
                  className="text-primary underline-offset-4 hover:underline"
                  to={entry.proposalPath}
                >
                  {originLabel}
                </Link>
              ) : (
                originLabel
              )}
              <span aria-hidden="true"> · </span>
              {entry.scope.serverLabel || t('auditLog.labels.instance')}
            </div>
          </div>
          <time
            className="text-muted-foreground text-sm"
            dateTime={entry.createdAt}
          >
            {dayjs(entry.createdAt).format('MMM D, YYYY h:mm A')}
          </time>
        </div>

        <div className="text-sm">
          <span className="text-muted-foreground">
            {t(`auditLog.targets.${entry.target.kind}`)}:{' '}
          </span>
          {entry.applicationPath ? (
            <Link
              className="text-primary underline-offset-4 hover:underline"
              to={entry.applicationPath}
            >
              {targetLabel}
            </Link>
          ) : (
            <span>{targetLabel}</span>
          )}
        </div>

        {entry.reason && (
          <div className="text-sm">
            <span className="text-muted-foreground">
              {t('auditLog.labels.reason')}:{' '}
            </span>
            <span>{entry.reason}</span>
          </div>
        )}

        <AuditLogDetails
          beforeValue={entry.beforeValue}
          afterValue={entry.afterValue}
          targetKind={entry.target.kind}
        />
      </CardContent>
    </Card>
  );
};
