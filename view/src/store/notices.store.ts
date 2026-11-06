import { create } from 'zustand';

export interface Notice {
  id: string;
  title: string;
  description: string;
  reason: string | null;
  moderatedAt: string | null;
}

interface NoticesState {
  notices: Notice[];
  addNotice(notice: Notice): void;
  dismissNotice(id: string): void;
  clearNotices(): void;
}

export const useNoticesStore = create<NoticesState>((set) => ({
  notices: [],

  addNotice(notice) {
    set(({ notices }) => ({
      notices: notices.some((n) => n.id === notice.id)
        ? notices.map((n) => (n.id === notice.id ? notice : n))
        : [...notices, notice],
    }));
  },

  dismissNotice(id) {
    set(({ notices }) => ({
      notices: notices.filter((n) => n.id !== id),
    }));
  },

  clearNotices() {
    set({ notices: [] });
  },
}));
