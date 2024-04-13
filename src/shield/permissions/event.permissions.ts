import { allow, or } from 'graphql-shield';
import { canManageEvents, isPublicEvent } from '../rules/event.rules';
import {
  canCreateGroupEvents,
  canManageGroupEvents,
} from '../rules/group.rules';
import { isVerified } from '../rules/user.rules';

export const eventPermissions = {
  Query: {
    event: or(isVerified, isPublicEvent),
    events: allow,
  },
  Mutation: {
    createEvent: or(canCreateGroupEvents, canManageGroupEvents),
    updateEvent: or(canManageEvents, canManageGroupEvents),
    deleteEvent: or(canManageEvents, canManageGroupEvents),
  },
  ObjectTypes: {
    Event: or(isVerified, isPublicEvent),
  },
};
