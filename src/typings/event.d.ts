interface ClientEvent {
  id: string;
  groupId: string;
  name: string;
  description: string;
  location: string;
  startsAt: string;
  endsAt: string;
  online: boolean;
  externalLink: string;
  createdAt: string;
}

interface ClientEventAttendee {
  id: string;
  userId: string;
  eventId: string;
  status: string;
  createdAt: string;
}

interface EventFormValues {
  name: string;
  description: string;
  location: string;
  online: boolean;
  externalLink: string;
}
