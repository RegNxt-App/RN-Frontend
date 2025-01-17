import {useState} from 'react';

import {DesignTimeParameters, TransformationTabProps} from '@/types/databaseTypes';
import {Plus} from 'lucide-react';

import {Button} from '@rn/ui/components/ui/button';
import {Card} from '@rn/ui/components/ui/card';
import {Input} from '@rn/ui/components/ui/input';
import {Label} from '@rn/ui/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';

import {FieldMappingGrid} from './FieldMappingGrid';
import {
  defaultRuntimeParameters,
  dummyDatasets,
  dummyDataviews,
  dummyDestinationFields,
  dummySourceFields,
} from './dummyData';

export const TransformationTab: React.FC<TransformationTabProps> = ({disabled, onSave}) => {
  const [sourceType, setSourceType] = useState<'dataset' | 'dataview'>('dataset');
  const [sourceId, setSourceId] = useState('');
  const [destinationId, setDestinationId] = useState('');
  const [runtimeParams, setRuntimeParams] = useState(defaultRuntimeParameters);
  const [mappings, setMappings] = useState([]);
  const [designTimeParams, setDesignTimeParams] = useState<DesignTimeParameters>({
    sourceId: '',
    sourceType: 'dataset',
    destinationId: '',
  });
  const handleAddRuntimeParam = () => {
    const newParam = {
      id: `param${runtimeParams.length + 1}`,
      name: '',
      type: 'string',
      defaultValue: '',
      description: '',
    };
    setRuntimeParams([...runtimeParams, newParam]);
  };

  const handleRuntimeParamChange = (paramId: string, field: string, value: string) => {
    setRuntimeParams(
      runtimeParams.map((param) => (param.id === paramId ? {...param, [field]: value} : param))
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Design Time Parameters</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Source Type</Label>
            <Select
              value={designTimeParams.sourceType}
              onValueChange={(value: 'dataset' | 'dataview') =>
                setDesignTimeParams((prev) => ({...prev, sourceType: value}))
              }
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dataset">Dataset</SelectItem>
                <SelectItem value="dataview">Dataview</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Source</Label>
            <Select
              value={designTimeParams.sourceId}
              onValueChange={(value) => setDesignTimeParams((prev) => ({...prev, sourceId: value}))}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {(sourceType === 'dataset' ? dummyDatasets : dummyDataviews).map((source) => (
                  <SelectItem
                    key={source.id}
                    value={source.id}
                  >
                    {source.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 col-span-2">
            <Label>Destination Dataset</Label>
            <Select
              value={designTimeParams.destinationId || 'default'}
              onValueChange={(value) => setDesignTimeParams((prev) => ({...prev, destinationId: value}))}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  value="default"
                  disabled
                >
                  Select a destination
                </SelectItem>
                {dummyDatasets.map((dataset) => (
                  <SelectItem
                    key={dataset.id}
                    value={dataset.id}
                  >
                    {dataset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {sourceId && destinationId && (
        <Card className="p-4">
          <h3 className="text-lg font-medium mb-4">Field Mappings</h3>
          <FieldMappingGrid
            sourceFields={dummySourceFields}
            destinationFields={dummyDestinationFields}
            runtimeParams={runtimeParams}
            mappings={mappings}
            onMappingChange={setMappings}
            disabled={disabled}
          />
        </Card>
      )}

      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Runtime Parameters</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddRuntimeParam}
            disabled={disabled}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Parameter
          </Button>
        </div>

        <div className="space-y-4">
          {runtimeParams.map((param) => (
            <div
              key={param.id}
              className="grid grid-cols-2 gap-4 p-4 border rounded-lg"
            >
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={param.name}
                  onChange={(e) => handleRuntimeParamChange(param.id, 'name', e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={param.type}
                  onValueChange={(value) => handleRuntimeParamChange(param.id, 'type', value)}
                  disabled={disabled}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="boolean">Boolean</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default Value</Label>
                <Input
                  value={param.defaultValue || ''}
                  onChange={(e) => handleRuntimeParamChange(param.id, 'defaultValue', e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={param.description}
                  onChange={(e) => handleRuntimeParamChange(param.id, 'description', e.target.value)}
                  disabled={disabled}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
