import React from 'react';

import {ColumnDef} from '@tanstack/react-table';

import {Input} from '@rn/ui/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';

interface DataItem {
  dataSetId: number;
  category: string;
  businessId: string;
  code: string;
  name: string;
  description: string;
  maintenanceAgency: string;
  frameworkCode: string;
  version: string;
  entityType: string;
}

interface SharedDataFilterProps {
  globalFilter: string;
  setGlobalFilter: (value: string) => void;
  columnFilters: {id: string; value: string}[];
  setColumnFilters: (filters: {id: string; value: string}[]) => void;
  columns: ColumnDef<DataItem>[];
  frameworkFilter: string;
  setFrameworkFilter: (value: string) => void;
  frameworks: string[];
}

const ALL_FRAMEWORKS = 'ALL';

export const SharedDataFilter: React.FC<SharedDataFilterProps> = ({
  globalFilter,
  setGlobalFilter,
  columnFilters,
  setColumnFilters,
  columns,
  frameworkFilter,
  setFrameworkFilter,
  frameworks,
}) => {
  return (
    <div className="space-y-4">
      <div className="mb-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <Input
          placeholder="Search all fields..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <Select
          value={frameworkFilter}
          onValueChange={setFrameworkFilter}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Framework" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FRAMEWORKS}>All Frameworks</SelectItem>
            {frameworks.map((framework) => (
              <SelectItem
                key={framework}
                value={framework}
              >
                {framework}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {columns.map((column) => (
          <div
            key={column.id as string}
            className="flex flex-col"
          >
            <label
              htmlFor={column.id as string}
              className="mb-1 text-sm font-medium"
            >
              {column.header as string}
            </label>
            <Input
              id={column.id as string}
              placeholder={`Filter ${column.header as string}...`}
              value={(columnFilters.find((filter) => filter.id === column.id)?.value as string) ?? ''}
              onChange={(event) =>
                setColumnFilters(
                  columnFilters
                    .filter((f) => f.id !== column.id)
                    .concat({
                      id: column.id as string,
                      value: event.target.value,
                    })
                )
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};
