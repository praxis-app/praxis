import React, {
  type ComponentProps,
  type ElementType,
  type ReactNode,
} from 'react';

interface BoxProps extends ComponentProps<ElementType> {
  children: ReactNode;
  as?: ElementType;
}

export const Box = React.forwardRef<HTMLElement, BoxProps>(
  ({ children, as: Component = 'div', ...props }, ref) => {
    return (
      <Component ref={ref} {...props}>
        {children}
      </Component>
    );
  },
);

Box.displayName = 'Box';
