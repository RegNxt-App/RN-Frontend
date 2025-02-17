import React, {useCallback, useMemo} from 'react';
import {useForm} from 'react-hook-form';

import {useBackend} from '@/contexts/BackendContext';
import {toast} from '@/hooks/use-toast';
import {TaskConfigurationResponse, TaskSubType} from '@/types/databaseTypes';
import {getDefaultLanguage} from '@/utils/taskUtils';
import {zodResolver} from '@hookform/resolvers/zod';
import {Loader2} from 'lucide-react';
import {mutate} from 'swr';
import {z} from 'zod';

import {Button} from '@rn/ui/components/ui/button';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@rn/ui/components/ui/dialog';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from '@rn/ui/components/ui/form';
import {Input} from '@rn/ui/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';
import {Textarea} from '@rn/ui/components/ui/textarea';

const taskFormSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  label: z.string().min(1, 'Label is required'),
  description: z.string(),
  context: z.string(),
  taskType: z.string().min(1, 'Task type is required'),
  taskSubType: z.string().min(1, 'Task subtype is required'),
  task_language: z.string().nullable(),
  task_code: z.string(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

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

  const TASKS_ENDPOINT = '/api/v1/tasks/';

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      code: '',
      label: '',
      description: '',
      context: '',
      taskType: '',
      taskSubType: '',
      task_language: null,
      task_code: 'null',
    },
  });

  const handleTaskTypeChange = useCallback(
    (value: string) => {
      form.setValue('taskType', value);
      form.setValue('taskSubType', '');
    },
    [form]
  );

  const getSubtypesByTaskType = useMemo(
    () => (taskTypeId: number | null) => {
      if (!taskTypeId) return [];
      return taskSubTypes.filter((subtype) => subtype.task_type_id === taskTypeId);
    },
    [taskSubTypes]
  );

  const handleSave = async (values: TaskFormValues) => {
    try {
      const selectedTaskTypeObj = taskTypes.find((type) => type.label === values.taskType);
      const selectedSubTypeObj = taskSubTypes.find(
        (subtype) =>
          subtype.label === values.taskSubType && subtype.task_type_id === selectedTaskTypeObj?.task_type_id
      );

      if (!selectedTaskTypeObj || !selectedSubTypeObj) {
        console.error('Invalid task type or subtype selected');
        return;
      }

      const defaultTaskLanguage = getDefaultLanguage(
        selectedTaskTypeObj?.code || '',
        values.task_language,
        taskConfigurations
      );

      const payload = {
        task_type_id: selectedTaskTypeObj.task_type_id,
        task_subtype_id: selectedSubTypeObj.task_subtype_id,
        code: values.code,
        label: values.label,
        description: values.description,
        context: values.context,
        is_predefined: false,
        task_language: defaultTaskLanguage,
        task_code: values.task_code,
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
    }
  };

  const handleClose = () => {
    form.reset();
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

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSave)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({field}) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="label"
                render={({field}) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({field}) => (
                  <FormItem className="space-y-2 col-span-2">
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taskType"
                render={({field}) => (
                  <FormItem className="space-y-2 col-span-2">
                    <FormLabel>Task Type</FormLabel>
                    <Select
                      onValueChange={handleTaskTypeChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a task type" />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taskSubType"
                render={({field}) => (
                  <FormItem className="space-y-2 col-span-2">
                    <FormLabel>Task Subtype</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!form.watch('taskType')}
                    >
                      <FormControl>
                        <SelectTrigger className="relative">
                          <SelectValue
                            placeholder={
                              !form.watch('taskType') ? 'Select a task type first' : 'Select a task subtype'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {form.watch('taskType') ? (
                          getSubtypesByTaskType(
                            taskTypes.find((t) => t.label === form.watch('taskType'))?.task_type_id || null
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="context"
                render={({field}) => (
                  <FormItem className="space-y-2 col-span-2">
                    <FormLabel>Context</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                type="button"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="w-full sm:w-auto"
              >
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Task'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
