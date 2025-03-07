import {useEffect, useState} from 'react';

import {useDataView} from '@/hooks/api/use-dataview';
import {Loader2, PlusCircle, X} from 'lucide-react';

import {Alert, AlertDescription} from '@rn/ui/components/ui/alert';
import {Button} from '@rn/ui/components/ui/button';
import {Input} from '@rn/ui/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';

interface SelectedObject {
  id: string;
  name: string;
  type: string;
  version: {
    id: number;
    number: number;
  };
}

interface Filter {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface FilterConfigurationProps {
  selectedObjects: SelectedObject[];
  config: Filter[];
  updateConfig: (filters: Filter[]) => void;
}

const OPERATORS = [
  {value: 'equals', label: '='},
  {value: 'not_equals', label: '!='},
  {value: 'greater_than', label: '>'},
  {value: 'less_than', label: '<'},
  {value: 'greater_equals', label: '>='},
  {value: 'less_equals', label: '<='},
  {value: 'like', label: 'Contains'},
  {value: 'in', label: 'In'},
  {value: 'not_in', label: 'Not In'},
];

export function FilterConfiguration({selectedObjects, config, updateConfig}: FilterConfigurationProps) {
  const [filters, setFilters] = useState<Filter[]>(config);
  const {useObjectColumns} = useDataView();

  // Fetch columns data using the updated hook
  const {
    data: columnsData,
    isLoading: isLoadingColumns,
    error: columnsError,
  } = useObjectColumns(selectedObjects.filter((obj) => obj.version?.id));

  useEffect(() => {
    if (JSON.stringify(filters) !== JSON.stringify(config)) {
      updateConfig(filters);
    }
  }, [filters, config, updateConfig]);

  const addFilter = () => {
    setFilters([
      ...filters,
      {
        id: `filter_${Date.now()}`,
        field: '',
        operator: '',
        value: '',
      },
    ]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((filter) => filter.id !== id));
  };

  const updateFilter = (id: string, field: keyof Filter, value: string) => {
    setFilters(filters.map((filter) => (filter.id === id ? {...filter, [field]: value} : filter)));
  };

  // Transform the column data into field options
  const fieldOptions =
    columnsData?.flatMap((table) =>
      table.columns.map((column) => ({
        value: `${table.name}.${column.name}`,
        label: `${table.name} - ${column.label}`,
        type: column.type,
      }))
    ) || [];

  // Loading state
  if (isLoadingColumns) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (columnsError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load columns. Please try again.</AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (!selectedObjects.length) {
    return (
      <Alert>
        <AlertDescription>Please select objects to configure filters</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {filters.map((filter) => (
          <div
            key={filter.id}
            className="flex items-center space-x-4"
          >
            <Select
              value={filter.field}
              onValueChange={(value) => updateFilter(filter.id, 'field', value)}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {fieldOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filter.operator}
              onValueChange={(value) => updateFilter(filter.id, 'operator', value)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Operator" />
              </SelectTrigger>
              <SelectContent>
                {OPERATORS.map((op) => (
                  <SelectItem
                    key={op.value}
                    value={op.value}
                  >
                    {op.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Enter value"
              className="w-[200px]"
              value={filter.value}
              onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeFilter(filter.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addFilter}
        className="w-full"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Filter
      </Button>
    </div>
  );
}
