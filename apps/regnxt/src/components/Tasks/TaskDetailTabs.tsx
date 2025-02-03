import React, {useCallback, useEffect} from 'react';

import {toast} from '@/hooks/use-toast';
import {orchestraBackendInstance} from '@/lib/axios';
import {TaskDetailTabsProps, TaskDetails, TaskParameter} from '@/types/databaseTypes';
import {Calendar, Code, Tag, Trash2} from 'lucide-react';
import useSWR from 'swr';

import {Button} from '@rn/ui/components/ui/button';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@rn/ui/components/ui/tabs';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@rn/ui/components/ui/tooltip';

import {ConfigurationsTabContent} from './ConfigurationsTabContent';
import {PropertiesTabContent} from './PropertiesTabContent';
import {TransformationTab} from './TransformationTab';

export const TaskDetailTabs: React.FC<TaskDetailTabsProps> = ({
  selectedTask,
  currentTab,
  setCurrentTab,
  localTask,
  setLocalTask,
  isSaving,
  setIsSaving,
  designTimeParams,
  setDesignTimeParams,
  runtimeParams,
  onSave,
  inputOptionsResponse,
  outputOptionsResponse,
  variablesResponse,
  onDeleteClick,
}) => {
  const TASK_PARAMETERS_ENDPOINT = `/api/v1/tasks/${selectedTask.task_id}/add_parameter/`;
  const GET_TASK_PARAMETERS_ENDPOINT = `/api/v1/tasks/${selectedTask.task_id}/parameters/`;

  const {data: taskParametersResponse} = useSWR<TaskParameter[]>(
    GET_TASK_PARAMETERS_ENDPOINT,
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

  const updateDesignTimeParams = useCallback(() => {
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
  }, [taskParametersResponse, inputVariableId, outputVariableId, setDesignTimeParams]);

  useEffect(() => {
    updateDesignTimeParams();
  }, [updateDesignTimeParams]);

  useEffect(() => {
    if (selectedTask.task_id !== localTask.task_id) {
      setLocalTask(selectedTask);
    }
  }, [selectedTask.task_id, localTask.task_id, setLocalTask]);

  const handleInputChange = (field: keyof TaskDetails, value: string) => {
    setLocalTask((prev) =>
      prev
        ? {
            ...prev,
            [field]: value,
          }
        : null
    );
  };

  const handleSaveChanges = async () => {
    if (!localTask) return;

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
        label: localTask.label,
        description: localTask.description,
        context: localTask.context,
        task_language: localTask.task_language,
        task_code: localTask.task_code,
      };

      const {data} = await orchestraBackendInstance.put(`/api/v1/tasks/${localTask.task_id}/`, payload);

      if (parameters.length > 0) {
        await orchestraBackendInstance.post(TASK_PARAMETERS_ENDPOINT, parameters);
      }

      toast({
        title: 'Success',
        description: 'Task updated successfully',
      });

      if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-2">
        <h2 className="text-xl font-semibold">{localTask?.label}</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDeleteClick}
                    disabled={selectedTask.is_predefined || isSaving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </span>
              </TooltipTrigger>
              {localTask?.is_predefined && (
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
                    disabled={localTask?.is_predefined || isSaving}
                  >
                    Save Changes
                  </Button>
                </span>
              </TooltipTrigger>
              {localTask?.is_predefined && (
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
          <Code className="w-4 h-4 mr-1" /> {localTask?.code}
        </span>
        <span className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" /> 28/09/2024
        </span>
        <span className="flex items-center">
          <Tag className="w-4 h-4 mr-1" /> {localTask?.task_type_label}
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
    </div>
  );
};
