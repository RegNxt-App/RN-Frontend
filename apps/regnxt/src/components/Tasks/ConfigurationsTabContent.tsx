import React, {useMemo} from 'react';

import {AddRuntimeParameterDialog} from '@/components/AddRuntimeParameterDialog';
import {useBackend} from '@/contexts/BackendContext';
import {useTaskConfiguration} from '@/contexts/TaskConfigurationContext';
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
  const {backendInstance} = useBackend();

  const {taskConfigurations, isLoading} = useTaskConfiguration();

  const {data: availableParameters, mutate: mutateAvailable} = useSWR<AvailableParameter[]>(
    `/api/v1/tasks/get-available-runtime-parameters/`,
    (url: string) => backendInstance.get(url).then((r) => r.data)
  );

  const {data: taskParameters, mutate: mutateTaskParams} = useSWR<RuntimeParameter[]>(
    `/api/v1/tasks/${selectedTask.task_id}/get-task-runtime-parameters/`,
    (url: string) => backendInstance.get(url).then((r) => r.data)
  );
  const handleParameterAdd = () => {
    mutateAvailable();
    mutateTaskParams();
  };
  if (isLoading || !taskConfigurations || !Object.keys(taskConfigurations.taskTypes || {}).length) {
    return <Loader />;
  }

  const {isCustomCodeTask, isTransformationTask} = useMemo(() => {
    const taskType = taskConfigurations?.taskTypes?.[selectedTask?.task_type_code];
    const relevantSubtype = taskType?.subtypes?.find(
      (subtype) => subtype?.id === selectedTask?.task_subtype_id
    );

    return {
      isCustomCodeTask: Boolean(relevantSubtype?.features?.allowsCustomCode),
      isTransformationTask: Boolean(relevantSubtype?.features?.requiresTransformation),
    };
  }, [taskConfigurations?.taskTypes, selectedTask?.task_type_code, selectedTask?.task_subtype_id]);

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
    const PRIORITY_ORDER = ['input_dataset', 'output_dataset'];

    const sortedVariables = [...(variablesResponse || [])].sort((a, b) => {
      const indexA = PRIORITY_ORDER.indexOf(a.name);
      const indexB = PRIORITY_ORDER.indexOf(b.name);
      return indexA === -1 && indexB === -1
        ? a.name.localeCompare(b.name)
        : indexA === -1
        ? 1
        : indexB === -1
        ? -1
        : indexA - indexB;
    });

    const getSelectedLabel = (isInput: boolean, options: (DatasetOption | DataviewOption)[]) => {
      const defaultLabel = isInput ? 'Select Input Location' : 'Select Output Location';

      return (
        options?.find((opt) =>
          isInput
            ? `${opt.id}:${opt.source?.trim().toLowerCase()}` ===
              `${designTimeParams.sourceId}:${designTimeParams.sourceType}`
            : String(opt.id) === designTimeParams.destinationId
        )?.label ?? defaultLabel
      );
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
                      disabled
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
