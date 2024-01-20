import { useEffect, useState } from 'react';
import { Droppable as DNDDroppable, DroppableProps } from 'react-beautiful-dnd';

/**
 * A wrapper around react-beautiful-dnd's Droppable component that accounts
 * for strict mode's double render. This is only needed for development.
 *
 * Reference: https://github.com/atlassian/react-beautiful-dnd/issues/2399
 */
const Droppable = ({ children, ...props }: DroppableProps) => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const animation = requestAnimationFrame(() => setEnabled(true));

    return () => {
      cancelAnimationFrame(animation);
      setEnabled(false);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return <DNDDroppable {...props}>{children}</DNDDroppable>;
};

export default Droppable;
