import React, {useState} from 'react';

import {useBackend} from '@/contexts/BackendContext';
import {toast} from '@/hooks/use-toast';
import {Task, TaskConfigurationResponse, TaskSubType} from '@/types/databaseTypes';
import {getDefaultLanguage} from '@/utils/taskUtils';
import {Loader2} from 'lucide-react';
import {mutate} from 'swr';

import {Button} from '@rn/ui/components/ui/button';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@rn/ui/components/ui/dialog';
import {Input} from '@rn/ui/components/ui/input';
import {Label} from '@rn/ui/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';
import {Textarea} from '@rn/ui/components/ui/textarea';

interface AddTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  taskTypes: any[];
  taskSubTypes: TaskSubType[];
  taskConfigurations: TaskConfigurationResponse | undefined;
}

export const AddTaskDialog: React.FC<AddTaskDialogProps> = ({
  isOpen,
  onOpenChange,
  taskTypes,
  taskSubTypes,
  taskConfigurations,
}) => {
  const {backendInstance} = useBackend();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTaskType, setSelectedTaskType] = useState<string | null>(null);
  const [selectedTaskSubType, setSelectedTaskSubType] = useState<string | null>(null);
  const [currentTask, setCurrentTask] = useState<Partial<Task>>({
    label: '',
    code: '',
    description: '',
    context: '',
    task_language: null,
    task_code: 'null',
  });

  const TASKS_ENDPOINT = '/api/v1/tasks/';

  const handleTaskTypeChange = (value: string) => {
    setSelectedTaskType(value);
    setSelectedTaskSubType(null);
  };

  const getSubtypesByTaskType = (taskTypeId: number | null) => {
    if (!taskTypeId) return [];
    return taskSubTypes.filter((subtype) => subtype.task_type_id === taskTypeId);
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

      const defaultTaskLanguage = getDefaultLanguage(
        selectedTaskTypeObj?.code || '',
        currentTask?.task_language || null,
        taskConfigurations
      );

      const payload = {
        task_type_id: selectedTaskTypeObj.task_type_id,
        task_subtype_id: selectedSubTypeObj.task_subtype_id,
        code: currentTask.code,
        label: currentTask.label,
        description: currentTask.description,
        context: currentTask.context,
        is_predefined: false,
        task_language: defaultTaskLanguage,
        task_code: currentTask.task_code,
        component: selectedSubTypeObj.component,
        parameters: selectedSubTypeObj.parameters,
      };

      await backendInstance.post(TASKS_ENDPOINT, payload);
      await mutate(TASKS_ENDPOINT);

      toast({
        title: 'Success',
        description: 'Task created successfully',
      });

      handleClose();
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

  const handleClose = () => {
    setCurrentTask({
      label: '',
      code: '',
      description: '',
      context: '',
      task_language: null,
      task_code: 'null',
    });
    setSelectedTaskType(null);
    setSelectedTaskSubType(null);
    onOpenChange(false);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleClose}
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
              <div className="space-y-2 col-span-2">
                <Label htmlFor="task-description">Description</Label>
                <Textarea
                  id="task-description"
                  value={currentTask.description || ''}
                  onChange={(e) => setCurrentTask({...currentTask, description: e.target.value})}
                />
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
                  disabled={!selectedTaskType}
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
                <Label htmlFor="task-context">Context</Label>
                <Input
                  id="task-context"
                  value={currentTask.context || ''}
                  onChange={(e) => setCurrentTask({...currentTask, context: e.target.value})}
                />
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
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
  );
};
