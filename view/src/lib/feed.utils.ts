import { type FeedItemRes, type FeedQuery } from '@/types/channel.types';
import { type ProposalForumReferenceRes } from '@/types/forum.types';
import { type ImageRes } from '@/types/image.types';

type MessageFeedItem = Extract<FeedItemRes, { type: 'message' }>;

export const preserveMessageImages = (
  existingImages?: ImageRes[],
  incomingImages?: ImageRes[],
) => {
  if (!incomingImages?.length) {
    return existingImages?.length ? existingImages : incomingImages;
  }

  if (!existingImages?.length) {
    return incomingImages;
  }

  const existingMap = new Map(existingImages.map((image) => [image.id, image]));

  return incomingImages.map((image) => {
    const existing = existingMap.get(image.id);
    if (!existing) {
      return image;
    }

    const merged =
      existing.src && !image.src
        ? { ...image, src: existing.src }
        : { ...image };
    if (!existing.isPlaceholder && merged.isPlaceholder) {
      delete merged.isPlaceholder;
    }
    return merged;
  });
};

export const preserveFeedItemImages = (
  existing: MessageFeedItem | undefined,
  incoming: MessageFeedItem,
): MessageFeedItem => ({
  ...incoming,
  images: preserveMessageImages(existing?.images, incoming.images),
});

export const preserveFeedImages = (
  existingFeed: FeedItemRes[] | undefined,
  incomingFeed: FeedItemRes[],
) => {
  const existingMessages = new Map(
    existingFeed
      ?.filter((item): item is MessageFeedItem => item.type === 'message')
      .map((item) => [item.id, item]),
  );

  return incomingFeed.map((item) => {
    if (item.type !== 'message') {
      return item;
    }
    return preserveFeedItemImages(existingMessages.get(item.id), item);
  });
};

export const replaceProposalWithForumReference = (
  data: FeedQuery | undefined,
  reference: ProposalForumReferenceRes,
): FeedQuery | undefined => {
  if (!data) {
    return data;
  }
  const replacement: FeedItemRes = {
    ...reference,
    type: 'proposalMoved',
  };
  return {
    ...data,
    pages: data.pages.map((page) => ({
      ...page,
      feed: page.feed.map((item) =>
        item.type === 'poll' && item.id === reference.proposalId
          ? replacement
          : item,
      ),
    })),
  };
};

export const updateFeedPoll = (
  data: FeedQuery | undefined,
  poll: Extract<FeedItemRes, { type: 'poll' }>,
  insertIfMissing = false,
): FeedQuery | undefined => {
  const matches = (item: FeedItemRes) =>
    item.type === 'poll' && item.id === poll.id;
  if (data?.pages.some((page) => page.feed.some(matches))) {
    return {
      ...data,
      pages: data.pages.map((page) => ({
        ...page,
        feed: page.feed.map((item) => (matches(item) ? poll : item)),
      })),
    };
  }
  if (!insertIfMissing) return data;
  const [first, ...rest] = data?.pages ?? [];
  const oldest = first?.feed.at(-1);
  if (
    first?.hasMore &&
    oldest &&
    Date.parse(poll.createdAt) < Date.parse(oldest.createdAt)
  ) {
    return data;
  }
  const feed = [...(first?.feed ?? []), poll].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
  return {
    pages: [{ ...first, feed }, ...rest],
    pageParams: data?.pageParams ?? [null],
  };
};
