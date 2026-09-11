import { api } from '@/client/api-client';
import { ServerAvatar } from '@/components/servers/server-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { MIDDOT_WITH_SPACES } from '@/constants/shared.constants';
import { cn } from '@/lib/shared.utils';
import { useAuthStore } from '@/store/auth.store';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?(): void;
}

export const SwitchServerDialog = ({ open, onOpenChange, onSelect }: Props) => {
  const { isLoggedIn } = useAuthStore();

  const { t } = useTranslation();
  const { serverSlug } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['me', 'servers'],
    queryFn: api.getCurrentUserServers,
    enabled: open && isLoggedIn,
  });

  const servers = data?.servers ?? [];

  const sortedServers = [...servers].sort((a, b) => {
    const aIsActive = a.slug === serverSlug;
    const bIsActive = b.slug === serverSlug;
    if (aIsActive && !bIsActive) {
      return -1;
    }
    if (!aIsActive && bIsActive) {
      return 1;
    }
    return 0;
  });

  const handleSelect = (slug: string) => {
    onOpenChange(false);
    navigate(`/s/${slug}`);
    onSelect?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:w-xl">
        <DialogHeader>
          <DialogTitle>{t('navigation.labels.switchServers')}</DialogTitle>
          <DialogDescription>
            {t('servers.prompts.switchServersDescription')}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : sortedServers.length ? (
          <div className="flex min-w-0 flex-col gap-2">
            {sortedServers.map((server) => (
              <Button
                key={server.id}
                variant="ghost"
                className={cn(
                  'h-fit items-start gap-3 px-3 py-3',
                  server.slug === serverSlug &&
                    'bg-accent/30 border-border/40 border',
                )}
                onClick={() => handleSelect(server.slug)}
              >
                <ServerAvatar server={server} className="size-10 shrink-0" />
                <div className="flex w-[70vw] min-w-0 flex-col gap-0.5 text-left">
                  <div className="flex items-center gap-2 truncate leading-tight font-semibold">
                    <div className="truncate">{server.name}</div>
                    {server.isDefaultServer && (
                      <Badge variant="secondary" className="shrink-0 uppercase">
                        {t('servers.labels.default')}
                      </Badge>
                    )}
                  </div>
                  <div className="text-muted-foreground truncate text-xs">
                    /s/{server.slug}
                    {server.memberCount !== undefined &&
                      `${MIDDOT_WITH_SPACES}${t('roles.labels.membersCount', {
                        count: server.memberCount,
                      })}`}
                  </div>
                  {server.description && (
                    <div className="text-muted-foreground truncate text-xs leading-snug">
                      {server.description}
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            {t('servers.prompts.noServersAvailable')}
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
};
