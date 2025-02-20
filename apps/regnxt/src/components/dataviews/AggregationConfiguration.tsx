import {useEffect, useState} from 'react';

import {useDataView} from '@/hooks/api/use-dataview';
import {PlusCircle, X} from 'lucide-react';

import {Button} from '@rn/ui/components/ui/button';
import {Input} from '@rn/ui/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';

interface Aggregation {
  id: string;
  function: string;
  field: string;
  alias: string;
}

interface AggregationConfigurationProps {
  config: Aggregation[];
  updateConfig: (aggregations: Aggregation[]) => void;
}

const AGGREGATION_FUNCTIONS = [
  {value: 'sum', label: 'Sum'},
  {value: 'avg', label: 'Average'},
  {value: 'min', label: 'Minimum'},
  {value: 'max', label: 'Maximum'},
  {value: 'count', label: 'Count'},
  {value: 'count_distinct', label: 'Count Distinct'},
];

export function AggregationConfiguration({config, updateConfig}: AggregationConfigurationProps) {
  const {fields} = useDataView();
  const [aggregations, setAggregations] = useState<Aggregation[]>(config);

  useEffect(() => {
    if (JSON.stringify(aggregations) !== JSON.stringify(config)) {
      updateConfig(aggregations);
    }
  }, [aggregations, config, updateConfig]);

  const addAggregation = () => {
    setAggregations([
      ...aggregations,
      {
        id: `agg_${Date.now()}`,
        function: '',
        field: '',
        alias: '',
      },
    ]);
  };

  const removeAggregation = (id: string) => {
    setAggregations(aggregations.filter((agg) => agg.id !== id));
  };

  const updateAggregation = (id: string, field: keyof Aggregation, value: string) => {
    setAggregations(aggregations.map((agg) => (agg.id === id ? {...agg, [field]: value} : agg)));
  };

  // Filter numeric fields for aggregation
  const numericFields = fields
    .filter((field) => ['number', 'integer', 'decimal', 'monetary'].includes(field.type.toLowerCase()))
    .map((field) => ({
      value: `${field.table}.${field.name}`,
      label: `${field.table} - ${field.label || field.name}`,
    }));

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {aggregations.map((agg) => (
          <div
            key={agg.id}
            className="flex items-center space-x-4"
          >
            <Select
              value={agg.function}
              onValueChange={(value) => updateAggregation(agg.id, 'function', value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select function" />
              </SelectTrigger>
              <SelectContent>
                {AGGREGATION_FUNCTIONS.map((func) => (
                  <SelectItem
                    key={func.value}
                    value={func.value}
                  >
                    {func.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={agg.field}
              onValueChange={(value) => updateAggregation(agg.id, 'field', value)}
            >
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {numericFields.map((field) => (
                  <SelectItem
                    key={field.value}
                    value={field.value}
                  >
                    {field.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Alias (optional)"
              className="w-[200px]"
              value={agg.alias}
              onChange={(e) => updateAggregation(agg.id, 'alias', e.target.value)}
            />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeAggregation(agg.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        onClick={addAggregation}
        className="w-full"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Aggregation
      </Button>
    </div>
  );
}
