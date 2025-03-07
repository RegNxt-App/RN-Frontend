import { useEffect, useState } from 'react';



import { useDataView } from '@/hooks/api/use-dataview';
import { Loader2, PlusCircle, X } from 'lucide-react';



import { Alert, AlertDescription } from '@rn/ui/components/ui/alert';
import { Button } from '@rn/ui/components/ui/button';
import { Input } from '@rn/ui/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@rn/ui/components/ui/select';





interface SelectedObject {
  id: string;
  name: string;
  type: string;
  version: {
    id: number;
    number: number;
  };
}

interface Aggregation {
  id: string;
  function: string;
  field: string;
  alias: string;
}

interface AggregationConfigurationProps {
  selectedObjects: SelectedObject[];
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

const NUMERIC_TYPES = [
  'number',
  'integer',
  'decimal',
  'monetary',
  'int',
  'float',
  'double',
  'numeric',
  'int4',
  'int8',
];

export function AggregationConfiguration({
  selectedObjects,
  config,
  updateConfig,
}: AggregationConfigurationProps) {
  const [aggregations, setAggregations] = useState<Aggregation[]>(config);
  const {useObjectColumns} = useDataView();

  const {
    data: columnsData,
    isLoading: isLoadingColumns,
    error: columnsError,
  } = useObjectColumns(selectedObjects.filter((obj) => obj.version?.id));

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

  // Transform the column data into field options with type filtering
  const fieldOptions =
    columnsData?.flatMap((table) =>
      table.columns
        .filter((column) => NUMERIC_TYPES.includes(column.type.toLowerCase()))
        .map((column) => ({
          value: `${table.name}.${column.name}`,
          label: `${table.name} - ${column.label || column.name}`,
          type: column.type,
        }))
    ) || [];

  if (isLoadingColumns) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (columnsError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load columns. Please try again.</AlertDescription>
      </Alert>
    );
  }

  if (!selectedObjects.length) {
    return (
      <Alert>
        <AlertDescription>Please select objects to configure aggregations</AlertDescription>
      </Alert>
    );
  }

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
                {fieldOptions.map((field) => (
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