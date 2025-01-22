import React, {useEffect, useState} from 'react';

import {toast} from '@/hooks/use-toast';
import {orchestraBackendInstance} from '@/lib/axios';
import {
  DatasetOption,
  DataviewOption,
  RuntimeParameter,
  SubtypeParamsResponse,
  TaskDetailTabsProps,
  TaskDetails,
  TaskParameter,
  VariableResponse,
} from '@/types/databaseTypes';
import {Calendar, Code, Plus, Tag, Trash2} from 'lucide-react';
import useSWR, {mutate} from 'swr';

import {Button} from '@rn/ui/components/ui/button';
import {Card} from '@rn/ui/components/ui/card';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@rn/ui/components/ui/dialog';
import {Input} from '@rn/ui/components/ui/input';
import {Label} from '@rn/ui/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@rn/ui/components/ui/tabs';
import {Textarea} from '@rn/ui/components/ui/textarea';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@rn/ui/components/ui/tooltip';

import DisabledTooltip from './DisabledTooltip';
import {TransformationTab} from './TransformationTab';

export const TaskDetailTabs: React.FC<TaskDetailTabsProps> = ({selectedTask, onSave, onDelete}) => {
  const [currentTab, setCurrentTab] = useState('properties');
  const [localTask, setLocalTask] = useState<TaskDetails>(selectedTask);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [designTimeParams, setDesignTimeParams] = useState<{
    sourceId: string;
    sourceType: 'dataset' | 'dataview';
    destinationId: string;
  }>({
    sourceId: '',
    sourceType: 'dataset',
    destinationId: '',
  });

  const [runtimeParams, setRuntimeParams] = useState<RuntimeParameter[]>([]);

  const TASKS_ENDPOINT = '/api/v1/tasks/';
  const TASK_PARAMETERS_ENDPOINT = `/api/v1/tasks/${selectedTask.task_id}/add_parameter/`;
  const GET_TASK_PARAMETERS_ENDPOINT = `/api/v1/tasks/${selectedTask.task_id}/parameters/`;

  const {data: taskParametersResponse} = useSWR<TaskParameter[]>(
    GET_TASK_PARAMETERS_ENDPOINT,
    async (url: string) => {
      const response = await orchestraBackendInstance.get(url);
      return response.data;
    }
  );

  const {data: subtypeParamsResponse} = useSWR<SubtypeParamsResponse[]>(
    selectedTask.task_type_id && selectedTask.task_subtype_id
      ? `/api/v1/tasks/${selectedTask.task_subtype_id}/subtype-parameters/`
      : null,
    async (url: string) => {
      const response = await orchestraBackendInstance.get(url);
      return response.data;
    }
  );
  const {data: variablesResponse} = useSWR<VariableResponse[]>(
    subtypeParamsResponse?.[0]?.parameters
      ? `/api/v1/tasks/variables/?ids=${subtypeParamsResponse[0].parameters.map((p) => p.id).join(',')}`
      : null,
    async (url: string) => {
      const response = await orchestraBackendInstance.get(url);
      return response.data;
    }
  );
  const inputVariableId = variablesResponse?.find(
    (v) => v.name.toLowerCase().includes('input') && v.name.toLowerCase().includes('dataset')
  )?.variable_id;

  const outputVariableId = variablesResponse?.find(
    (v) => v.name.toLowerCase().includes('output') && v.name.toLowerCase().includes('dataset')
  )?.variable_id;
  const {data: inputOptionsResponse} = useSWR<(DatasetOption | DataviewOption)[]>(
    inputVariableId && variablesResponse?.find((v) => v.variable_id === inputVariableId)?.statement
      ? `/api/v1/tasks/execute-sql/?statement=${encodeURIComponent(
          variablesResponse?.find((v) => v.variable_id === inputVariableId)?.statement || ''
        )}`
      : null,
    orchestraBackendInstance
  );

  const {data: outputOptionsResponse} = useSWR<DatasetOption[]>(
    outputVariableId && variablesResponse?.find((v) => v.variable_id === outputVariableId)?.statement
      ? `/api/v1/tasks/execute-sql/?statement=${encodeURIComponent(
          variablesResponse?.find((v) => v.variable_id === outputVariableId)?.statement || ''
        )}`
      : null,
    orchestraBackendInstance
  );

  useEffect(() => {
    console.log('Task Parameters Changed:', {
      taskParameters: taskParametersResponse,
      inputOptions: inputOptionsResponse?.data,
      outputOptions: outputOptionsResponse?.data,
      currentDesignTimeParams: designTimeParams,
      inputVariableId,
      outputVariableId,
    });
  }, [taskParametersResponse, inputOptionsResponse, outputOptionsResponse, designTimeParams]);

  useEffect(() => {
    if (taskParametersResponse && taskParametersResponse.length > 0) {
      console.log('Loading saved parameters:', taskParametersResponse);

      const inputParam = inputVariableId
        ? taskParametersResponse.find((param) => param.parameter_id === inputVariableId)
        : undefined;

      const outputParam = outputVariableId
        ? taskParametersResponse.find((param) => param.parameter_id === outputVariableId)
        : undefined;

      if (inputParam || outputParam) {
        setDesignTimeParams((prev) => ({
          ...prev,
          sourceId: inputParam?.default_value || '',
          sourceType: inputParam?.source || 'dataset',
          destinationId: outputParam?.default_value || '',
        }));
      }
    }
  }, [taskParametersResponse, inputVariableId, outputVariableId]);

  useEffect(() => {
    if (selectedTask.task_id !== localTask.task_id) {
      setLocalTask(selectedTask);
    }
  }, [selectedTask.task_id]);

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTask?.id) {
      console.error('No task id found');
      return;
    }

    try {
      await orchestraBackendInstance.delete(`/api/v1/tasks/${selectedTask.id}/`);

      setIsDeleteDialogOpen(false);

      toast({
        title: 'Task Deleted',
        description: 'Task Deleted Successfully',
      });

      await mutate(TASKS_ENDPOINT);

      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      });
    }
  };
  const handleInputChange = (field: keyof TaskDetails, value: string) => {
    setLocalTask((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const saveTaskParameters = async (parameters: TaskParameter[]) => {
    try {
      const payload = parameters.map((param) => ({
        parameter_id: param.id,
        default_value: param.value,
      }));

      await orchestraBackendInstance.post(TASK_PARAMETERS_ENDPOINT, payload);

      toast({
        title: 'Success',
        description: 'Task parameters saved successfully',
      });

      mutate(GET_TASK_PARAMETERS_ENDPOINT);
    } catch (error) {
      console.error('Error saving task parameters:', error);

      toast({
        title: 'Error',
        description: 'Failed to save task parameters',
        variant: 'destructive',
      });
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const payload = {
        task_type_id: localTask.task_type_id,
        code: localTask.code,
        label: localTask.label,
        description: localTask.description,
        context: localTask.context,
        task_language: localTask.task_language,
        task_code: localTask.task_code,
      };

      const {data} = await orchestraBackendInstance.put(`/api/v1/tasks/${localTask.task_id}/`, payload);

      const parameters: TaskParameter[] = [
        {
          id: 3,
          value: designTimeParams.sourceId,
        },
        {
          id: 4,
          value: designTimeParams.destinationId,
        },
      ];

      await saveTaskParameters(parameters);

      setLocalTask((prev) => ({
        ...prev,
        ...data,
      }));

      await mutate(TASKS_ENDPOINT);
      await mutate(TASK_PARAMETERS_ENDPOINT);

      toast({
        title: 'Success',
        description: 'Task updated successfully',
      });

      if (onSave) {
        onSave();
      }
      setIsSaving(false);
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-2">
        <h2 className="text-xl font-semibold">{localTask.label}</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDeleteClick}
                    disabled={localTask.is_predefined || isSaving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </span>
              </TooltipTrigger>
              {localTask.is_predefined && (
                <TooltipContent>
                  <p>You cannot delete a task that is system generated</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSaveChanges}
                    disabled={localTask.is_predefined || isSaving}
                  >
                    Save Changes
                  </Button>
                </span>
              </TooltipTrigger>
              {localTask.is_predefined && (
                <TooltipContent>
                  <p>You cannot edit a task that is system generated</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-500">
        <span className="flex items-center">
          <Code className="w-4 h-4 mr-1" /> {localTask.code}
        </span>
        <span className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" /> 28/09/2024
        </span>
        <span className="flex items-center">
          <Tag className="w-4 h-4 mr-1" /> {localTask.task_type_label}
        </span>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={setCurrentTab}
      >
        <TabsList className="w-full border-b mb-4 lg:mb-6 flex flex-wrap">
          <TabsTrigger
            value="properties"
            className="flex-1"
          >
            Properties
          </TabsTrigger>
          <TabsTrigger
            value="configurations"
            className="flex-1"
          >
            Configurations
          </TabsTrigger>
          {selectedTask.task_type_code === 'transform' && (
            <TabsTrigger
              value="transformation"
              className="flex-1"
            >
              Transformation
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent
          value="properties"
          className="space-y-4"
        >
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Code</Label>
              <DisabledTooltip isDisabled={selectedTask.is_predefined}>
                <Input
                  value={localTask.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  disabled={selectedTask.is_predefined}
                  placeholder="Enter code"
                />
              </DisabledTooltip>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Label</Label>
              <DisabledTooltip isDisabled={selectedTask.is_predefined}>
                <Input
                  value={localTask.label}
                  onChange={(e) => handleInputChange('label', e.target.value)}
                  disabled={selectedTask.is_predefined}
                  placeholder="Enter label"
                />
              </DisabledTooltip>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <DisabledTooltip isDisabled={selectedTask.is_predefined}>
                <Textarea
                  value={localTask.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={selectedTask.is_predefined}
                  className="min-h-[100px]"
                  placeholder="Enter description"
                />
              </DisabledTooltip>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="configurations"
          className="space-y-4"
        >
          <div className="space-y-6">
            {selectedTask.task_type_id === 4 && selectedTask.task_subtype_id === 20 ? (
              <>
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
            ) : selectedTask.task_type_id === 2 &&
              selectedTask.task_subtype_id === 17 &&
              variablesResponse ? (
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
            ) : (
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
            )}

            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Design Time Parameters</h3>
                {/* {!selectedTask.task_type_code === 'transform' && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={selectedTask.is_predefined}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Parameter
                  </Button>
                )} */}
              </div>

              {selectedTask.task_type_code === 'transform' ? (
                <p className="text-sm text-gray-500">
                  Parameters configured in source and destination fields above
                </p>
              ) : Object.keys(designTimeParams).length > 0 ? (
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
              ) : (
                <p className="text-sm text-gray-500">No design time parameters configured</p>
              )}
            </Card>

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

        {selectedTask.task_type_code === 'transform' && (
          <TabsContent value="transformation">
            <TransformationTab
              disabled={selectedTask.is_predefined}
              onSave={handleSaveChanges}
              selectedTask={selectedTask}
            />
          </TabsContent>
        )}
      </Tabs>
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this task? This action cannot be undone.</p>
          <DialogFooter>
            <Button
              onClick={() => setIsDeleteDialogOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="destructive"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
