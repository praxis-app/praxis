import { api } from '@/client/api-client';
import { ChooseAuthDialog } from '@/components/auth/choose-auth-dialog';
import { AttachedImagePreview } from '@/components/images/attached-image-preview';
import { ImageInput } from '@/components/images/image-input';
import { MessageFormMenu } from '@/components/messages/message-form-menu';
import { getThreadQueryKey } from '@/components/messages/thread/thread-query.utils';
import { Button } from '@/components/ui/button';
import { Form, FormField } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { KeyCodes } from '@/constants/shared.constants';
import { useAuthData } from '@/hooks/use-auth-data';
import { useServerData } from '@/hooks/use-server-data';
import { handleError } from '@/lib/error.utils';
import { validateImageInput } from '@/lib/image.utilts';
import { cn, t } from '@/lib/shared.utils';
import { type FeedItemRes, type FeedQuery } from '@/types/channel.types';
import { type ImageRes } from '@/types/image.types';
import {
  type MessageRes,
  type ThreadIdentity,
  type ThreadQuery,
} from '@/types/message.types';
import { MESSAGE_BODY_MAX } from '@/constants/message.constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type KeyboardEventHandler, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { BiSolidSend } from 'react-icons/bi';
import { MdAdd } from 'react-icons/md';
import { TbMicrophoneFilled } from 'react-icons/tb';
import { toast } from 'sonner';
import * as zod from 'zod';

const formSchema = zod.object({
  body: zod.string().max(MESSAGE_BODY_MAX, {
    message: t('messages.errors.longBody'),
  }),
});

interface Props {
  channelId?: string;
  callId?: string;
  forumPostId?: string;
  thread?: ThreadIdentity;
  focusOnTyping?: boolean;
  showActions?: boolean;
  disabled?: boolean;
  onSend?(): void;
}

