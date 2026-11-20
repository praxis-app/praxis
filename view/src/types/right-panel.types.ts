// TODO: Convert to kebab-case for right panel types
export type StandaloneRightPanel = {
  type: 'activeDecisions';
};

export type RightPanel =
  | StandaloneRightPanel
  | {
      type: 'forumPost';
      postId: string;
    }
  | {
      type: 'thread';
      rootKind: 'message' | 'poll';
      rootId: string;
    }
  | null;
