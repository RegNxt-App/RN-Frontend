import React, {useCallback, useEffect, useMemo, useState} from 'react';

import Loader from '@/common/Loader';
import {toast} from '@/hooks/use-toast';
import {orchestraBackendInstance} from '@/lib/axios';
import {ApiTask, StatItem, TaskDetails, TaskSubType, TaskType, TasksApiResponse} from '@/types/databaseTypes';
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronRight,
  Clock,
  CodeXml,
  FileText,
  Folder,
  FolderOpen,
  Loader2,
  Plus,
  Save,
  Search,
  Settings2,
} from 'lucide-react';
import useSWR, {mutate} from 'swr';
import * as z from 'zod';

import {Badge} from '@rn/ui/components/ui/badge';
import {Button} from '@rn/ui/components/ui/button';
import {Card} from '@rn/ui/components/ui/card';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@rn/ui/components/ui/dialog';
import {Input} from '@rn/ui/components/ui/input';
import {Label} from '@rn/ui/components/ui/label';
import {ScrollArea} from '@rn/ui/components/ui/scroll-area';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';
import {Tabs, TabsList, TabsTrigger} from '@rn/ui/components/ui/tabs';
import {Textarea} from '@rn/ui/components/ui/textarea';

import {TaskDetailTabs} from './TaskDetailTabs';

const formSchema = z.object({
  task_type_id: z.number().min(1, 'Task type is required'),
  code: z
    .string()
    .min(1, 'Code is required')
    .regex(/^[a-zA-Z0-9_]+$/, 'Invalid code format'),
  label: z.string().min(1, 'Label is required'),
  description: z.string().optional(),
  context: z.string().min(1, 'Context is required'),
  task_language: z.string().min(1, 'Task language is required'),
  task_code: z.string().min(1, 'Task code is required'),
});
type FormValues = z.infer<typeof formSchema>;

