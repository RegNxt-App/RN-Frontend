import React from 'react';

import {Search} from 'lucide-react';

import {Input} from '@rn/ui/components/ui/input';

interface VariableSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export const VariableSearch: React.FC<VariableSearchProps> = ({value, onChange}) => (
  <div className="relative">
    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
    <Input
      placeholder="Search variables"
      className="pl-8"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);
