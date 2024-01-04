import { rule } from 'graphql-shield';
import { FeedItemsConnection } from '../../common/models/feed-items.connection';
import { Context } from '../../context/context.types';
import { Event } from '../../events/models/event.model';
import { GroupPrivacy } from '../../groups/groups.constants';
import { Image } from '../../images/models/image.model';
import { Post } from '../../posts/models/post.model';

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
  parent: Post | FeedItemsConnection | null,
  args: { id: number } | null,
  { services: { postsService } }: Context,
) => {
  let postId: number | undefined;

  if (parent instanceof Post) {
    postId = parent.id;
  } else if (parent && 'nodes' in parent) {
    postId = parent.nodes[0].id;
  } else if (args) {
    postId = args.id;
  }
  if (!postId) {
    return false;
  }
  const { event } = await postsService.getPost(postId, ['event.group.config']);
  return event?.group?.config.privacy === GroupPrivacy.Public;
});

export const isPublicEventImage = rule({ cache: 'strict' })(
  async (parent: Image, _args, { services: { eventsService } }: Context) =>
    eventsService.isPublicEventImage(parent.id),
);
