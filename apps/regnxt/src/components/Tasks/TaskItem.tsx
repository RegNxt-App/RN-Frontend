import React from 'react';

import {Task} from '@/types/databaseTypes';
import {FileText} from 'lucide-react';

import {Badge} from '@rn/ui/components/ui/badge';

interface TaskItemProps {
  task: Task;
  onClick: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({task, onClick}) => (
  <div
    className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
    onClick={() => onClick(task)}
  >
    <div className="flex items-center justify-between w-full">
      <div className="flex items-start min-w-0 flex-1 mr-2">
        <FileText className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1 max-w-[calc(100%-70px)]">
          <div className="text-sm truncate lg:max-w-[150px] xl:max-w-[180px] 2xl:max-w-none">
            {task.label.split(' ').slice(0, 2).join(' ')}
            {task.label.split(' ').length > 2 && '...'}
          </div>
          <div className="text-xs text-gray-500 truncate">{task.code}</div>
        </div>
      </div>
      {task.is_predefined && (
        <Badge
          variant="outline"
          className="text-xs flex-shrink-0 ml-2 whitespace-nowrap min-w-[80px] text-center"
        >
          Predefined
        </Badge>
      )}
    </div>
  </div>
);