export const TaskAccordion: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTask, setCurrentTask] = useState<ApiTask | Partial<ApiTask> | null>(null);
  const [selectedTaskType, setSelectedTaskType] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [taskSubTypes, setTaskSubTypes] = useState<TaskSubType[]>([]);
  const [selectedTaskSubType, setSelectedTaskSubType] = useState<string | null>(null);
  const [isLoadingSubTypes, setIsLoadingSubTypes] = useState(false);
  const [expandedSubtypes, setExpandedSubtypes] = useState<string[]>([]);

  const TASKS_ENDPOINT = '/api/v1/tasks/';
  const TASK_TYPES_ENDPOINT = '/api/v1/tasks/task_type_list/';

  const {
    data: response,
    error,
    isLoading,
  } = useSWR<TasksApiResponse>(TASKS_ENDPOINT, orchestraBackendInstance, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    onSuccess: (data) => {
      if (selectedTask) {
        const refreshedTask = data.data.find((task) => task.task_id === selectedTask.task_id);
        if (refreshedTask) {
          setSelectedTask(refreshedTask);
        }
      }
    },
  });
  const fetchAllSubtypes = async () => {
    try {
      if (!taskTypes.length) return;

      const promises = taskTypes.map((type) =>
        orchestraBackendInstance.get(`/api/v1/tasks/${type.task_type_id}/subtasks/`)
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

  const {data: taskTypesResponse, error: taskTypesError} = useSWR<TaskType[]>(
    TASK_TYPES_ENDPOINT,
    async (url: string) => {
      const response = await orchestraBackendInstance.get(url);
      return response.data;
    }
  );

  const handleTaskTypeChange = (value: string) => {
    setSelectedTaskType(value);
    setSelectedTaskSubType(null);
  };
  const getSubtypesByTaskType = useCallback(
    (taskTypeId: number | null) => {
      if (!taskTypeId) return [];
      return taskSubTypes.filter((subtype) => subtype.task_type_id === taskTypeId);
    },
    [taskSubTypes]
  );
  const tasks = response?.data ?? [];
  const taskTypes = taskTypesResponse || [];

  if (taskTypesError) {
    return <div className="text-red-500">Error loading task types: {taskTypesError.message}</div>;
  }

  const stats = useMemo(() => {
    const defaultStats: StatItem[] = [
      {
        title: 'Total Tasks',
        count: '0',
        description: 'Active across 0 categories',
        titleIcon: <FileText className="w-4 h-4" />,
        descriptionIcon: <ArrowLeftRight className="w-3 h-3 text-gray-400" />,
      },
      {
        title: 'Predefined Tasks',
        count: '0',
        description: 'System defined templates',
        titleIcon: <CodeXml className="w-4 h-4" />,
        descriptionIcon: <Save className="w-3 h-3 text-gray-400" />,
      },
      {
        title: 'Custom Tasks',
        count: '0',
        description: 'User defined workflows',
        titleIcon: <Settings2 className="w-4 h-4" />,
        descriptionIcon: <Plus className="w-3 h-3 text-gray-400" />,
      },
      {
        title: 'Last Updated',
        count: new Date().toLocaleDateString(),
        description: new Date().toLocaleTimeString(),
        titleIcon: <Clock className="w-4 h-4" />,
        descriptionIcon: <ArrowLeftRight className="w-3 h-3 text-gray-400" />,
      },
    ];

    if (!Array.isArray(tasks)) return defaultStats;

    const now = new Date();
    const totalTasks = tasks.length;
    const predefinedTasks = tasks.filter((t) => t.is_predefined).length;
    const customTasks = totalTasks - predefinedTasks;
    const categories = new Set(tasks.map((t) => t.task_type_label)).size;

    return [
      {
        ...defaultStats[0],
        count: totalTasks.toString(),
        description: `Active across ${categories} categories`,
      },
      {
        ...defaultStats[1],
        count: predefinedTasks.toString(),
      },
      {
        ...defaultStats[2],
        count: customTasks.toString(),
      },
      {
        ...defaultStats[3],
        count: now.toLocaleDateString(),
        description: now.toLocaleTimeString(),
      },
    ];
  }, [tasks]);

  const handleEditTask = () => {
    setIsEditing(true);
  };

  const handleSaveTask = async () => {
    const updatedTask = tasks.find((task) => task.task_id === selectedTask?.task_id);
    if (updatedTask) {
      setSelectedTask(updatedTask);
    }
    setIsEditing(false);
  };

  const toggleCategory = useCallback((categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName) ? prev.filter((name) => name !== categoryName) : [...prev, categoryName]
    );
  }, []);

  const taskCategories = useMemo(() => {
    if (!Array.isArray(tasks) || tasks.length === 0) return [];

    const groupedByType = tasks.reduce((acc: Record<string, any>, task) => {
      const typeKey = task.task_type_label;
      const subtypeKey = task.task_subtype_id;

      if (!acc[typeKey]) {
        acc[typeKey] = {
          type_id: task.task_type_id,
          type_code: task.task_type_code,
          label: task.task_type_label,
          subtypes: {},
        };
      }

      const subtypeInfo = taskSubTypes.find(
        (st) => st.task_subtype_id === task.task_subtype_id && st.task_type_id === task.task_type_id
      );

      if (!acc[typeKey].subtypes[subtypeKey]) {
        acc[typeKey].subtypes[subtypeKey] = {
          subtype_id: subtypeKey,
          label: subtypeInfo?.label || 'Unknown Subtype',
          tasks: [],
        };
      }

      acc[typeKey].subtypes[subtypeKey].tasks.push({
        ...task,
        isPredefined: task.is_predefined,
      });

      return acc;
    }, {});

    return Object.entries(groupedByType).map(([name, typeData]: [string, any]) => ({
      name,
      type_id: typeData.type_id,
      type_code: typeData.type_code,
      subtypes: Object.values(typeData.subtypes).map((subtype: any) => ({
        subtype_id: subtype.subtype_id,
        label: subtype.label,
        tasks: subtype.tasks,
        count: subtype.tasks.length,
      })),
      count: Object.values(typeData.subtypes).reduce(
        (acc: number, subtype: any) => acc + subtype.tasks.length,
        0
      ),
    }));
  }, [tasks, taskSubTypes]);
  useEffect(() => {
    if (taskTypes.length > 0) {
      fetchAllSubtypes();
    }
  }, [taskTypes]);
  const handleAddClick = () => {
    setIsAddDialogOpen(true);
    setCurrentTask({
      label: '',
      code: '',
      description: '',
      context: '',
      task_language: null,
      task_code: null,
    });
    setSelectedTaskType(null);
  };
  const handleCancel = () => {
    setIsAddDialogOpen(false);
    setCurrentTask(null);
  };
  const mapTaskToDetails = (task: TaskType): TaskDetails => {
    return {
      id: task.task_id,
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
      task_id: task.task_id,
    };
  };
  const handleSave = async () => {
    if (!currentTask || !selectedTaskType || !selectedTaskSubType || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const selectedTaskTypeObj = taskTypes.find((type) => type.label === selectedTaskType);
      const selectedSubTypeObj = taskSubTypes.find(
        (subtype) =>
          subtype.label === selectedTaskSubType && subtype.task_type_id === selectedTaskTypeObj?.task_type_id
      );

      if (!selectedTaskTypeObj || !selectedSubTypeObj) {
        console.error('Invalid task type or subtype selected');
        return;
      }

      const payload = {
        task_type_id: selectedTaskTypeObj.task_type_id,
        task_subtype_id: selectedSubTypeObj.task_subtype_id,
        code: currentTask.code,
        label: currentTask.label,
        description: currentTask.description,
        context: currentTask.context,
        is_predefined: false,
        task_language: currentTask.task_language,
        task_code: currentTask.task_code,
        component: selectedSubTypeObj.component,
        parameters: selectedSubTypeObj.parameters,
      };

      await orchestraBackendInstance.post('/api/v1/tasks/', payload);
      await mutate(TASKS_ENDPOINT);
      await fetchAllSubtypes();

      toast({
        title: 'Success',
        description: 'Task created successfully',
      });

      setIsAddDialogOpen(false);
      setCurrentTask(null);
      setSelectedTaskType(null);
      setSelectedTaskSubType(null);
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: 'Error',
        description: 'Failed to save task',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const filteredTaskCategories = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return taskCategories;

    return taskCategories
      .map((category) => ({
        ...category,
        subtypes: category.subtypes
          .map((subtype) => ({
            ...subtype,
            tasks: subtype.tasks.filter(
              (task) =>
                task.label?.toLowerCase().includes(query) ||
                task.code?.toLowerCase().includes(query) ||
                task.description?.toLowerCase().includes(query) ||
                task.task_type_label?.toLowerCase().includes(query)
            ),
          }))
          .filter((subtype) => subtype.tasks.length > 0),
        count: category.subtypes.reduce((acc, subtype) => acc + subtype.tasks.length, 0),
      }))
      .filter((category) => category.subtypes.length > 0);
  }, [taskCategories, searchQuery]);
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
    <div className="p-4 lg:p-6 max-w-screen-2xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 lg:mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-1">Task Management</h1>
          <p className="text-sm">Configure and manage your data processing tasks</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
          <Button onClick={handleAddClick}>Create a Task</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 lg:mb-8">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="p-4 lg:p-6"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold">{stat.title}</p>
                {stat.titleIcon}
              </div>
              <p className="text-2xl font-bold">{stat.count}</p>
              <div className="flex items-center gap-1.5">
                {stat.descriptionIcon}
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <Card className="w-full lg:w-80">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Task Categories</h2>
            <Tabs
              defaultValue="all"
              className="w-full"
            >
              <TabsList className="w-full mb-4">
                <TabsTrigger
                  value="all"
                  className="flex-1"
                >
                  All Tasks
                </TabsTrigger>
                <TabsTrigger
                  value="recent"
                  className="flex-1"
                >
                  Recent Tasks
                </TabsTrigger>
              </TabsList>

              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search a Task"
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <ScrollArea className="h-[calc(100vh-24rem)]">
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredTaskCategories.map((category) => (
                      <div
                        key={category.name}
                        className="space-y-1"
                      >
                        <div
                          className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                          onClick={() => toggleCategory(category.name)}
                        >
                          <div className="flex items-center">
                            {expandedCategories.includes(category.name) ? (
                              <ChevronDown className="w-4 h-4 mr-2" />
                            ) : (
                              <ChevronRight className="w-4 h-4 mr-2" />
                            )}
                            <Folder className="w-4 h-4 mr-2" />
                            <span className="text-sm font-medium">{category.name}</span>
                          </div>
                          <span className="text-sm text-gray-500">{category.count}</span>
                        </div>

                        {expandedCategories.includes(category.name) && (
                          <div className="ml-4 space-y-1">
                            {category.subtypes.map((subtype) => (
                              <div
                                key={subtype.subtype_id}
                                className="space-y-1"
                              >
                                <div
                                  className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                                  onClick={() => toggleSubtype(`${category.name}-${subtype.subtype_id}`)}
                                >
                                  <div className="flex items-center">
                                    {expandedSubtypes.includes(`${category.name}-${subtype.subtype_id}`) ? (
                                      <ChevronDown className="w-4 h-4 mr-2" />
                                    ) : (
                                      <ChevronRight className="w-4 h-4 mr-2" />
                                    )}
                                    <FolderOpen className="w-4 h-4 mr-2" />
                                    <span className="text-sm">{subtype.label}</span>
                                  </div>
                                  <span className="text-sm text-gray-500">{subtype.count}</span>
                                </div>

                                {expandedSubtypes.includes(`${category.name}-${subtype.subtype_id}`) && (
                                  <div className="ml-4 space-y-1">
                                    {subtype.tasks.map((task) => (
                                      <div
                                        key={task.task_id}
                                        className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                                        onClick={() => setSelectedTask(task)}
                                      >
                                        <div className="flex items-start min-w-0">
                                          <FileText className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                                          <div className="min-w-0 flex-1">
                                            <div className="text-sm truncate">{task.label}</div>
                                            <div className="text-xs text-gray-500 truncate">{task.code}</div>
                                          </div>
                                        </div>
                                        {task.isPredefined && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs flex-shrink-0 ml-2"
                                          >
                                            Predefined
                                          </Badge>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {searchQuery && filteredTaskCategories.length === 0 && (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                        <p className="text-gray-500">No tasks found matching "{searchQuery}"</p>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </Tabs>
          </div>
        </Card>

        <Card className="flex-1 p-4 lg:p-6">
          {selectedTask ? (
            <TaskDetailTabs
              selectedTask={mapTaskToDetails(selectedTask)}
              isEditing={isEditing}
              onEdit={handleEditTask}
              onSave={handleSaveTask}
              onDelete={() => {
                setSelectedTask(null);
              }}
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
      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen) handleCancel();
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          {currentTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-code">Code</Label>
                  <Input
                    id="task-code"
                    value={currentTask.code || ''}
                    onChange={(e) => setCurrentTask({...currentTask, code: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-label">Label</Label>
                  <Input
                    id="task-label"
                    value={currentTask.label || ''}
                    onChange={(e) => setCurrentTask({...currentTask, label: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-context">Context</Label>
                  <Input
                    id="task-context"
                    value={currentTask.context || ''}
                    onChange={(e) => setCurrentTask({...currentTask, context: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-language">Task Language</Label>
                  <Select
                    value={currentTask.task_language || ''}
                    onValueChange={(value) => setCurrentTask({...currentTask, task_language: value})}
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
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="task-type">Task Type</Label>
                  <Select
                    onValueChange={handleTaskTypeChange}
                    value={selectedTaskType || ''}
                  >
                    <SelectTrigger id="task-type">
                      <SelectValue placeholder="Select a task type" />
                    </SelectTrigger>
                    <SelectContent>
                      {taskTypes.map((taskType) => (
                        <SelectItem
                          key={taskType.task_type_id}
                          value={taskType.label}
                        >
                          {taskType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label htmlFor="task-subtype">Task Subtype</Label>
                  <Select
                    onValueChange={setSelectedTaskSubType}
                    value={selectedTaskSubType || ''}
                    disabled={!selectedTaskType || isLoadingSubTypes}
                  >
                    <SelectTrigger
                      id="task-subtype"
                      className="relative"
                    >
                      <SelectValue
                        placeholder={!selectedTaskType ? 'Select a task type first' : 'Select a task subtype'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedTaskType ? (
                        getSubtypesByTaskType(
                          taskTypes.find((t) => t.label === selectedTaskType)?.task_type_id || null
                        ).map((subType) => (
                          <SelectItem
                            key={subType.task_subtype_id}
                            value={subType.label}
                          >
                            {subType.label}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem
                          value="no-type"
                          disabled
                        >
                          Select a task type first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="task-description">Description</Label>
                  <Textarea
                    id="task-description"
                    value={currentTask.description || ''}
                    onChange={(e) => setCurrentTask({...currentTask, description: e.target.value})}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
