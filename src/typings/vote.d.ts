interface Vote {
  id: string;
  userId: string;
  motionId: string;
  body: string;
  flipState: string;
  consensusState: string;
  verified: boolean;
  createdAt: string;
}
