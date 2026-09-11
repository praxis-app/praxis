import { api } from '@/client/api-client';
import { getActiveDecisionsQueryKey } from '@/components/decisions/decisions-panel.utils';
import { Button } from '@/components/ui/button';
import { ImageInput } from '@/components/images/image-input';
import { AttachedImagePreview } from '@/components/images/attached-image-preview';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useServerData } from '@/hooks/use-server-data';
import { handleError } from '@/lib/error.utils';
import { validateImageInput } from '@/lib/image.utilts';
import { type CallDecisionRes } from '@/types/call.types';
import { type FeedItemRes, type FeedQuery } from '@/types/channel.types';
import { type CreatePollReq } from '@/types/poll.types';
import { VotingTimeLimit } from '@/constants/vote.constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { LuPlus, LuX } from 'react-icons/lu';
import { MdImage } from 'react-icons/md';
import * as z from 'zod';

const MIN_OPTIONS = 2;

const createPollFormSchema = z.object({
  body: z.string().min(1, 'polls.errors.questionRequired'),
  options: z
    .array(
      z.object({ value: z.string().min(1, 'polls.errors.answerRequired') }),
    )
    .min(MIN_OPTIONS, 'polls.errors.minAnswersRequired'),
  closingAt: z.number().optional(),
  allowMultipleAnswers: z.boolean(),
  images: z.array(z.instanceof(File)),
});

type CreatePollFormSchema = z.infer<typeof createPollFormSchema>;

interface Props {
  channelId?: string;
  callId?: string;
  onSuccess: () => void;
}

