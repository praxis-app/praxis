import { rule } from "graphql-shield";
import { Context } from "../../context/context.service";
import { Event } from "../../events/models/event.model";
import { GroupPrivacy } from "../../groups/group-configs/models/group-config.model";

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

export const isPublicEventImage = rule()(
  async (parent, _args, { services: { imagesService } }: Context) => {
    const image = await imagesService.getImage({ id: parent.id }, [
      "event.group.config",
    ]);
    return image?.event?.group?.config.privacy === GroupPrivacy.Public;
  }
);