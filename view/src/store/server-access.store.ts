import { type ServerAccessRes } from '@/types/server.types';
import { create } from 'zustand';

export interface ServerAccessNotice {
  serverSlug: string;
  access: ServerAccessRes;
}

interface ServerAccessState {
  notices: ServerAccessNotice[];
  addNotice(notice: ServerAccessNotice): void;
  dismissNotice(serverSlug: string): void;
  clearNotices(): void;
}

export const useServerAccessStore = create<ServerAccessState>((set) => ({
  notices: [],

  addNotice(notice) {
    set(({ notices }) => ({
      notices: notices.some((n) => n.serverSlug === notice.serverSlug)
        ? notices.map((n) => (n.serverSlug === notice.serverSlug ? notice : n))
        : [...notices, notice],
    }));
  },

  dismissNotice(serverSlug) {
    set(({ notices }) => ({
      notices: notices.filter((n) => n.serverSlug !== serverSlug),
    }));
  },

  clearNotices() {
    set({ notices: [] });
  },
}));
