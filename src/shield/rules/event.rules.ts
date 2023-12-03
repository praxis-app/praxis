import { rule } from 'graphql-shield';
import { Context } from '../../context/context.types';
import { Event } from '../../events/models/event.model';
import { GroupPrivacy } from '../../groups/group-configs/group-config.constants';
import { Image } from '../../images/models/image.model';

export const isPublicEvent = rule({ cache: 'strict' })(async (
  parent: Event,
  args: { id: number },
  { services: { eventsService } }: Context,
) => {
  const event = await eventsService.getEvent({
    id: parent ? parent.id : args.id,
    group: {
      config: { privacy: GroupPrivacy.Public },
    },
  });
  return !!event;
});

export const isPublicEventPost = rule({ cache: 'strict' })(async (
  parent,
  args,
  { services: { postsService } }: Context,
) => {
  const { event } = await postsService.getPost(parent ? parent.id : args.id, [
    'event.group.config',
  ]);
  return event?.group?.config.privacy === GroupPrivacy.Public;
});

export const isPublicEventImage = rule({ cache: 'strict' })(
  async (parent: Image, _args, { services: { eventsService } }: Context) =>
    eventsService.isPublicEventImage(parent.id),
);
