import React from 'react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColumnDef } from "@tanstack/react-table";

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
  columnFilters: { id: string; value: string }[];
  setColumnFilters: (filters: { id: string; value: string }[]) => void;
  columns: ColumnDef<DataItem>[];
  frameworkFilter: string;
  setFrameworkFilter: (value: string) => void;
  frameworks: string[];
}

const ALL_FRAMEWORKS = "ALL";

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <Input
          placeholder="Search all fields..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <Select value={frameworkFilter} onValueChange={setFrameworkFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Framework" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_FRAMEWORKS}>All Frameworks</SelectItem>
            {frameworks.map((framework) => (
              <SelectItem key={framework} value={framework}>
                {framework}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {columns.map((column) => (
          <div key={column.id as string} className="flex flex-col">
            <label htmlFor={column.id as string} className="text-sm font-medium mb-1">
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