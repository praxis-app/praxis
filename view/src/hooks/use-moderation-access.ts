import { getModerationAccess } from '@/lib/moderation.utils';
import { useAbility } from './use-ability';

export const useModerationAccess = () => {
  const { serverAbility, instanceAbility } = useAbility();
  return getModerationAccess(serverAbility, instanceAbility);
};
