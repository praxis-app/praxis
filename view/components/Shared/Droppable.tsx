import { useEffect, useState } from 'react';
import { Droppable as DNDDroppable, DroppableProps } from 'react-beautiful-dnd';

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
