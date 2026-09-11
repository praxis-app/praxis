import { type ThreadIdentity } from '@/types/message.types';
import copy from 'copy-to-clipboard';

export const copyThreadLink = ({ rootKind, rootId }: ThreadIdentity) => {
  const link = new URL(window.location.href);
  link.hash = '';
  link.search = '';
  link.searchParams.set('thread', rootId);
  if (rootKind === 'poll') {
    link.searchParams.set('threadKind', 'poll');
  }
  copy(link.toString());
};
