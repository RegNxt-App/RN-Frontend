import React from 'react';

import {Task} from '@/types/databaseTypes';
import {ChevronDown, ChevronRight, Folder} from 'lucide-react';

import {SubtypeGroup} from './SubtypeGroup';

interface CategoryGroupProps {
  name: string;
  count: number;
  subtypes: Array<{
    subtype_id: number;
    label: string;
    tasks: Task[];
    count: number;
  }>;
  isExpanded: boolean;
  expandedSubtypes: string[];
  onToggle: () => void;
  onSubtypeToggle: (subtypeKey: string) => void;
  onTaskSelect: (task: Task) => void;
}

export const CategoryGroup: React.FC<CategoryGroupProps> = ({
  name,
  count,
  subtypes,
  isExpanded,
  expandedSubtypes,
  onToggle,
  onSubtypeToggle,
  onTaskSelect,
}) => (
  <div className="space-y-1">
    <div
      className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
      onClick={onToggle}
    >
      <div className="flex items-center">
        {isExpanded ? <ChevronDown className="w-4 h-4 mr-2" /> : <ChevronRight className="w-4 h-4 mr-2" />}
        <Folder className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">{name}</span>
      </div>
      <span className="text-sm text-gray-500">{count}</span>
    </div>

    {isExpanded && (
      <div className="ml-4 space-y-1">
        {subtypes.map((subtype) => (
          <SubtypeGroup
            key={subtype.subtype_id}
            subtype={subtype}
            categoryName={name}
            isExpanded={expandedSubtypes.includes(`${name}-${subtype.subtype_id}`)}
            onToggle={() => onSubtypeToggle(`${name}-${subtype.subtype_id}`)}
            onTaskSelect={onTaskSelect}
          />
        ))}
      </div>
    )}
  </div>
);
