import React, {useEffect, useState} from 'react';

import {toast} from '@/hooks/use-toast';
import {orchestraBackendInstance} from '@/lib/axios';
import {TaskDetailTabsProps, TaskDetails} from '@/types/databaseTypes';
import {Calendar, Code, Plus, Tag, Trash2} from 'lucide-react';
import {mutate} from 'swr';

import {Badge} from '@rn/ui/components/ui/badge';
import {Button} from '@rn/ui/components/ui/button';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@rn/ui/components/ui/dialog';
import {Input} from '@rn/ui/components/ui/input';
import {Label} from '@rn/ui/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@rn/ui/components/ui/tabs';
import {Textarea} from '@rn/ui/components/ui/textarea';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@rn/ui/components/ui/tooltip';

import DisabledTooltip from './DisabledTooltip';

export const TaskDetailTabs: React.FC<TaskDetailTabsProps> = ({selectedTask, onSave, onDelete}) => {
  const [currentTab, setCurrentTab] = useState('properties');
  const [localTask, setLocalTask] = useState<TaskDetails>(selectedTask);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const TASKS_ENDPOINT = '/api/v1/tasks/';

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
          <TabsTrigger
            value="parameters"
            className="flex-1"
          >
            Parameters
          </TabsTrigger>
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
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Task Language</Label>
              <DisabledTooltip isDisabled={selectedTask.is_predefined}>
                <Select
                  value={localTask.task_language || 'python'}
                  onValueChange={(value) => handleInputChange('task_language', value)}
                  disabled={localTask.is_predefined}
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
          </div>
        </TabsContent>

        <TabsContent
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
        </TabsContent>
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
