import React from 'react';

import {Input} from '@rn/ui/components/ui/input';

interface SharedColumnFiltersProps {
  filters: {
    code: string;
    label: string;
    type: string;
    description: string;
    group: string;
  };
  setFilter: (key: string, value: string) => void;
}

export const SharedColumnFilters: React.FC<SharedColumnFiltersProps> = ({filters, setFilter}) => {
  return (
    <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      <Input
        placeholder="Filter group"
        value={filters.group}
        onChange={(e) => setFilter('group', e.target.value)}
        className="max-w-sm"
      />
      <Input
        placeholder="Filter code"
        value={filters.code}
        onChange={(e) => setFilter('code', e.target.value)}
        className="max-w-sm"
      />
      <Input
        placeholder="Filter label"
        value={filters.label}
        onChange={(e) => setFilter('label', e.target.value)}
        className="max-w-sm"
      />
      <Input
        placeholder="Filter description"
        value={filters.description}
        onChange={(e) => setFilter('description', e.target.value)}
        className="max-w-sm"
      />
    </div>
  );
};
