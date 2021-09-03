interface ServerInvite {
  id: string;
  userId: string;
  token: string;
  uses: string;
  maxUses: string;
  expiresAt: string;
  createdAt: string;
}

interface BackendServerInvite {
  id: number;
  userId: number | null;
  token: string;
  uses: number;
  maxUses: number | null;
  expiresAt: Date | null;
  createdAt: Date;
  __typename?: string;
}

interface ExpiresAtOption {
  message: string;
  value: Time;
}
