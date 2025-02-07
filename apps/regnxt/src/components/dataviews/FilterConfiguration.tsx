import {useEffect, useState} from 'react';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {PlusCircle, X} from 'lucide-react';

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

export function FilterConfiguration({config, updateConfig}: FilterConfigurationProps) {
  const [filters, setFilters] = useState<Filter[]>(config);

  useEffect(() => {
    if (JSON.stringify(filters) !== JSON.stringify(config)) {
      updateConfig(filters);
    }
  }, [filters, config, updateConfig]);

  const addFilter = () => {
    setFilters([...filters, {id: Date.now().toString(), field: '', operator: '', value: ''}]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((filter) => filter.id !== id));
  };

  const updateFilter = (id: string, field: string, value: string) => {
    setFilters(filters.map((filter) => (filter.id === id ? {...filter, [field]: value} : filter)));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Filter Configuration</h3>
      {filters.map((filter) => (
        <div
          key={filter.id}
          className="flex items-center space-x-4"
        >
          <Select onValueChange={(value) => updateFilter(filter.id, 'field', value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer_id">Customer ID</SelectItem>
              <SelectItem value="transaction_amount">Transaction Amount</SelectItem>
              <SelectItem value="transaction_date">Transaction Date</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => updateFilter(filter.id, 'operator', value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equals">=</SelectItem>
              <SelectItem value="not_equals">!=</SelectItem>
              <SelectItem value="greater_than">&gt;</SelectItem>
              <SelectItem value="less_than">&lt;</SelectItem>
              <SelectItem value="contains">Contains</SelectItem>
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
            size="icon"
            onClick={() => removeFilter(filter.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        className="w-full"
        onClick={addFilter}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Filter Condition
      </Button>
    </div>
  );
}
