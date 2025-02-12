import React from 'react';

import {AddRuntimeParameterDialog} from '@/components/AddRuntimeParameterDialog';
import {useTaskConfiguration} from '@/contexts/TaskConfigurationContext';
import {orchestraBackendInstance} from '@/lib/axios';
import {
  ApiResponse,
  AvailableParameter,
  DatasetOption,
  DataviewOption,
  DesignTimeParams,
  RuntimeParameter,
  SubtypeParamsResponse,
  Task,
  VariableResponse,
} from '@/types/databaseTypes';
import useSWR from 'swr';

import {Card} from '@rn/ui/components/ui/card';
import {Input} from '@rn/ui/components/ui/input';
import {Label} from '@rn/ui/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';
import {TabsContent} from '@rn/ui/components/ui/tabs';
import {Textarea} from '@rn/ui/components/ui/textarea';

import Loader from '../loader';
import {TooltipWrapper} from './TooltipWrapper';

interface ConfigurationsTabContentProps {
  selectedTask: Task;
  localTask: Task;
  handleInputChange: (field: keyof Task, value: string) => void;
  designTimeParams: DesignTimeParams;
  setDesignTimeParams: React.Dispatch<React.SetStateAction<DesignTimeParams>>;
  variablesResponse?: VariableResponse[];
  inputOptionsResponse?: ApiResponse<(DatasetOption | DataviewOption)[]>;
  outputOptionsResponse?: ApiResponse<DatasetOption[]>;
  runtimeParams: RuntimeParameter[];
  subtypeParamsResponse?: SubtypeParamsResponse[];
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
  subtypeParamsResponse,
}) => {
  const {taskConfigurations, isLoading} = useTaskConfiguration();

  const fetcher = (url: string) => orchestraBackendInstance.get(url).then((res) => res.data);

  const {data: availableParameters, mutate: mutateAvailable} = useSWR<AvailableParameter[]>(
    `/api/v1/tasks/get-available-runtime-parameters/`,
    fetcher
  );

  const {data: taskParameters, mutate: mutateTaskParams} = useSWR<RuntimeParameter[]>(
    `/api/v1/tasks/${selectedTask.task_id}/get-task-runtime-parameters/`,
    fetcher
  );
  const handleParameterAdd = () => {
    mutateAvailable();
    mutateTaskParams();
  };
  if (isLoading || !taskConfigurations) {
    return <Loader />;
  }

  const isCustomCodeTask = taskConfigurations.taskTypes[selectedTask.task_type_code]?.subtypes.find(
    (subtype) => subtype.id === selectedTask.task_subtype_id && subtype.features.allowsCustomCode
  );

  const isTransformationTask = taskConfigurations.taskTypes[selectedTask.task_type_code]?.subtypes.find(
    (subtype) => subtype.id === selectedTask.task_subtype_id && subtype.features.requiresTransformation
  );

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

  const renderTransformFields = () => {
    const sortedVariables = [...(variablesResponse || [])].sort((a, b) => {
      if (a.name === 'input_dataset') return -1;
      if (b.name === 'input_dataset') return 1;
      return 0;
    });

    const getSelectedLabel = (isInput: boolean, options: (DatasetOption | DataviewOption)[]) => {
      if (!options.length) return isInput ? 'Select Input Location' : 'Select Output Location';
      return isInput
        ? options.find(
            (opt) =>
              `${opt.id}:${opt.source.trim().toLowerCase()}` ===
              `${designTimeParams.sourceId}:${designTimeParams.sourceType}`
          )?.label
        : options.find((opt) => String(opt.id) === designTimeParams.destinationId)?.label;
    };

    const handleChange = (isInput: boolean, value: string) => {
      if (isInput) {
        const [id, type] = value.split(':');
        setDesignTimeParams((prev) => ({
          ...prev,
          sourceId: id,
          sourceType: type.includes('dataview') ? 'dataview' : 'dataset',
        }));
      } else {
        setDesignTimeParams((prev) => ({
          ...prev,
          destinationId: value,
        }));
      }
    };

    return (
      <div className="grid grid-cols-2 gap-4">
        {sortedVariables.map((variable) => {
          const isInput = variable.name === 'input_dataset';
          const parameterLabel = subtypeParamsResponse?.[0]?.parameters
            ? subtypeParamsResponse[0].parameters.find((p) => p.id === variable.variable_id)?.name
            : variable.label;

          const options = isInput ? inputOptionsResponse?.data : outputOptionsResponse?.data;
          const currentValue = isInput
            ? `${designTimeParams.sourceId}:${designTimeParams.sourceType}`
            : designTimeParams.destinationId;

          return (
            <div
              key={variable.variable_id}
              className="space-y-2"
            >
              <Label className="text-sm font-medium">{parameterLabel}</Label>
              <TooltipWrapper
                disabled={selectedTask.is_predefined}
                disabledMessage="You cannot modify a system-generated task"
              >
                <Select
                  value={currentValue || ''}
                  onValueChange={(value) => handleChange(isInput, value)}
                  disabled={selectedTask.is_predefined}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isInput ? 'Select Input Location' : 'Select Output Location'}>
                      {getSelectedLabel(isInput, options ?? []) ||
                        (isInput ? 'Select Input Location' : 'Select Output Location')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {isInput
                      ? inputOptionsResponse?.data?.map((option: any) => (
                          <SelectItem
                            key={`input-${option.id}-${option.source}`}
                            value={`${option.id}:${option.source.trim().toLowerCase()}`}
                          >
                            {option.label}
                          </SelectItem>
                        ))
                      : outputOptionsResponse?.data?.map((option: any) => (
                          <SelectItem
                            key={`output-${option.id}`}
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
  };

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

  return (
    <TabsContent
      value="configurations"
      className="space-y-4"
    >
      <div className="space-y-6">
        {isCustomCodeTask ? (
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
        ) : isTransformationTask && variablesResponse ? (
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
