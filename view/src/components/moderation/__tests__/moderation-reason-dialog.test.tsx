import { ModerationReasonDialog } from '@/components/moderation/moderation-reason-dialog';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const renderDialog = (props: { isReasonRequired?: boolean }) => {
  const onConfirm = vi.fn();
  render(
    <ModerationReasonDialog
      open
      onOpenChange={vi.fn()}
      title="Suspend this account?"
      description="member"
      confirmLabel="Suspend"
      isPending={false}
      onConfirm={onConfirm}
      {...props}
    />,
  );
  return onConfirm;
};

describe('ModerationReasonDialog', () => {
  it('should hold confirmation until a required reason is long enough', () => {
    const onConfirm = renderDialog({ isReasonRequired: true });
    const confirm = screen.getByRole('button', { name: 'Suspend' });

    expect(confirm).toBeDisabled();
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'abc' } });
    expect(confirm).toBeDisabled();
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Repeated harassment' },
    });
    fireEvent.click(confirm);

    expect(onConfirm).toHaveBeenCalledWith('Repeated harassment');
  });

  it('should confirm without a reason when one is optional', () => {
    const onConfirm = renderDialog({});
    fireEvent.click(screen.getByRole('button', { name: 'Suspend' }));

    expect(onConfirm).toHaveBeenCalledWith(undefined);
  });
});