export const MessageForm = ({
  channelId,
  callId,
  forumPostId,
  thread,
  focusOnTyping = true,
  showActions = true,
  disabled = false,
  onSend,
}: Props) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isAuthPromptOpen, setIsAuthPromptOpen] = useState(false);
  const [imagesInputKey, setImagesInputKey] = useState<number>();
  const [images, setImages] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>();

  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isFieldSizingSupportedRef = useRef(true);

  const { me, isFirstUser, isLoggedIn, inviteToken } = useAuthData({
    isFirstUserQueryEnabled: true,
  });
  const { serverId } = useServerData();

  const form = useForm<zod.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { body: '' },
  });

  const { getValues, formState, setValue, reset, handleSubmit, control } = form;
  const isEmptyBody = !getValues('body') && !formState.dirtyFields.body;
  const isEmpty = isEmptyBody && !images.length;

  const draftKey = thread
    ? `message-draft-${serverId}-${channelId}-thread-${thread.rootKind}-${thread.rootId}`
    : forumPostId
      ? `message-draft-${serverId}-${channelId}-forum-post-${forumPostId}`
      : callId
        ? `message-draft-${serverId}-${channelId}-call-${callId}`
        : `message-draft-${serverId}-${channelId}`;

  const saveDraft = (draft: string) => {
    if (draft.trim()) {
      localStorage.setItem(draftKey, draft);
    } else {
      localStorage.removeItem(draftKey);
    }
  };

  const threadQueryKey = getThreadQueryKey(
    serverId,
    channelId,
    thread?.rootKind,
    thread?.rootId,
    inviteToken,
  );

  const feedQueryKey = callId
    ? ['servers', serverId, 'channels', channelId, 'calls', callId, 'feed']
    : ['servers', serverId, 'channels', channelId, 'feed'];

  const sortFeedByDate = (feed: FeedItemRes[]): FeedItemRes[] => {
    return [...feed].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  };

  const { mutate: sendMessage, isPending: isMessageSending } = useMutation({
    mutationFn: async ({ body }: zod.infer<typeof formSchema>) => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      if (!channelId) {
        throw new Error('Channel ID is required');
      }
      const currentImages = [...images];
      validateImageInput(currentImages);
      setUploadProgress(currentImages.length ? 0 : undefined);

      let message: MessageRes;
      if (thread) {
        const response =
          thread.rootKind === 'message'
            ? await api.sendMessageThreadReply(
                serverId,
                channelId,
                thread.rootId,
                { body: body || undefined },
                currentImages,
              )
            : await api.sendPollThreadReply(
                serverId,
                channelId,
                thread.rootId,
                { body: body || undefined },
                currentImages,
              );
        message = response.message;
      } else if (forumPostId) {
        const response = await api.createForumReply(
          serverId,
          channelId,
          forumPostId,
          { body },
          currentImages,
        );
        message = response.reply;
      } else if (callId) {
        const response = await api.sendCallMessage(
          serverId,
          channelId,
          callId,
          body,
          currentImages,
        );
        message = response.message;
      } else {
        const response = await api.sendMessage(
          serverId,
          channelId,
          body,
          currentImages,
          currentImages.length ? setUploadProgress : undefined,
        );
        message = response.message;
      }
      return message;
    },
    onMutate: async ({ body }) => {
      if (!serverId || !channelId) {
        throw new Error('Server ID and channel ID are required');
      }

      const currentImages = [...images];
      const optimisticImageUrls = currentImages.map((file) =>
        URL.createObjectURL(file),
      );
      const optimisticImages: ImageRes[] = optimisticImageUrls.map((src, i) => {
        const uuid =
          self.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
        const tempId = `temp-img-${i}-${uuid}`;

        return {
          id: tempId,
          isPlaceholder: true,
          createdAt: new Date().toISOString(),

          // TODO: Ensure image file isn't fetched from BE if its already cached
          src,
        };
      });

      const optimisticMessage: MessageRes = {
        id: `temp-${self.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`,
        body,
        user: me
          ? {
              id: me.id,
              name: me.name,
              profilePicture: me.profilePicture,
            }
          : null,
        userId: me?.id || null,
        botId: null,
        bot: null,
        createdAt: new Date().toISOString(),
        commandStatus: null,
        threadRootId: thread?.rootKind === 'message' ? thread.rootId : undefined,
        threadPollId: thread?.rootKind === 'poll' ? thread.rootId : undefined,
        parentMessageId:
          thread?.rootKind === 'message' ? thread.rootId : undefined,
        replyCount: 0,
        latestReplyAt: null,
        images: optimisticImages.length ? optimisticImages : undefined,
      };

      const optimisticFeedItem: FeedItemRes = {
        ...optimisticMessage,
        type: 'message',
      };

      if (forumPostId) {
        return {
          previousFeed: undefined,
          previousThread: undefined,
          optimisticImages,
        };
      }

      if (thread) {
        return {
          previousFeed: undefined,
          previousThread: undefined,
          optimisticImages,
        };
      }

      await queryClient.cancelQueries({
        queryKey: feedQueryKey,
      });

      const previousFeed = queryClient.getQueryData<FeedQuery>(feedQueryKey);

      queryClient.setQueryData<FeedQuery>(feedQueryKey, (oldData) => {
        if (!oldData) {
          return {
            pages: [{ feed: [optimisticFeedItem] }],
            pageParams: [null],
          };
        }

        const pages = oldData.pages.map((page, index) => {
          if (index === 0) {
            const sortedFeed = sortFeedByDate([
              optimisticFeedItem,
              ...page.feed,
            ]);
            return { ...page, feed: sortedFeed };
          }
          return page;
        });
        return { pages, pageParams: oldData.pageParams };
      });

      return {
        previousFeed,
        previousThread: undefined,
        optimisticImages,
      };
    },
    onSuccess: (message, _variables, context) => {
      if (!serverId || !channelId) {
        throw new Error('Server ID and channel ID are required');
      }
      const imagesWithSrc = message.images?.map((image, index) => {
        const optimisticImage = context?.optimisticImages?.[index];
        if (optimisticImage?.src && !image.src) {
          return { ...image, src: optimisticImage.src };
        }
        return image;
      });

      const newFeedItem: FeedItemRes = {
        ...message,
        images: imagesWithSrc || message.images,
        type: 'message',
      };

      if (thread) {
        queryClient.setQueryData<ThreadQuery>(threadQueryKey, (oldData) => {
          if (!oldData) {
            return oldData;
          }
          const alreadyExists = oldData.pages.some((page) =>
            page.replies.some((reply) => reply.id === message.id),
          );
          return {
            ...oldData,
            pages: oldData.pages.map((page, index) => {
              const withoutOptimistic = page.replies.filter(
                (reply) => !reply.id.startsWith('temp-'),
              );
              const existsOnPage = withoutOptimistic.some(
                (reply) => reply.id === message.id,
              );
              const replies = existsOnPage
                ? withoutOptimistic.map((reply) =>
                    reply.id === message.id
                      ? {
                          ...message,
                          images: imagesWithSrc || message.images,
                        }
                      : reply,
                  )
                : index === 0 && !alreadyExists
                  ? [
                      ...withoutOptimistic,
                      {
                        ...message,
                        images: imagesWithSrc || message.images,
                      },
                    ]
                  : withoutOptimistic;
              replies.sort(
                (left, right) =>
                  new Date(left.createdAt).getTime() -
                    new Date(right.createdAt).getTime() ||
                  left.id.localeCompare(right.id),
              );
              return { ...page, replies };
            }),
          };
        });
      } else if (forumPostId) {
        void queryClient.invalidateQueries({
          queryKey: ['servers', serverId, 'channels', channelId, 'forum'],
        });
      } else {
        queryClient.setQueryData<FeedQuery>(feedQueryKey, (oldData) => {
          if (!oldData) {
            return {
              pages: [{ feed: [newFeedItem] }],
              pageParams: [null],
            };
          }

          const pages = oldData.pages.map((page, index) => {
            if (index === 0) {
              const feedWithoutOptimistic = page.feed.filter(
                (item) =>
                  !(item.type === 'message' && item.id.startsWith('temp-')),
              );
              const alreadyExists = feedWithoutOptimistic.some(
                (item) => item.type === 'message' && item.id === message.id,
              );
              if (alreadyExists) {
                return {
                  ...page,
                  feed: feedWithoutOptimistic.map((item) =>
                    item.type === 'message' && item.id === message.id
                      ? newFeedItem
                      : item,
                  ),
                };
              }
              const sortedFeed = sortFeedByDate([
                newFeedItem,
                ...feedWithoutOptimistic,
              ]);
              return { ...page, feed: sortedFeed };
            }
            return page;
          });
          return { pages, pageParams: oldData.pageParams };
        });
      }

      setUploadProgress(undefined);
      if (images.length) {
        setImagesInputKey(Date.now());
        setImages([]);
      }

      localStorage.removeItem(draftKey);
      setValue('body', '');
      onSend?.();
      reset();
    },
    onError: (error: Error, _variables, context) => {
      setUploadProgress(undefined);
      if (context?.previousThread) {
        queryClient.setQueryData<ThreadQuery>(
          threadQueryKey,
          context.previousThread,
        );
      }
      if (context?.previousFeed) {
        queryClient.setQueryData<FeedQuery>(feedQueryKey, context.previousFeed);
      }

      handleError(error);
    },
  });

  // Focus on input when typing a message outside another text field
  useEffect(() => {
    if (!focusOnTyping) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
          activeElement.tagName === 'TEXTAREA')
      ) {
        return;
      }

      if (
        ['Space', 'Key', 'Digit', 'Slash'].some((key) =>
          e.code.includes(key),
        ) &&
        // Allow for Ctrl + C to copy
        e.code !== 'KeyC'
      ) {
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [focusOnTyping]);

  // Restore draft on page load
  useEffect(() => {
    const draft = localStorage.getItem(draftKey);
    if (draft && draft.trim() !== '') {
      setValue('body', draft);
    }
  }, [draftKey, setValue]);

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) {
      return;
    }

    // Chrome-based browsers support `field-sizing: content`, but Firefox/Zen do not.
    // Detect the feature once so we can fall back to manual resize logic only where needed
    if (
      typeof window !== 'undefined' &&
      typeof window.CSS !== 'undefined' &&
      typeof window.CSS.supports === 'function'
    ) {
      isFieldSizingSupportedRef.current = window.CSS.supports(
        'field-sizing',
        'content',
      );
    } else {
      isFieldSizingSupportedRef.current = false;
    }

    if (isFieldSizingSupportedRef.current) {
      textarea.style.removeProperty('overflow-y');
      textarea.style.removeProperty('height');
      return;
    }

    // In browsers without field-sizing support, keep the native scroll hidden and
    // mirror the auto-grow sizing as the user types. We listen for native `input`
    // events here to capture user edits
    const resizeTextarea = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    textarea.style.overflowY = 'hidden';
    textarea.addEventListener('input', resizeTextarea);

    return () => {
      textarea.removeEventListener('input', resizeTextarea);
    };
  }, []);

  const isDisabled = () => {
    if (disabled || isMessageSending) {
      return true;
    }
    return isEmpty;
  };

  const handleSendMessage = () => {
    if (disabled || isEmpty) {
      return;
    }
    if (!isLoggedIn) {
      if (!inviteToken && !isFirstUser) {
        toast(t('messages.prompts.inviteRequired'));
        return;
      }
      setIsAuthPromptOpen(true);
      return;
    }
    handleSubmit((values) => sendMessage(values))();
  };

  const handleInputKeyDown: KeyboardEventHandler = (e) => {
    if (e.code !== KeyCodes.Enter) {
      return;
    }
    if (e.shiftKey) {
      return;
    }
    e.preventDefault();
    handleSendMessage();
  };

  const handleRemoveSelectedImage = (imageName: string) => {
    setImages(images.filter((image) => image.name !== imageName));
    setImagesInputKey(Date.now());
  };

  return (
    <Form {...form}>
      <form className="flex w-full flex-col gap-2 overflow-y-auto border-t p-2 pt-2.5 pb-4">
        <div className="flex w-full items-center gap-2">
          {showActions && (
            <MessageFormMenu
              trigger={
                <MdAdd
                  className={cn(
                    'text-muted-foreground size-7 transition-transform duration-200',
                    isMessageSending && 'cursor-not-allowed opacity-50',
                    showMenu && 'rotate-45',
                  )}
                />
              }
              showMenu={showMenu}
              setShowMenu={setShowMenu}
              channelId={channelId}
              callId={callId}
              disabled={disabled || isMessageSending}
            />
          )}

          <div className="bg-input/30 flex w-full items-center rounded-3xl px-2">
            <FormField
              control={control}
              name="body"
              render={({ field }) => (
                <Textarea
                  {...field}
                  placeholder={t(
                    thread
                      ? 'messages.placeholders.sendThreadReply'
                      : 'messages.placeholders.sendMessage',
                  )}
                  className={cn(
                    'min-h-12 resize-none border-none bg-transparent py-3 shadow-none focus-visible:border-none focus-visible:ring-0 md:py-3.5 dark:bg-transparent',
                    isMessageSending && 'opacity-50',
                  )}
                  onKeyDown={handleInputKeyDown}
                  onChange={(e) => {
                    saveDraft(e.target.value);
                    field.onChange(e);
                  }}
                  disabled={disabled || isMessageSending}
                  ref={inputRef}
                  rows={1}
                />
              )}
            />

            <ImageInput
              key={imagesInputKey}
              setImages={setImages}
              disabled={disabled || isMessageSending}
              iconClassName="text-muted-foreground size-6 self-center"
              multiple
            />
          </div>

          <ChooseAuthDialog
            isOpen={isAuthPromptOpen}
            setIsOpen={setIsAuthPromptOpen}
            sendMessage={handleSubmit((values) => sendMessage(values))}
          />

          {!isEmpty ? (
            <Button
              onClick={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="bg-blurple-1 hover:bg-blurple-1 mx-0.5 size-10 rounded-full"
              disabled={isDisabled()}
            >
              <BiSolidSend className="ml-0.5 size-5 text-zinc-50" />
            </Button>
          ) : (
            <Button
              className="bg-input/30 hover:bg-input/40 size-11 rounded-full"
              disabled={disabled}
              onClick={(e) => {
                e.preventDefault();
                toast(t('prompts.inDev'));
              }}
            >
              <TbMicrophoneFilled className="text-muted-foreground size-5.5" />
            </Button>
          )}
        </div>

        {!!images.length && (
          <AttachedImagePreview
            handleRemove={handleRemoveSelectedImage}
            selectedImages={images}
            disabled={isMessageSending}
            isUploading={isMessageSending}
            uploadProgress={uploadProgress}
            className="ml-1.5"
          />
        )}
      </form>
    </Form>
  );
};
