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
import {Calendar, Code, Tag, Trash2} from 'lucide-react';
import useSWR, {mutate} from 'swr';

import {Button} from '@rn/ui/components/ui/button';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@rn/ui/components/ui/dialog';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@rn/ui/components/ui/tabs';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@rn/ui/components/ui/tooltip';

import {ConfigurationsTabContent} from './ConfigurationsTabContent';
import {PropertiesTabContent} from './PropertiesTabContent';
import {TransformationTab} from './TransformationTab';

interface ApiResponse<T> {
  data: T;
}
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
  const {data: inputOptionsResponse} = useSWR<ApiResponse<(DatasetOption | DataviewOption)[]>>(
    inputVariableId && variablesResponse?.find((v) => v.variable_id === inputVariableId)?.statement
      ? `/api/v1/tasks/execute-sql/?statement=${encodeURIComponent(
          variablesResponse?.find((v) => v.variable_id === inputVariableId)?.statement || ''
        )}`
      : null,
    async (url: any) => {
      const response = await orchestraBackendInstance.get(url);
      return {data: response.data};
    }
  );

  const {data: outputOptionsResponse} = useSWR<ApiResponse<DatasetOption[]>>(
    outputVariableId && variablesResponse?.find((v) => v.variable_id === outputVariableId)?.statement
      ? `/api/v1/tasks/execute-sql/?statement=${encodeURIComponent(
          variablesResponse?.find((v) => v.variable_id === outputVariableId)?.statement || ''
        )}`
      : null,
    async (url: any) => {
      const response = await orchestraBackendInstance.get(url);
      return {data: response.data};
    }
  );
  useEffect(() => {
    console.log('Task Parameters Changed:', {
      taskParameters: taskParametersResponse,
      inputOptions: inputOptionsResponse,
      outputOptions: outputOptionsResponse,
      currentDesignTimeParams: designTimeParams,
      inputVariableId,
      outputVariableId,
    });
  }, [taskParametersResponse, inputOptionsResponse, outputOptionsResponse, designTimeParams]);

  useEffect(() => {
    if (taskParametersResponse?.length) {
      const inputParam = taskParametersResponse.find((param) => param.parameter_id === inputVariableId);
      const outputParam = taskParametersResponse.find((param) => param.parameter_id === outputVariableId);

      if (inputParam || outputParam) {
        setDesignTimeParams({
          sourceId: inputParam?.default_value || '',
          sourceType: 'dataset',
          destinationId: outputParam?.default_value || '',
        });
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
        default_value: param.default_value,
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
    const parameters = [];
    if (inputVariableId) {
      parameters.push({
        parameter_id: inputVariableId,
        default_value: designTimeParams.sourceId,
      });
    }
    if (outputVariableId) {
      parameters.push({
        parameter_id: outputVariableId,
        default_value: designTimeParams.destinationId,
      });
    }

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

      if (parameters.length > 0) {
        await orchestraBackendInstance.post(`/api/v1/tasks/${localTask.task_id}/add_parameter/`, parameters);
      }

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

        <PropertiesTabContent
          selectedTask={selectedTask}
          localTask={localTask}
          handleInputChange={handleInputChange}
        />
        <ConfigurationsTabContent
          selectedTask={selectedTask}
          localTask={localTask}
          handleInputChange={handleInputChange}
          designTimeParams={designTimeParams}
          setDesignTimeParams={setDesignTimeParams}
          variablesResponse={variablesResponse}
          inputOptionsResponse={inputOptionsResponse}
          outputOptionsResponse={outputOptionsResponse}
          runtimeParams={runtimeParams}
        />

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
