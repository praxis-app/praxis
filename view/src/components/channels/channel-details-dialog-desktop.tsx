import { type ChannelRes } from '@/types/channel.types';
import { type ReactNode } from 'react';
import { MdTag } from 'react-icons/md';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface Props {
  channel: ChannelRes;
  trigger: ReactNode;
}

export const ChannelDetailsDialogDesktop = ({ channel, trigger }: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-0.5">
            <MdTag className="text-muted-foreground m-1 mr-[0.3rem] size-7" />
            <div className="text-[1rem] tracking-[0.015rem]">
              {channel.name}
            </div>
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-primary min-w-100">
          {channel.description}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
