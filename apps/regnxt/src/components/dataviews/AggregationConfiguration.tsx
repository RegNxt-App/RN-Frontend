import {useEffect, useState} from 'react';

import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {PlusCircle, X} from 'lucide-react';

import {Button} from '@rn/ui/components/ui/button';
import {Input} from '@rn/ui/components/ui/input';

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

export function AggregationConfiguration({config, updateConfig}: AggregationConfigurationProps) {
  const [aggregations, setAggregations] = useState<Aggregation[]>(config);

  useEffect(() => {
    if (JSON.stringify(aggregations) !== JSON.stringify(config)) {
      updateConfig(aggregations);
    }
  }, [aggregations, config, updateConfig]);

  const addAggregation = () => {
    setAggregations([...aggregations, {id: Date.now().toString(), function: '', field: '', alias: ''}]);
  };

  const removeAggregation = (id: string) => {
    setAggregations(aggregations.filter((agg) => agg.id !== id));
  };

  const updateAggregation = (id: string, field: string, value: string) => {
    setAggregations(aggregations.map((agg) => (agg.id === id ? {...agg, [field]: value} : agg)));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Aggregation Configuration</h3>
      {aggregations.map((agg) => (
        <div
          key={agg.id}
          className="flex items-center space-x-4"
        >
          <Select onValueChange={(value) => updateAggregation(agg.id, 'function', value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select function" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sum">Sum</SelectItem>
              <SelectItem value="avg">Average</SelectItem>
              <SelectItem value="count">Count</SelectItem>
              <SelectItem value="min">Minimum</SelectItem>
              <SelectItem value="max">Maximum</SelectItem>
            </SelectContent>
          </Select>
          <Select onValueChange={(value) => updateAggregation(agg.id, 'field', value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="transaction_amount">Transaction Amount</SelectItem>
              <SelectItem value="customer_id">Customer ID</SelectItem>
            </SelectContent>
          </Select>
          <Input
            placeholder="Enter alias"
            className="w-[200px]"
            value={agg.alias}
            onChange={(e) => updateAggregation(agg.id, 'alias', e.target.value)}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeAggregation(agg.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        className="w-full"
        onClick={addAggregation}
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Aggregation
      </Button>
    </div>
  );
}
