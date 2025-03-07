import React from 'react';

import {Task} from '@/types/databaseTypes';
import {ChevronDown, ChevronRight, FolderOpen} from 'lucide-react';

import {TaskItem} from './TaskItem';

interface SubtypeGroupProps {
  subtype: {
    subtype_id: number;
    label: string;
    tasks: Task[];
    count: number;
  };
  isExpanded: boolean;
  onToggle: () => void;
  onTaskSelect: (task: Task) => void;
}

export const SubtypeGroup: React.FC<SubtypeGroupProps> = ({subtype, isExpanded, onToggle, onTaskSelect}) => (
  <div className="space-y-1">
    <div
      className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-center">
        {isExpanded ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
        <FolderOpen className="w-4 h-4 mr-2" />
        <span className="text-sm">{subtype.label}</span>
      </div>
      <span className="text-sm text-gray-500">{subtype.count}</span>
    </div>

    {isExpanded && (
      <div className="ml-4 space-y-1">
        {subtype.tasks.map((task) => (
          <TaskItem
            key={task.task_id}
            task={task}
            onClick={onTaskSelect}
          />
        ))}
      </div>
    )}
  </div>
);
