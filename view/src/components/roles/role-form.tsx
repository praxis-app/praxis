import { ColorPicker } from '@/components/shared/color-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ROLE_COLOR_OPTIONS } from '@/constants/role.constants';
import { type CreateRoleReq } from '@/types/role.types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface BaseRole {
  name: string;
  color: string;
}

interface Props<TRole extends BaseRole> {
  editRole?: TRole;
  isSubmitting: boolean;
  onSubmit: (data: CreateRoleReq) => Promise<TRole | void>;
}

export const RoleForm = <TRole extends BaseRole>({
  editRole,
  isSubmitting,
  onSubmit,
}: Props<TRole>) => {
  const [colorPickerKey, setColorPickerKey] = useState(0);

  const { t } = useTranslation();

  const { handleSubmit, register, setValue, watch, reset, formState } =
    useForm<CreateRoleReq>({
      defaultValues: {
        color: editRole?.color || ROLE_COLOR_OPTIONS[0],
        name: editRole?.name || '',
      },
      mode: 'onChange',
    });

  const unsavedColorChange = () => {
    if (!editRole) {
      return false;
    }
    return editRole.color !== watch('color');
  };

  const isSubmitButtonDisabled = () => {
    if (isSubmitting) {
      return true;
    }
    if (unsavedColorChange()) {
      return false;
    }
    return !formState.isDirty;
  };

  const handleSubmitForm = async (data: CreateRoleReq) => {
    const result = await onSubmit(data);

    setColorPickerKey(Date.now());
    if (editRole) {
      reset((result as TRole | undefined) ?? { ...editRole, ...data });
      return;
    }
    reset();
  };

  return (
    <Card className="mb-3">
      <CardContent>
        <form onSubmit={handleSubmit((fv) => handleSubmitForm(fv))}>
          <div className="grid gap-2">
            <div className="grid gap-2">
              <Label className="text-md text-muted-foreground font-normal">
                {t('roles.form.name')}
              </Label>
              <Input autoComplete="off" {...register('name')} />
            </div>

            <ColorPicker
              color={watch('color')}
              key={colorPickerKey}
              label={t('roles.form.colorPickerLabel')}
              onChange={(color) => setValue('color', color)}
            />
          </div>

          <div className="flex justify-end">
            <Button
              className="mt-4"
              disabled={isSubmitButtonDisabled()}
              type="submit"
            >
              {editRole ? t('actions.save') : t('actions.create')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
