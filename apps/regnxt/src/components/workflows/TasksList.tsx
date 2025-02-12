import React, {memo} from 'react';

import {Card} from '@/components/ui/card';
import {Task} from '@/types/databaseTypes';

import {Badge} from '@rn/ui/components/ui/badge';

interface TasksListProps {
  tasks: Task[];
  onDragStart: (event: React.DragEvent, nodeData: any) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const TaskItem = memo(({task, onDragStart}: {task: Task; onDragStart: TasksListProps['onDragStart']}) => (
  <Card
    draggable
    onDragStart={(e) => onDragStart(e, task)}
    className="p-3 cursor-move hover:bg-gray-50"
  >
    <div className="flex items-center space-x-2">
      <div className="flex-1">
        <div className="text-sm font-medium mb-2">{task.label}</div>
        <div className="text-xs text-gray-500 flex space-x-2">
          <Badge variant="secondary">{task.task_type_label}</Badge>
          {task.task_language && <Badge>{task.task_language}</Badge>}
        </div>
      </div>
    </div>
  </Card>
));

export const TasksList: React.FC<TasksListProps> = memo(
  ({tasks, onDragStart, currentPage, totalPages, onPageChange}) => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskItem
              key={task.task_id}
              task={task}
              onDragStart={onDragStart}
            />
          ))}
        </div>
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4 text-sm">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="text-blue-600 disabled:text-gray-400"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="text-blue-600 disabled:text-gray-400"
            >
              Next
            </button>
          </div>
        )}
      </div>
    );
  }
);
