import React, {useEffect, useState} from 'react';

import {toast} from '@/hooks/use-toast';
import {orchestraBackendInstance} from '@/lib/axios';
import {
  DesignTimeParameters,
  RuntimeParameter,
  TaskDetailTabsProps,
  TaskDetails,
} from '@/types/databaseTypes';
import {Calendar, Code, Plus, Tag, Trash2} from 'lucide-react';
import {mutate} from 'swr';

import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@rn/ui/components/ui/accordion';
import {Badge} from '@rn/ui/components/ui/badge';
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
import {dummyDatasets} from './dummyData';

export const TaskDetailTabs: React.FC<TaskDetailTabsProps> = ({selectedTask, onSave, onDelete}) => {
  const [currentTab, setCurrentTab] = useState('properties');
  const [localTask, setLocalTask] = useState<TaskDetails>(selectedTask);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [designTimeParams, setDesignTimeParams] = useState<DesignTimeParameters>({
    sourceId: '',
    sourceType: 'dataset',
    destinationId: '',
  });

  const [runtimeParams, setRuntimeParams] = useState<RuntimeParameter[]>([]);

  const TASKS_ENDPOINT = '/api/v1/tasks/';

  const handleAddDesignParameter = () => {
    const newParam = {
      id: `design-${Date.now()}`,
      name: 'New Parameter',
      type: 'string',
      value: '',
      description: 'Design time parameter',
    };
    setDesignTimeParams([...designTimeParams]);
  };

  const handleRemoveDesignParameter = (id: string) => {
    setDesignTimeParams((prevParams) => {
      const updatedParams = {...prevParams};
      return updatedParams;
    });
  };

  const handleDesignParameterChange = (id: string, value: string) => {
    setDesignTimeParams((prevParams) => ({
      ...prevParams,
    }));
  };

  const handleAddRuntimeParameter = () => {
    const newParam: RuntimeParameter = {
      id: `runtime-${Date.now()}`,
      name: 'New Parameter',
      type: 'string',
      defaultValue: '',
      description: 'Runtime parameter',
    };
    setRuntimeParams([...runtimeParams, newParam]);
  };

  const handleRemoveRuntimeParameter = (id: string) => {
    setRuntimeParams((prevParams) => prevParams.filter((param) => param.id !== id));
  };

  const handleRuntimeParameterChange = (id: string, value: string) => {
    setRuntimeParams((prevParams) =>
      prevParams.map((param) => (param.id === id ? {...param, value} : param))
    );
  };

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

      setLocalTask((prev) => ({
        ...prev,
        ...data,
      }));

      await mutate(TASKS_ENDPOINT);

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
            ) : selectedTask.task_type_id === 2 && selectedTask.task_subtype_id === 17 ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Input Location</Label>
                    <DisabledTooltip isDisabled={selectedTask.is_predefined}>
                      <Select
                        value={designTimeParams.inputLocation || ''}
                        onValueChange={(value) =>
                          setDesignTimeParams((prev) => ({...prev, inputLocation: value}))
                        }
                        disabled={selectedTask.is_predefined}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select input location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="location1">Location 1</SelectItem>
                          <SelectItem value="location2">Location 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </DisabledTooltip>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Output Location</Label>
                    <DisabledTooltip isDisabled={selectedTask.is_predefined}>
                      <Select
                        value={designTimeParams.outputLocation || ''}
                        onValueChange={(value) =>
                          setDesignTimeParams((prev) => ({...prev, outputLocation: value}))
                        }
                        disabled={selectedTask.is_predefined}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select output location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="location1">Location 1</SelectItem>
                          <SelectItem value="location2">Location 2</SelectItem>
                        </SelectContent>
                      </Select>
                    </DisabledTooltip>
                  </div>
                </div>

                {designTimeParams.inputLocation && designTimeParams.outputLocation && (
                  <Card className="mt-6">
                    <div className="p-4">
                      <div className="flex gap-4">
                        <div className="w-[30%] border-r pr-4">
                          <Accordion
                            type="single"
                            collapsible
                          >
                            <AccordionItem value="input-fields">
                              <AccordionTrigger>Input Fields</AccordionTrigger>
                              <AccordionContent className="space-y-2">
                                <div className="p-2 hover:bg-gray-100 cursor-pointer">Field 1</div>
                                <div className="p-2 hover:bg-gray-100 cursor-pointer">Field 2</div>
                              </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="runtime-params">
                              <AccordionTrigger>Runtime Parameters</AccordionTrigger>
                              <AccordionContent className="space-y-2">
                                {runtimeParams.map((param) => (
                                  <div
                                    key={param.id}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                  >
                                    {param.name}
                                  </div>
                                ))}
                              </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="operators">
                              <AccordionTrigger>SQL Operators</AccordionTrigger>
                              <AccordionContent className="space-y-2">
                                {['=', '>', '<', 'LIKE', 'IN', 'BETWEEN'].map((op) => (
                                  <div
                                    key={op}
                                    className="p-2 hover:bg-gray-100 cursor-pointer"
                                  >
                                    {op}
                                  </div>
                                ))}
                              </AccordionContent>
                            </AccordionItem>
                          </Accordion>
                        </div>

                        <div className="flex-1 space-y-4">
                          <div className="space-y-2">
                            <Label>Output Field 1</Label>
                            <Textarea
                              className="font-mono"
                              placeholder="Enter mapping expression..."
                              disabled={selectedTask.is_predefined}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Output Field 2</Label>
                            <Textarea
                              className="font-mono"
                              placeholder="Enter mapping expression..."
                              disabled={selectedTask.is_predefined}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddDesignParameter}
                  disabled={selectedTask.is_predefined}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Parameter
                </Button>
              </div>

              {Object.keys(designTimeParams).length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {selectedTask.task_type_code === 'transform' ? (
                    <>
                      <div className="space-y-2">
                        <Label>Source Type</Label>
                        <Select
                          value={designTimeParams.sourceType}
                          onValueChange={(value: 'dataset' | 'dataview') =>
                            setDesignTimeParams((prev) => ({...prev, sourceType: value}))
                          }
                          disabled={selectedTask.is_predefined}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select source type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dataset">Dataset</SelectItem>
                            <SelectItem value="dataview">Dataview</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Destination Dataset</Label>
                        <Select
                          value={designTimeParams.destinationId || 'default'}
                          onValueChange={(value) =>
                            setDesignTimeParams((prev) => ({...prev, destinationId: value}))
                          }
                          disabled={selectedTask.is_predefined}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select destination" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              value="default"
                              disabled
                            >
                              Select a destination
                            </SelectItem>
                            {dummyDatasets.map((dataset) => (
                              <SelectItem
                                key={dataset.id}
                                value={dataset.id}
                              >
                                {dataset.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  ) : (
                    <div className="col-span-2 space-y-4">
                      {Object.entries(designTimeParams).map(([key, value]) => (
                        <div
                          key={key}
                          className="space-y-2"
                        >
                          <Label>{key}</Label>
                          <Input
                            value={value}
                            onChange={(e) =>
                              setDesignTimeParams((prev) => ({...prev, [key]: e.target.value}))
                            }
                            disabled={selectedTask.is_predefined}
                          />
                        </div>
                      ))}
                    </div>
                  )}
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
                  onClick={handleAddRuntimeParameter}
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
                          // onChange={(e) => handleRuntimeParamChange(param.id, 'name', e.target.value)}
                          disabled={selectedTask.is_predefined}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                          value={param.type}
                          // onValueChange={(value) => handleRuntimeParamChange(param.id, 'type', value)}
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
                          // onChange={(e) => handleRuntimeParamChange(param.id, 'defaultValue', e.target.value)}
                          disabled={selectedTask.is_predefined}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          value={param.description}
                          // onChange={(e) => handleRuntimeParamChange(param.id, 'description', e.target.value)}
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

        {/* <TabsContent
          value="parameters"
          className="space-y-4"
        >
          <div className="space-y-4">
            {[1, 2].map((param) => (
              <div
                key={param}
                className="p-4 border rounded-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Parameter {param}</Label>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs"
                      >
                        Badge
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={selectedTask.is_predefined}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <DisabledTooltip isDisabled={selectedTask.is_predefined}>
                    <Input
                      value={param === 1 ? 'default_1' : 'False'}
                      disabled={selectedTask.is_predefined}
                    />
                  </DisabledTooltip>
                  <p className="text-sm text-gray-500">Configuration parameter {param} for task 1</p>
                </div>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="mb-4"
            disabled={selectedTask.is_predefined}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add a new Parameter
          </Button>
        </TabsContent> */}
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
