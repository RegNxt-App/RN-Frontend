import React, {createContext, useCallback, useContext, useEffect, useState} from 'react';

import {useBackend} from '@/contexts/BackendContext';
import {toast} from '@/hooks/use-toast';
import {
  ApiResponse,
  DatasetOption,
  DataviewOption,
  DesignTimeParams,
  SubtypeParamsResponse,
  Task,
} from '@/types/databaseTypes';

interface TaskContextType {
  selectedTask: Task | null;
  setSelectedTask: React.Dispatch<React.SetStateAction<Task | null>>;
  isSaving: boolean;
  designTimeParams: DesignTimeParams;
  setDesignTimeParams: React.Dispatch<React.SetStateAction<DesignTimeParams>>;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  handleTaskChange: (field: keyof Task, value: string) => void;
  handleSaveChanges: (runtimeParams?: {[key: string]: string}) => Promise<void>;
  handleDeleteClick: (task: Task) => void;
  mapTaskToDetails: (task: Task) => Task;
  variablesResponse?: any[];
  subtypeParamsResponse?: SubtypeParamsResponse[];
  inputOptionsResponse?: ApiResponse<(DatasetOption | DataviewOption)[]>;
  outputOptionsResponse?: ApiResponse<DatasetOption[]>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{
  children: React.ReactNode;
  getParametersPayload: (params: DesignTimeParams) => any;
  variablesResponse?: any[];
  subtypeParamsResponse?: SubtypeParamsResponse[];
  inputOptionsResponse?: ApiResponse<(DatasetOption | DataviewOption)[]>;
  outputOptionsResponse?: ApiResponse<DatasetOption[]>;
  initialTask: Task | null;
  onTaskSelect: (task: Task | null) => void;
}> = ({
  children,
  getParametersPayload,
  variablesResponse,
  subtypeParamsResponse,
  inputOptionsResponse,
  outputOptionsResponse,
  initialTask,
  onTaskSelect,
}) => {
  const {backendInstance} = useBackend();

  const [selectedTask, setSelectedTask] = useState<Task | null>(initialTask);
  const [isSaving, setIsSaving] = useState(false);
  const [currentTab, setCurrentTab] = useState('properties');
  const [designTimeParams, setDesignTimeParams] = useState<DesignTimeParams>({
    sourceId: null,
    sourceType: null,
    destinationId: null,
  });
  useEffect(() => {
    if (selectedTask !== initialTask && selectedTask !== null) {
      onTaskSelect(selectedTask);
    }
  }, [selectedTask]);

  useEffect(() => {
    if (initialTask !== selectedTask) {
      setSelectedTask(initialTask);
    }
  }, [initialTask]);

  const handleTaskChange = useCallback((field: keyof Task, value: string) => {
    setSelectedTask((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value,
      };
    });
  }, []);

  const handleSaveChanges = useCallback(
    async (runtimeParams?: {[key: string]: string}) => {
      if (!selectedTask) return;

      setIsSaving(true);

      if (runtimeParams && Object.keys(runtimeParams).length > 0) {
        try {
          const runtimeParamPromises = Object.entries(runtimeParams).map(([paramId, value]) => {
            return backendInstance.put(`/api/v1/tasks/${selectedTask.task_id}/parameters/${paramId}/`, {
              default_value: value,
            });
          });

          await Promise.all(runtimeParamPromises);
        } catch (error) {
          console.error('Error updating runtime parameters:', error);
        }
      }

      const inputVariableId = variablesResponse?.find(
        (v) => v.name.toLowerCase().includes('input') && v.name.toLowerCase().includes('dataset')
      )?.variable_id;

      const outputVariableId = variablesResponse?.find(
        (v) => v.name.toLowerCase().includes('output') && v.name.toLowerCase().includes('dataset')
      )?.variable_id;

      let parameterCount = 1;
      const parameters = [];

      if (inputVariableId) {
        parameters.push({
          id: parameterCount++,
          parameter_id: inputVariableId,
          source: designTimeParams.sourceType || 'dataset',
          default_value: designTimeParams.sourceId,
        });
      }

      if (outputVariableId) {
        parameters.push({
          id: parameterCount++,
          parameter_id: outputVariableId,
          source: 'dataset',
          default_value: designTimeParams.destinationId,
        });
      }

      try {
        const payload = {
          task_type_id: selectedTask.task_type_id,
          label: selectedTask.label,
          description: selectedTask.description,
          context: selectedTask.context,
          task_language: selectedTask.task_language,
          task_code: selectedTask.task_code,
          parameters: getParametersPayload(designTimeParams),
        };

        const {data} = await backendInstance.put(`/api/v1/tasks/${selectedTask.task_id}/`, payload);

        setSelectedTask((prev) =>
          prev
            ? {
                ...prev,
                ...data,
              }
            : null
        );

        toast({
          title: 'Success',
          description: 'Task updated successfully',
        });
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
    },
    [selectedTask, designTimeParams, backendInstance, variablesResponse, getParametersPayload]
  );

  const handleDeleteClick = useCallback((task: Task) => {
    return task;
  }, []);

  const mapTaskToDetails = useCallback((task: Task): Task => {
    return {
      task_id: task.task_id,
      code: task.code,
      label: task.label,
      description: task.description,
      task_type_label: task.task_type_label,
      is_predefined: task.is_predefined || false,
      task_language: task.task_language,
      task_code: task.task_code,
      context: task.context,
      task_type_id: task.task_type_id,
      task_type_code: task.task_type_code,
      task_subtype_id: task.task_subtype_id,
      parameters: task.parameters || [],
      upstream_tasks: null,
    };
  }, []);

  const value = {
    selectedTask,
    setSelectedTask,
    isSaving,
    designTimeParams,
    setDesignTimeParams,
    currentTab,
    setCurrentTab,
    handleTaskChange,
    handleSaveChanges,
    handleDeleteClick,
    mapTaskToDetails,
    variablesResponse,
    subtypeParamsResponse,
    inputOptionsResponse,
    outputOptionsResponse,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
