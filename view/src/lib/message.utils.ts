import { t } from '@/lib/shared.utils';
import copy from 'copy-to-clipboard';
import { toast } from 'sonner';

export const copyMessageText = (body: string) => {
  copy(body);
  toast(t('messages.prompts.textCopied'));
};
