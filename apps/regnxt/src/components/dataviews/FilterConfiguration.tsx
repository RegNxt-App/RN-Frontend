import {useEffect, useState} from 'react';

import {useDataView} from '@/hooks/api/use-dataview';
import {PlusCircle, X} from 'lucide-react';

import {Button} from '@rn/ui/components/ui/button';
import {Input} from '@rn/ui/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';

interface Filter {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface FilterConfigurationProps {
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

export function FilterConfiguration({config, updateConfig}: FilterConfigurationProps) {
  const {fields = []} = useDataView();
  const [filters, setFilters] = useState<Filter[]>(config);

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

  // Safely transform fields into options with null checking
  const fieldOptions = (fields || []).map((field) => ({
    value: `${field.table || ''}.${field.name || ''}`,
    label: `${field.table || ''} - ${field.label || field.name || ''}`,
    type: field.type || '',
  }));

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