export const CreatePollForm = ({ channelId, callId, onSuccess }: Props) => {
  const { t } = useTranslation();
  const { serverId } = useServerData();
  const queryClient = useQueryClient();

  const form = useForm<CreatePollFormSchema>({
    resolver: zodResolver(createPollFormSchema),
    defaultValues: {
      body: '',
      options: [{ value: '' }, { value: '' }],
      closingAt: VotingTimeLimit.OneDay,
      allowMultipleAnswers: false,
      images: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'options',
  });

  const { mutate: createPoll, isPending } = useMutation({
    mutationFn: async (values: CreatePollFormSchema) => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      if (!channelId) {
        throw new Error('Channel ID is required');
      }

      const closingAt =
        values.closingAt && values.closingAt !== VotingTimeLimit.Unlimited
          ? new Date(Date.now() + values.closingAt * 60 * 1000).toISOString()
          : undefined;

      const request: CreatePollReq = {
        body: values.body.trim(),
        pollType: 'poll',
        options: values.options.map((option) => option.value.trim()),
        multipleChoice: values.allowMultipleAnswers,
        closingAt,
      };

      validateImageInput(values.images);

      return callId
        ? api.createCallPoll(
            serverId,
            channelId,
            callId,
            request,
            values.images,
          )
        : api.createPoll(serverId, channelId, request, values.images);
    },
    onSuccess: ({ poll }, values) => {
      if (!channelId || !serverId) {
        return;
      }
      poll.images.forEach((image, index) => {
        image.src = URL.createObjectURL(values.images[index]);
      });

      const channelFeedQueryKey = [
        'servers',
        serverId,
        'channels',
        channelId,
        'feed',
      ];

      queryClient.setQueryData<FeedQuery>(channelFeedQueryKey, (old) => {
        const newItem: FeedItemRes = {
          ...poll,
          type: 'poll',
        };
        if (!old) {
          return {
            pages: [{ feed: [newItem] }],
            pageParams: [null],
          };
        }
        const pages = old.pages.map((page, idx) => {
          if (idx !== 0) {
            return page;
          }
          const exists = page.feed.some(
            (fi) => fi.type === 'poll' && fi.id === poll.id,
          );
          if (exists) {
            return page;
          }
          return { ...page, feed: [newItem, ...page.feed] };
        });
        return { pages, pageParams: old.pageParams };
      });
      void queryClient.invalidateQueries({
        queryKey: getActiveDecisionsQueryKey(serverId),
      });

      if (callId) {
        queryClient.setQueryData<CallDecisionRes>(
          [
            'servers',
            serverId,
            'channels',
            channelId,
            'calls',
            callId,
            'decisions',
          ],
          (old) => ({
            activeItem: poll,
            recentResult: old?.recentResult ?? null,
          }),
        );
      }

      onSuccess();
    },
    onError: (error: Error) => {
      handleError(error);
    },
  });

  const handleAddOption = () => {
    append({ value: '' });
  };

  const handleRemoveOption = (index: number) => {
    if (fields.length > MIN_OPTIONS) {
      remove(index);
    }
  };

  const handleSubmit = () => {
    form.handleSubmit((values) => createPoll(values))();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('polls.labels.question')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('polls.placeholders.question')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-0.5">
          <div className="space-y-3">
            <FormLabel>{t('polls.labels.answers')}</FormLabel>
            {fields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`options.${index}.value`}
                render={({ field: inputField }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          placeholder={t('polls.placeholders.answer', {
                            number: index + 1,
                          })}
                          {...inputField}
                        />
                      </FormControl>
                      {fields.length > MIN_OPTIONS && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOption(index)}
                          className="shrink-0"
                        >
                          <LuX className="size-4" />
                        </Button>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleAddOption}
              className="mt-2"
            >
              <LuPlus className="mr-1 size-4" />
              {t('polls.actions.addAnswer')}
            </Button>
          </div>

          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                {field.value.length > 0 && (
                  <FormLabel className="mt-2">
                    {t('images.labels.attachedImages')}
                  </FormLabel>
                )}
                <AttachedImagePreview
                  selectedImages={field.value}
                  handleRemove={(name) =>
                    field.onChange(
                      field.value.filter((image) => image.name !== name),
                    )
                  }
                />
                <ImageInput
                  multiple
                  onChange={(images) => {
                    try {
                      validateImageInput(images);
                      field.onChange(images);
                      form.clearErrors('images');
                    } catch (error) {
                      form.setError('images', {
                        message:
                          error instanceof Error
                            ? error.message
                            : 'Invalid image.',
                      });
                    }
                  }}
                >
                  <Button type="button" variant="ghost" size="sm">
                    <MdImage className="size-5" />
                    {t('images.labels.attachImages')}
                  </Button>
                </ImageInput>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="closingAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('polls.labels.duration')}</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t('polls.placeholders.duration')}
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={VotingTimeLimit.HalfHour.toString()}>
                    {t('time.minutesFull', { count: 30 })}
                  </SelectItem>
                  <SelectItem value={VotingTimeLimit.OneHour.toString()}>
                    {t('time.hoursFull', { count: 1 })}
                  </SelectItem>
                  <SelectItem value={VotingTimeLimit.HalfDay.toString()}>
                    {t('time.hoursFull', { count: 12 })}
                  </SelectItem>
                  <SelectItem value={VotingTimeLimit.OneDay.toString()}>
                    {t('time.daysFull', { count: 1 })}
                  </SelectItem>
                  <SelectItem value={VotingTimeLimit.ThreeDays.toString()}>
                    {t('time.daysFull', { count: 3 })}
                  </SelectItem>
                  <SelectItem value={VotingTimeLimit.OneWeek.toString()}>
                    {t('time.weeks', { count: 1 })}
                  </SelectItem>
                  <SelectItem value={VotingTimeLimit.TwoWeeks.toString()}>
                    {t('time.weeks', { count: 2 })}
                  </SelectItem>
                  <SelectItem value={VotingTimeLimit.Unlimited.toString()}>
                    {t('time.unlimited')}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between">
          <FormField
            control={form.control}
            name="allowMultipleAnswers"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel className="cursor-pointer font-normal">
                  {t('polls.labels.allowMultipleAnswers')}
                </FormLabel>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending}>
            {t('polls.actions.createPoll')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export type { CreatePollFormSchema };
