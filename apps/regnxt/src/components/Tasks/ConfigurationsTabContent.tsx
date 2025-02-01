import React from 'react';

import {AddRuntimeParameterDialog} from '@/components/AddRuntimeParameterDialog';
import {orchestraBackendInstance} from '@/lib/axios';
import {AvailableParameter, ConfigurationsTabContentProps, RuntimeParameter} from '@/types/databaseTypes';
import useSWR from 'swr';

import {Card} from '@rn/ui/components/ui/card';
import {Input} from '@rn/ui/components/ui/input';
import {Label} from '@rn/ui/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';
import {TabsContent} from '@rn/ui/components/ui/tabs';
import {Textarea} from '@rn/ui/components/ui/textarea';

import {TooltipWrapper} from './TooltipWrapper';

export const ConfigurationsTabContent: React.FC<ConfigurationsTabContentProps> = ({
  selectedTask,
  localTask,
  handleInputChange,
  designTimeParams,
  setDesignTimeParams,
  variablesResponse,
  inputOptionsResponse,
  outputOptionsResponse,
}) => {
  const fetcher = (url: string) => orchestraBackendInstance.get(url).then((res) => res.data);

  const {data: availableParameters, mutate: mutateAvailable} = useSWR<AvailableParameter[]>(
    `/api/v1/tasks/${selectedTask.task_id}/get_available_runtime_parameters/`,
    fetcher
  );

  const {data: taskParameters, mutate: mutateTaskParams} = useSWR<RuntimeParameter[]>(
    `/api/v1/tasks/${selectedTask.task_id}/get_task_runtime_parameters/`,
    fetcher
  );
  const handleParameterAdd = () => {
    mutateAvailable();
    mutateTaskParams();
  };

  const renderTaskLanguageField = () => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Task Language</Label>
      <TooltipWrapper
        disabled={selectedTask.is_predefined}
        disabledMessage="You cannot modify a system-generated task"
      >
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
      </TooltipWrapper>
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
            <TooltipWrapper
              disabled={selectedTask.is_predefined}
              disabledMessage="You cannot modify a system-generated task"
            >
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
                        const id = option.id;
                        const type = option.source.includes('dataset') ? 'dataset' : 'dataview';
                        return (
                          <SelectItem
                            key={`${id}:${type}`}
                            value={`${id}:${type}`}
                          >
                            {option.label}
                          </SelectItem>
                        );
                      })
                    : outputOptionsResponse?.data?.map((option: any) => (
                        <SelectItem
                          key={option.id}
                          value={String(option.id)}
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </TooltipWrapper>
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
              <TooltipWrapper
                disabled={selectedTask.is_predefined}
                disabledMessage="You cannot modify a system-generated task"
              >
                <Textarea
                  value={localTask.task_code || ''}
                  onChange={(e) => handleInputChange('task_code', e.target.value)}
                  disabled={selectedTask.is_predefined}
                  className="min-h-[200px] font-mono"
                  placeholder="Enter your code here..."
                />
              </TooltipWrapper>
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
            <AddRuntimeParameterDialog
              taskId={selectedTask.task_id}
              availableParameters={availableParameters || []}
              onParameterAdd={handleParameterAdd}
              isDisabled={selectedTask.is_predefined}
            />
          </div>

          {taskParameters && taskParameters.length > 0 ? (
            <div className="space-y-4">
              {taskParameters.map((param) => (
                <div
                  key={param.parameter_id}
                  className="grid grid-cols-2 gap-4 p-4 border rounded-lg"
                >
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={param.name}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Input
                      value={param.data_type}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Value</Label>
                    <Input
                      value={param.default_value || ''}
                      disabled={selectedTask.is_predefined}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={param.description}
                      disabled
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
