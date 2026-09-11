import { AttachedImagePreview } from '@/components/images/attached-image-preview';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/lib/shared.utils', () => ({
  cn: vi.fn((...args) => args.filter(Boolean).join(' ')),
}));

const image = new File(['image'], 'test.png', { type: 'image/png' });

describe('AttachedImagePreview', () => {
  it('should show upload progress while an image is uploading', () => {
    render(
      <AttachedImagePreview
        selectedImages={[image]}
        isUploading
        uploadProgress={0.42}
      />,
    );

    const progress = screen
      .getByTestId('image-upload-overlay')
      .querySelector('[role="progressbar"]');
    expect(progress).toHaveAttribute('aria-valuenow', '42');
    expect(progress?.firstElementChild).toHaveStyle({
      transform: 'translateX(-58%)',
    });
  });

  it('should fill the bar once the bytes have been sent', () => {
    render(
      <AttachedImagePreview
        selectedImages={[image]}
        isUploading
        uploadProgress={1}
      />,
    );

    const progress = screen
      .getByTestId('image-upload-overlay')
      .querySelector('[role="progressbar"]');
    expect(progress).not.toHaveAttribute('aria-valuenow');
    expect(progress?.firstElementChild).toHaveStyle({
      transform: 'translateX(-0%)',
    });
  });

  it('should hide the remove button while uploading', () => {
    const { rerender } = render(
      <AttachedImagePreview selectedImages={[image]} handleRemove={vi.fn()} />,
    );
    expect(
      screen.getByLabelText('images.labels.removeImage'),
    ).toBeInTheDocument();

    rerender(
      <AttachedImagePreview
        selectedImages={[image]}
        handleRemove={vi.fn()}
        isUploading
      />,
    );
    expect(
      screen.queryByLabelText('images.labels.removeImage'),
    ).not.toBeInTheDocument();
  });

  it('should not show an overlay when no upload is in flight', () => {
    render(<AttachedImagePreview selectedImages={[image]} />);
    expect(
      screen.queryByTestId('image-upload-overlay'),
    ).not.toBeInTheDocument();
  });
});
