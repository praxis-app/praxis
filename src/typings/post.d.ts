interface Post {
  id: string;
  userId: string;
  groupId: string;
  body: string;
}

interface BackendPost {
  id: number;
  userId: number | null;
  groupId: number | null;
  body: string | null;
  createdAt: Date;
}
