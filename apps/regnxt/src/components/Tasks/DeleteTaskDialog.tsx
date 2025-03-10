import React from 'react';

import {useBackend} from '@/contexts/BackendContext';
import {toast} from '@/hooks/use-toast';
import {Task} from '@/types/databaseTypes';
import {mutate} from 'swr';

import {Button} from '@rn/ui/components/ui/button';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@rn/ui/components/ui/dialog';

interface DeleteTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  taskToDelete: Task | null;
  onSuccess: () => void;
}

export const DeleteTaskDialog: React.FC<DeleteTaskDialogProps> = ({
  isOpen,
  onOpenChange,
  taskToDelete,
  onSuccess,
}) => {
  const {backendInstance} = useBackend();
  const TASKS_ENDPOINT = '/api/v1/tasks/';

  const handleDelete = async () => {
    if (!taskToDelete?.task_id) {
      console.error('No task id found');
      return;
    }

    try {
      await backendInstance.delete(`/api/v1/tasks/${taskToDelete.task_id}/`);

      toast({
        title: 'Success',
        description: 'Task deleted successfully',
      });

      await mutate(TASKS_ENDPOINT);
      onSuccess();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete task',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Delete Task</DialogTitle>
        </DialogHeader>
        <p>Are you sure you want to delete task "{taskToDelete?.label}"? This action cannot be undone.</p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
