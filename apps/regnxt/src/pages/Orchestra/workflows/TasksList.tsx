import React from 'react';

import {Card} from '@/components/ui/card';
import {Task} from '@/types/databaseTypes';

const DUMMY_TASKS: Task[] = [
  {
    task_id: 1,
    task_code: 'file/load_json',
    task_type_id: 1,
    label: 'Load interest rates from external source',
    task_language: null,
    upstream_tasks: null,
  },
  {
    task_id: 2,
    task_code: 'hello_1',
    task_type_id: 2,
    label: 'hello_1',
    task_language: 'python',
    upstream_tasks: 1,
  },
  {
    task_id: 3,
    task_code: 'file/load_csv',
    task_type_id: 1,
    label: 'Load accounting movements from a file',
    task_language: null,
    upstream_tasks: 10,
  },
];

interface TasksListProps {
  onDragStart: (event: React.DragEvent, nodeData: any) => void;
}

export const TasksList: React.FC<TasksListProps> = ({onDragStart}) => {
  return (
    <div className="space-y-2">
      {DUMMY_TASKS.map((task) => (
        <Card
          key={task.task_id}
          draggable
          onDragStart={(e) => onDragStart(e, task)}
          className="p-3 cursor-move hover:bg-gray-50"
        >
          <div className="flex items-center space-x-2">
            <div className="flex-1">
              <div className="text-sm font-medium">{task.label}</div>
              <div className="text-xs text-gray-500">Type: {task.task_type_id}</div>
              {task.task_language && (
                <div className="text-xs text-gray-500">Language: {task.task_language}</div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
