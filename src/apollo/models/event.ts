import { Event } from ".prisma/client";
import isoWeek from "dayjs/plugin/isoWeek";
import dayjs from "dayjs";

import prisma from "../../utils/initPrisma";
import {
  saveImage,
  FileUpload,
  randomDefaultImagePath,
} from "../../utils/image";
import { ImageVariety } from "../../constants/image";
import { EventTimeFrames } from "../../constants/event";

dayjs.extend(isoWeek);

export const eventConnect = (eventId: string | number) => {
  if (eventId)
    return {
      event: {
        connect: {
          id: Number(eventId),
        },
      },
    };
  return undefined;
};

export const filterByThisWeek = (events: Event[]): Event[] =>
  events.filter(
    ({ startsAt }) =>
      dayjs(startsAt.getTime()).year() === dayjs().year() &&
      dayjs(startsAt.getTime()).isoWeek() === dayjs().isoWeek()
  );

export const sortByStartsAt = (events: Event[]): Event[] =>
  events.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

export const whereTimeFrame = (timeFrame: string) => {
  if (
    timeFrame === EventTimeFrames.All ||
    timeFrame === EventTimeFrames.ThisWeek ||
    !timeFrame
  )
    return {};

  return {
    OR: [
      {
        endsAt: null,
        startsAt: {
          [timeFrame === EventTimeFrames.Past ? "lt" : "gt"]: new Date(),
        },
      },
      {
        NOT: {
          endsAt: null,
        },
        endsAt: {
          [timeFrame === EventTimeFrames.Past ? "lt" : "gt"]: new Date(),
        },
      },
    ],
  };
};

export const saveEventCoverPhoto = async (
  event: Event,
  image?: FileUpload,
  allowRandom = false
) => {
  let path = "";
  if (allowRandom) path = randomDefaultImagePath();
  if (image) path = await saveImage(image);
  if (path) {
    await prisma.image.create({
      data: {
        event: {
          connect: {
            id: event.id,
          },
        },
        variety: ImageVariety.CoverPhoto,
        path,
      },
    });
  }
};
