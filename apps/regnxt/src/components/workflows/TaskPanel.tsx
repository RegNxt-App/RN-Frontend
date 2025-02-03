import React, {useCallback} from 'react';

import {TasksList} from './TasksList';

interface TaskPanelProps {
  className?: string;
}

export const TaskPanel: React.FC<TaskPanelProps> = ({className}) => {
  const handleDragStart = useCallback((event: React.DragEvent, nodeData: any) => {
    event.dataTransfer.setData('application/json', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  return (
    <div className={`w-64 overflow-y-auto ${className}`}>
      <h3 className="font-semibold mb-4">Available Tasks</h3>
      <TasksList onDragStart={handleDragStart} />
    </div>
  );
};
