import { cn } from '@/lib/shared.utils';
import { validateImageInput } from '@/lib/image.utilts';
import { type ServerReq, type ServerRes } from '@/types/server.types';
import { ServerErrorKeys } from '@/constants/server.constants';
import { serverFormSchema } from '@/types/server.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { ImageInput } from '../images/image-input';
import { ServerAvatar } from './server-avatar';
import { useEffect, useMemo, useState } from 'react';

interface Props {
  editServer?: ServerRes;
  isSubmitting: boolean;
  onSubmit: (data: ServerReq, image?: File) => Promise<ServerRes>;
  className?: string;
  showInstanceFields?: boolean;
}

export const ServerForm = ({
  editServer,
  isSubmitting,
  onSubmit,
  className,
  showInstanceFields = true,
}: Props) => {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<File>();
  const previewUrl = useMemo(
    () => (selectedImage ? URL.createObjectURL(selectedImage) : undefined),
    [selectedImage],
  );

  useEffect(
    () => () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    },
    [previewUrl],
  );

  const form = useForm<ServerReq>({
    resolver: zodResolver(serverFormSchema),
    defaultValues: {
      name: editServer?.name ?? '',
      slug: editServer?.slug ?? '',
      description: editServer?.description ?? '',
      isDefaultServer: editServer?.isDefaultServer ?? false,
    },
    mode: 'onChange',
  });

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  const handleSubmitForm = async (data: ServerReq) => {
    if (selectedImage) {
      validateImageInput(selectedImage);
    }
    const result = await onSubmit(data, selectedImage);
    setSelectedImage(undefined);

    if (editServer) {
      const nextValues = {
        name: result.name,
        slug: result.slug,
        description: result.description ?? '',
        isDefaultServer: result.isDefaultServer,
      };
      form.reset(nextValues);
      return;
    }

    form.reset({
      name: '',
      slug: '',
      description: '',
      isDefaultServer: false,
    });
  };

  const isSubmitDisabled = () => {
    if (isSubmitting) {
      return true;
    }
    if (editServer) {
      return !form.formState.isDirty && !selectedImage;
    }
    return false;
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((fv) => handleSubmitForm(fv))}
        className={cn('space-y-4', className)}
      >
        <div className="flex flex-col gap-2">
          <FormLabel>{t('servers.form.image')}</FormLabel>
          <div className="relative self-center">
            <ServerAvatar
              server={
                editServer ?? {
                  id: 'new-server',
                  name: form.watch('name'),
                }
              }
              imageSrc={previewUrl}
              className="size-28"
              fallbackClassName="text-2xl"
              fallback="icon"
            />
            <ImageInput
              onChange={(files) => setSelectedImage(files[0])}
              disabled={isSubmitting}
            >
              <button
                type="button"
                aria-label={t('servers.actions.selectImage')}
                disabled={isSubmitting}
                className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 text-sm text-white opacity-0 transition-opacity hover:bg-black/60 hover:opacity-100 focus-visible:opacity-100 disabled:opacity-50"
              >
                {editServer?.image || selectedImage
                  ? t('servers.actions.changeImage')
                  : t('servers.actions.selectImage')}
              </button>
            </ImageInput>
          </div>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('servers.form.name')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  autoComplete="off"
                  onChange={(e) => {
                    const value = e.target.value;
                    field.onChange(value);
                    if (
                      showInstanceFields &&
                      !form.getFieldState('slug').isDirty
                    ) {
                      form.setValue('slug', slugify(value));
                    }
                  }}
                />
              </FormControl>
              <FormMessage
                errorOverrides={{
                  [ServerErrorKeys.NameLength]: t('servers.errors.nameLength'),
                }}
              />
            </FormItem>
          )}
        />

        {showInstanceFields && (
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('servers.form.slug')}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="off"
                    onChange={(e) => {
                      const value = slugify(e.target.value);
                      field.onChange(value);
                    }}
                  />
                </FormControl>
                <FormMessage
                  errorOverrides={{
                    [ServerErrorKeys.SlugLength]: t(
                      'servers.errors.slugLength',
                    ),
                    [ServerErrorKeys.SlugInvalid]: t(
                      'servers.errors.invalidSlug',
                    ),
                  }}
                />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className="mb-5">
              <FormLabel>{t('servers.form.description')}</FormLabel>
              <FormControl>
                <Textarea {...field} rows={3} />
              </FormControl>
              <FormMessage
                errorOverrides={{
                  [ServerErrorKeys.DescriptionLength]: t(
                    'servers.errors.descriptionLength',
                  ),
                }}
              />
            </FormItem>
          )}
        />

        {showInstanceFields && (
          <FormField
            control={form.control}
            name="isDefaultServer"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>{t('servers.form.defaultServer')}</FormLabel>
                  <FormDescription>
                    {t('servers.form.defaultServerDescription')}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={!!field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                    aria-label={t('servers.form.defaultServer')}
                    disabled={editServer?.isDefaultServer}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitDisabled()} className="w-22">
            {editServer ? t('actions.save') : t('actions.create')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
