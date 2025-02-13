import React, {useCallback, useEffect, useState} from 'react';

import Loader from '@/common/Loader';
import {AddTaskDialog} from '@/components/Tasks/AddTaskDialog';
import {DeleteTaskDialog} from '@/components/Tasks/DeleteTaskDialog';
import {TaskList} from '@/components/Tasks/TaskList';
import {TaskStats} from '@/components/Tasks/TaskStats';
import {useBackend} from '@/contexts/BackendContext';
import {TaskConfigurationProvider} from '@/contexts/TaskConfigurationContext';
import {toast} from '@/hooks/use-toast';
import {useTaskCategories} from '@/hooks/useTaskCategories';
import {useTaskVariables} from '@/hooks/useTaskVariables';
import {
  DesignTimeParams,
  SubtypeParamsResponse,
  Task,
  TaskConfigurationResponse,
  TaskSubType,
  TasksApiResponse,
} from '@/types/databaseTypes';
import {FileText} from 'lucide-react';
import useSWR from 'swr';

import {Button} from '@rn/ui/components/ui/button';
import {Card} from '@rn/ui/components/ui/card';

import {TaskDetailTabs} from '../../../components/Tasks/TaskDetailTabs';

export const TaskAccordion: React.FC = () => {
  const {backendInstance} = useBackend();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [taskSubTypes, setTaskSubTypes] = useState<TaskSubType[]>([]);
  const [expandedSubtypes, setExpandedSubtypes] = useState<string[]>([]);
  const [currentTab, setCurrentTab] = useState('properties');
  const [localTask, setLocalTask] = useState<Task | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [designTimeParams, setDesignTimeParams] = useState<DesignTimeParams>({
    sourceId: null,
    sourceType: null,
    destinationId: null,
  });

  const TASKS_ENDPOINT = '/api/v1/tasks/';
  const TASK_TYPES_ENDPOINT = '/api/v1/tasks/task-type-list/';
  const {data: subtypeParamsResponse} = useSWR<SubtypeParamsResponse[]>(
    selectedTask?.task_subtype_id
      ? `/api/v1/tasks/${selectedTask.task_subtype_id}/subtype-parameters/`
      : null,
    async (url: string) => {
      const response = await backendInstance.get(url);
      return response.data;
    }
  );
  const {data: taskConfigurations, isLoading: isConfigLoading} = useSWR<TaskConfigurationResponse>(
    '/api/v1/tasks/tasks-configurations/',
    (url: string) => backendInstance.get(url).then((r) => r.data)
  );
  useEffect(() => {
    if (selectedTask) {
      setLocalTask(mapTaskToDetails(selectedTask));
    }
  }, [selectedTask]);

  const {
    data: response,
    error,
    isLoading,
  } = useSWR<TasksApiResponse>(
    TASKS_ENDPOINT,
    async (url) => {
      const response = await backendInstance.get(url);
      return response.data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      onSuccess: (data) => {
        if (selectedTask && data?.results) {
          const refreshedTask = data.results.find((task) => task.task_id === selectedTask.task_id);
          if (refreshedTask) {
            setSelectedTask(refreshedTask);
          }
        }
      },
    }
  );
  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };
  const handleDeleteSuccess = () => {
    setIsDeleteDialogOpen(false);
    setTaskToDelete(null);
    setSelectedTask(null);
  };

  const handleInputChange = (field: keyof Task, value: string) => {
    setLocalTask((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [field]: value,
      };
    });
  };
  const handleSaveChanges = async () => {
    if (!localTask) return;

    setIsSaving(true);
    const parameters = [];

    const inputVariableId = variablesResponse?.find(
      (v) => v.name.toLowerCase().includes('input') && v.name.toLowerCase().includes('dataset')
    )?.variable_id;

    const outputVariableId = variablesResponse?.find(
      (v) => v.name.toLowerCase().includes('output') && v.name.toLowerCase().includes('dataset')
    )?.variable_id;

    let parameterCount = 1;
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
        task_type_id: localTask.task_type_id,
        label: localTask.label,
        description: localTask.description,
        context: localTask.context,
        task_language: localTask.task_language,
        task_code: localTask.task_code,
        parameters: getParametersPayload(designTimeParams),
      };

      const {data} = await backendInstance.put(`/api/v1/tasks/${localTask.task_id}/`, payload);

      setLocalTask((prev) =>
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

      setIsSaving(false);
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      });
      setIsSaving(false);
    }
  };
  const fetchAllSubtypes = async () => {
    try {
      if (!taskTypes.length) return;

      const promises = taskTypes.map((type) =>
        backendInstance.get(`/api/v1/tasks/${type.task_type_id}/subtasks/`)
      );
      const responses = await Promise.all(promises);
      const allSubtypes = responses.flatMap((response) => response.data);
      setTaskSubTypes(allSubtypes);
    } catch (error) {
      console.error('Error fetching subtypes:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch subtypes',
        variant: 'destructive',
      });
    }
  };

  const {data: taskTypesResponse, error: taskTypesError} = useSWR<{
    count: number;
    num_pages: number;
    results: Task[];
  }>(TASK_TYPES_ENDPOINT, async (url: string) => {
    const response = await backendInstance.get(url);
    return response.data;
  });

  const tasks = response?.results ?? [];
  const taskTypes = taskTypesResponse?.results || [];

  const {taskCategories, filteredCategories} = useTaskCategories(tasks, taskSubTypes, searchQuery);
  const {variablesResponse, inputOptionsResponse, outputOptionsResponse, getParametersPayload} =
    useTaskVariables(selectedTask, subtypeParamsResponse);

  if (taskTypesError) {
    return <div className="text-red-500">Error loading task types: {taskTypesError.message}</div>;
  }

  const toggleCategory = useCallback((categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName) ? prev.filter((name) => name !== categoryName) : [...prev, categoryName]
    );
  }, []);

  useEffect(() => {
    if (taskTypes.length > 0) {
      fetchAllSubtypes();
    }
  }, [taskTypes]);

  const mapTaskToDetails = (task: Task): Task => {
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
  };

  const toggleSubtype = useCallback((subtypeKey: string) => {
    setExpandedSubtypes((prev) =>
      prev.includes(subtypeKey) ? prev.filter((key) => key !== subtypeKey) : [...prev, subtypeKey]
    );
  }, []);

  if (isLoading) {
    return <Loader />;
  }
  if (error) {
    return <div className="text-red-500 p-4 text-center">Error loading tasks: {error.message}</div>;
  }
  return (
    <TaskConfigurationProvider
      taskConfigurations={taskConfigurations}
      isLoading={isConfigLoading}
    >
      <div className="p-4 lg:p-6 max-w-screen-2xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 lg:mb-8 space-y-4 md:space-y-0">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold mb-1">Task Management</h1>
            <p className="text-sm">Configure and manage your data processing tasks</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <Button onClick={() => setIsAddDialogOpen(true)}>Create a Task</Button>
          </div>
        </div>
        <TaskStats tasks={tasks} />
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          <TaskList
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categories={filteredCategories}
            expandedCategories={expandedCategories}
            expandedSubtypes={expandedSubtypes}
            onCategoryToggle={(category) => toggleCategory(category)}
            onSubtypeToggle={(subtypeKey) => toggleSubtype(subtypeKey)}
            onTaskSelect={(task) => setSelectedTask(task)}
          />

          <Card className="flex-1 p-4 lg:p-6">
            {selectedTask ? (
              <TaskDetailTabs
                selectedTask={mapTaskToDetails(selectedTask)}
                currentTab={currentTab}
                setCurrentTab={setCurrentTab}
                localTask={localTask || mapTaskToDetails(selectedTask)}
                setLocalTask={setLocalTask}
                isSaving={isSaving}
                setIsSaving={setIsSaving}
                designTimeParams={designTimeParams}
                setDesignTimeParams={setDesignTimeParams}
                onSave={handleSaveChanges}
                onDeleteClick={() => handleDeleteClick(selectedTask)}
                inputOptionsResponse={inputOptionsResponse}
                outputOptionsResponse={outputOptionsResponse}
                variablesResponse={variablesResponse}
                onInputChange={handleInputChange}
                subtypeParamsResponse={subtypeParamsResponse}
              />
            ) : (
              <div className="h-[calc(100vh-16rem)] flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-3xl font-bold mb-2">No Task Selected</h3>
                  <p>Select a task from the task browser to view and edit its details</p>
                </div>
              </div>
            )}
          </Card>
        </div>
        <AddTaskDialog
          isOpen={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          taskTypes={taskTypes}
          taskSubTypes={taskSubTypes}
          taskConfigurations={taskConfigurations}
        />

        <DeleteTaskDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          taskToDelete={taskToDelete}
          onSuccess={handleDeleteSuccess}
        />
      </div>
    </TaskConfigurationProvider>
  );
};
