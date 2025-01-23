import React from 'react';

import {
  DatasetOption,
  DataviewOption,
  RuntimeParameter,
  TaskDetails,
  VariableResponse,
} from '@/types/databaseTypes';
import {Plus} from 'lucide-react';

import {Button} from '@rn/ui/components/ui/button';
import {Card} from '@rn/ui/components/ui/card';
import {Input} from '@rn/ui/components/ui/input';
import {Label} from '@rn/ui/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';
import {TabsContent} from '@rn/ui/components/ui/tabs';
import {Textarea} from '@rn/ui/components/ui/textarea';

import DisabledTooltip from './DisabledTooltip';

interface ConfigurationsTabContentProps {
  selectedTask: TaskDetails;
  localTask: TaskDetails;
  handleInputChange: (field: keyof TaskDetails, value: string) => void;
  designTimeParams: {
    sourceId: string;
    sourceType: 'dataset' | 'dataview';
    destinationId: string;
  };
  setDesignTimeParams: React.Dispatch<
    React.SetStateAction<{
      sourceId: string;
      sourceType: 'dataset' | 'dataview';
      destinationId: string;
    }>
  >;
  variablesResponse?: VariableResponse[];
  inputOptionsResponse?: {data: (DatasetOption | DataviewOption)[]};
  outputOptionsResponse?: {data: DatasetOption[]};
  runtimeParams: RuntimeParameter[];
}

export const ConfigurationsTabContent: React.FC<ConfigurationsTabContentProps> = ({
  selectedTask,
  localTask,
  handleInputChange,
  designTimeParams,
  setDesignTimeParams,
  variablesResponse,
  inputOptionsResponse,
  outputOptionsResponse,
  runtimeParams,
}) => {
  const renderTaskLanguageField = () => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Task Language</Label>
      <DisabledTooltip isDisabled={selectedTask.is_predefined}>
        <Select
          value={localTask.task_language || 'python'}
          onValueChange={(value) => handleInputChange('task_language', value)}
          disabled={selectedTask.is_predefined}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="sql">SQL</SelectItem>
          </SelectContent>
        </Select>
      </DisabledTooltip>
    </div>
  );

  const renderTransformFields = () => (
    <div className="grid grid-cols-2 gap-4">
      {variablesResponse?.map((variable) => {
        const isInput = variable.name === 'input_dataset';
        return (
          <div
            key={variable.variable_id}
            className="space-y-2"
          >
            <Label className="text-sm font-medium">{variable.label}</Label>
            <DisabledTooltip isDisabled={selectedTask.is_predefined}>
              <Select
                value={
                  isInput
                    ? `${designTimeParams.sourceId}:${designTimeParams.sourceType}`
                    : designTimeParams.destinationId
                }
                onValueChange={(value) => {
                  if (isInput) {
                    const [id, type] = value.split(':');
                    setDesignTimeParams((prev) => ({
                      ...prev,
                      sourceId: id,
                      sourceType: type === 'dataview' ? 'dataview' : 'dataset',
                    }));
                  } else {
                    setDesignTimeParams((prev) => ({
                      ...prev,
                      destinationId: value,
                    }));
                  }
                }}
                disabled={selectedTask.is_predefined}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${isInput ? 'input' : 'output'} location`} />
                </SelectTrigger>
                <SelectContent>
                  {isInput
                    ? inputOptionsResponse?.data?.map((option: any) => {
                        const id = option.dataset_version_id || option.dataview_version_id;
                        const type = option.dataset_version_id ? 'dataset' : 'dataview';
                        return (
                          <SelectItem
                            key={`${id}:${type}`}
                            value={`${id}:${type}`}
                          >
                            {option['?column?']}
                          </SelectItem>
                        );
                      })
                    : outputOptionsResponse?.data?.map((option: any) => (
                        <SelectItem
                          key={option.dataset_version_id}
                          value={String(option.dataset_version_id)}
                        >
                          {option['?column?']}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </DisabledTooltip>
          </div>
        );
      })}
    </div>
  );

  const renderDesignTimeParamsFields = () => (
    <div className="col-span-2 space-y-4">
      {Object.entries(designTimeParams).map(([key, value]) => (
        <div
          key={key}
          className="space-y-2"
        >
          <Label>{key}</Label>
          <Input
            value={value}
            onChange={(e) => setDesignTimeParams((prev) => ({...prev, [key]: e.target.value}))}
            disabled={selectedTask.is_predefined}
          />
        </div>
      ))}
    </div>
  );

  const isTaskType4AndSubtype20 = selectedTask.task_type_id === 4 && selectedTask.task_subtype_id === 20;
  const isTaskType2AndSubtype17 = selectedTask.task_type_id === 2 && selectedTask.task_subtype_id === 17;

  return (
    <TabsContent
      value="configurations"
      className="space-y-4"
    >
      <div className="space-y-6">
        {isTaskType4AndSubtype20 ? (
          <>
            {renderTaskLanguageField()}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Task Code</Label>
              <DisabledTooltip isDisabled={selectedTask.is_predefined}>
                <Textarea
                  value={localTask.task_code || ''}
                  onChange={(e) => handleInputChange('task_code', e.target.value)}
                  disabled={selectedTask.is_predefined}
                  className="min-h-[200px] font-mono"
                  placeholder="Enter your code here..."
                />
              </DisabledTooltip>
            </div>
          </>
        ) : isTaskType2AndSubtype17 && variablesResponse ? (
          renderTransformFields()
        ) : (
          <>
            {renderTaskLanguageField()}
            {Object.keys(designTimeParams).length > 0 && renderDesignTimeParamsFields()}
          </>
        )}

        <Card className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Runtime Parameters</h3>
            <Button
              variant="outline"
              size="sm"
              disabled={selectedTask.is_predefined}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Parameter
            </Button>
          </div>

          {runtimeParams.length > 0 ? (
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
                      disabled={selectedTask.is_predefined}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={param.type}
                      disabled={selectedTask.is_predefined}
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
                      disabled={selectedTask.is_predefined}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={param.description}
                      disabled={selectedTask.is_predefined}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No runtime parameters configured</p>
          )}
        </Card>
      </div>
    </TabsContent>
  );
};
