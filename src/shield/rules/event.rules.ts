import { rule } from "graphql-shield";
import { Context } from "../../context/context.service";
import { Event } from "../../events/models/event.model";
import { GroupPrivacy } from "../../groups/group-configs/models/group-config.model";
import { Image } from "../../images/models/image.model";
import { Post } from "../../posts/models/post.model";

export const isPublicEvent = rule()(
  async (
    parent: Event,
    args: { id: number },
    { services: { eventsService } }: Context
  ) => {
    const event = await eventsService.getEvent({
      id: parent ? parent.id : args.id,
      group: {
        config: { privacy: GroupPrivacy.Public },
      },
    });
    return !!event;
  }
);

export const isPublicEventPost = rule()(
  async (parent: Post, _args, { services: { postsService } }: Context) => {
    const post = await postsService.getPost(parent.id, ["event.group.config"]);
    return post.event?.group?.config.privacy === GroupPrivacy.Public;
  }
);

export const isPublicEventImage = rule()(
  async (parent: Image, _args, { services: { imagesService } }: Context) => {
    const image = await imagesService.getImage({ id: parent.id }, [
      "event.group.config",
    ]);
    return image?.event?.group?.config.privacy === GroupPrivacy.Public;
  }
);
