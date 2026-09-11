// Ref: https://ui.shadcn.com/docs/components/avatar

import { cn } from '@/lib/shared.utils';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn('relative flex h-10 w-10 shrink-0 rounded-full', className)}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn('aspect-square h-full w-full rounded-full', className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      'bg-muted flex h-full w-full items-center justify-center rounded-full',
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

const avatarBadgeVariants = cva(
  'absolute w-3 h-3 rounded-full bg-background flex items-stretch justify-stretch [&>*]:grow [&>*]:rounded-full',
  {
    variants: {
      position: {
        bottomLeft: 'bottom-0 -left-1',
        bottomRight: '-bottom-1 -right-1',
        topLeft: 'top-0 -left-1',
        topRight: 'top-0 -right-1',
      },
    },
    defaultVariants: {
      position: 'bottomLeft',
    },
  },
);

export interface AvatarBadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarBadgeVariants> {
  children?:
    | React.ReactElement<unknown, string | React.JSXElementConstructor<unknown>>
    | null
    | never[];
}

const AvatarBadge = ({ className, position, ...props }: AvatarBadgeProps) => (
  <div
    className={cn(avatarBadgeVariants({ position }), className)}
    {...props}
  />
);
AvatarBadge.displayName = 'AvatarBadge';

export { Avatar, AvatarBadge, AvatarFallback, AvatarImage };
