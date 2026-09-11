import { MessageForm } from '@/components/messages/message-form';
import { useAuthStore } from '@/store/auth.store';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({}),
}));

vi.mock('@/store/auth.store');
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/lib/shared.utils', () => ({
  throttle: vi.fn((fn) => fn),
  debounce: vi.fn((fn) => Object.assign(fn, { clear: vi.fn() })),
  cn: vi.fn((...args) => args.join(' ')),
  t: vi.fn((key) => key),
}));
vi.mock('@tanstack/react-query', async () => {
  const original = await vi.importActual('@tanstack/react-query');
  return {
    ...original,
    useQueryClient: () => ({
      setQueryData: vi.fn(),
    }),
    useQuery: vi.fn(() => ({ data: null, isPending: false })),
    useMutation: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  };
});

describe('MessageForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuthStore as unknown as Mock).mockClear();
  });

  it('should show an image preview when an image is selected', () => {
    (useAuthStore as unknown as Mock).mockReturnValue({
      isLoggedIn: true,
    });

    render(<MessageForm channelId="1" />);

    const fileInput = screen.getByTestId('image-input');
    const file = new File(['image1'], 'test1.png', { type: 'image/png' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    const imagePreview = screen.getByTestId('attached-image-preview');
    expect(imagePreview).toBeInTheDocument();
  });
});
