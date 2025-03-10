import React from 'react';

import {Search} from 'lucide-react';

import {Input} from '@rn/ui/components/ui/input';

interface WorkflowSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const WorkflowSearch: React.FC<WorkflowSearchProps> = ({value, onChange}) => (
  <div className="relative">
    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
    <Input
      placeholder="Search workflows"
      className="pl-8"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);
