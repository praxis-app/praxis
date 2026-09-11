import { ResizableHandle } from '@/components/ui/resizable';

interface Props {
  label: string;
}

export const ResizablePanelHandle = ({ label }: Props) => (
  <ResizableHandle
    aria-label={label}
    className="before:bg-border cursor-col-resize bg-transparent before:absolute before:inset-y-0 before:left-1/2 before:w-px before:-translate-x-1/2 before:transition-[width] before:duration-150 before:ease-out hover:before:w-0.75 focus-visible:before:w-0.75 data-[separator=active]:before:w-0.75 motion-reduce:before:transition-none"
  />
);
