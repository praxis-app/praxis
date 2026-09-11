import { api } from '@/client/api-client';
import { useAuthData } from '@/hooks/use-auth-data';
import { useQuery } from '@tanstack/react-query';

export const useInstanceCapabilitiesQuery = () => {
  const { isMeSuccess, isRegistered } = useAuthData({
    isFirstUserQueryEnabled: false,
  });
  const enabled = isMeSuccess && isRegistered;

  return useQuery({
    queryKey: ['instance', 'capabilities'],
    queryFn: api.getInstanceCapabilities,
    enabled,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};
