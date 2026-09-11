import { createMongoAbility } from '@casl/ability';
import { type InstanceAbility, type ServerAbility } from '@/types/role.types';
import { useAuthStore } from '../store/auth.store';
import { useMeQuery } from './use-me-query';
import { useServerData } from './use-server-data';

export const useAbility = () => {
  const { isLoggedIn } = useAuthStore();
  const { serverId, isLoading: isServerDataLoading } = useServerData();

  const { data: meData, isLoading: isMeLoading } = useMeQuery({
    enabled: isLoggedIn,
  });

  const getServerAbility = () => {
    const permissions = serverId
      ? meData?.user.permissions.servers[serverId] || []
      : [];
    return createMongoAbility<ServerAbility>(permissions);
  };

  const getInstanceAbility = () => {
    const permissions = meData?.user.permissions.instance || [];
    return createMongoAbility<InstanceAbility>(permissions);
  };

  return {
    serverAbility: getServerAbility(),
    instanceAbility: getInstanceAbility(),
    isLoading: isMeLoading || isServerDataLoading,
  };
};
