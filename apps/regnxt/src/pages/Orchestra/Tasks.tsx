import React, {useState} from 'react';

import {orchestraBackendInstance} from '@/lib/axios';
import {Edit2, Loader2, Trash2} from 'lucide-react';
import useSWR from 'swr';

import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@rn/ui/components/ui/accordion';
import {Button} from '@rn/ui/components/ui/button';
import {Card} from '@rn/ui/components/ui/card';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@rn/ui/components/ui/dialog';
import {Input} from '@rn/ui/components/ui/input';
import {Label} from '@rn/ui/components/ui/label';
import {Textarea} from '@rn/ui/components/ui/textarea';

interface ApiTask {
  task_type_id: number;
  task_type_code: string;
  task_type_label: string;
  task_id: number;
  code: string;
  label: string;
  description: string;
  context: string;
  is_predefined: boolean;
  task_language: string | null;
  task_code: string | null;
}

interface ApiResponse {
  data: ApiTask[];
}

export const TaskAccordion: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<ApiTask | null>(null);
  const [expandedType, setExpandedType] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ApiTask | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<ApiTask | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const {
    data: response,
    error,
    isLoading,
  } = useSWR<ApiResponse>('/api/v1/tasks/', orchestraBackendInstance, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const tasks = response?.data;

  const groupedTasks = React.useMemo(() => {
    if (!Array.isArray(tasks)) {
      return {};
    }

    return tasks.reduce((acc: Record<string, ApiTask[]>, task) => {
      if (!acc[task.task_type_label]) {
        acc[task.task_type_label] = [];
      }
      acc[task.task_type_label].push(task);
      return acc;
    }, {});
  }, [tasks]);

  const handleTaskSelect = (task: ApiTask) => {
    setSelectedTask(task);
  };

  const handleEditClick = (task: ApiTask) => {
    setEditingTask({...task});
    setIsEditDialogOpen(true);
  };

  const handleEditSave = async () => {
    if (!editingTask) return;

    // TODO: save logic here

    setIsEditDialogOpen(false);
    setEditingTask(null);
  };

  const handleEditCancel = () => {
    setIsEditDialogOpen(false);
    setEditingTask(null);
  };

  const handleDeleteClick = (task: ApiTask) => {
    setTaskToDelete(task);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) return;

    try {
      await orchestraBackendInstance.delete(`/api/v1/tasks/${taskToDelete.task_id}`);
      setIsDeleteDialogOpen(false);
      setTaskToDelete(null);
      if (selectedTask?.task_id === taskToDelete.task_id) {
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 text-center">Error loading tasks: {error.message}</div>;
  }

  if (!tasks) {
    return <div className="text-red-500 p-4 text-center">No tasks data available</div>;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      <div className="w-1/3 overflow-auto border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-4">Tasks</h2>
        <Accordion
          type="single"
          collapsible
          value={expandedType || ''}
          onValueChange={(value: string) => setExpandedType(value || null)}
        >
          {Object.entries(groupedTasks).map(([taskType, tasks]) => (
            <AccordionItem
              key={taskType}
              value={taskType}
            >
              <AccordionTrigger>
                <div className="flex justify-between w-full">
                  <span>{taskType}</span>
                  <span className="text-gray-500 text-sm">
                    {tasks.length} task{tasks.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-4">
                  {tasks.map((task) => (
                    <div
                      key={task.task_id}
                      className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                        selectedTask?.task_id === task.task_id ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => handleTaskSelect(task)}
                    >
                      <div className="text-sm font-medium">{task.label}</div>
                      <div className="text-xs text-gray-500">{task.code}</div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="w-2/3 overflow-auto">
        {selectedTask ? (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Task Details</h2>
              {!selectedTask.is_predefined && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditClick(selectedTask)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDeleteClick(selectedTask)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Label</Label>
                  <div className="p-2 bg-gray-50 rounded">{selectedTask.label}</div>
                </div>
                <div className="space-y-2">
                  <Label>Code</Label>
                  <div className="p-2 bg-gray-50 rounded">{selectedTask.code}</div>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>Description</Label>
                  <div className="p-2 bg-gray-50 rounded">{selectedTask.description}</div>
                </div>
                <div className="space-y-2">
                  <Label>Context</Label>
                  <div className="p-2 bg-gray-50 rounded">{selectedTask.context}</div>
                </div>
                <div className="space-y-2">
                  <Label>Task Language</Label>
                  <div className="p-2 bg-gray-50 rounded">{selectedTask.task_language || '-'}</div>
                </div>
                {selectedTask.task_code && (
                  <div className="space-y-2 col-span-2">
                    <Label>Task Code</Label>
                    <div className="p-2 bg-gray-50 rounded font-mono whitespace-pre-wrap">
                      {selectedTask.task_code}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a task to view details
          </div>
        )}
      </div>

      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-label">Label</Label>
                  <Input
                    id="edit-label"
                    value={editingTask.label}
                    onChange={(e) => setEditingTask({...editingTask, label: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-code">Code</Label>
                  <Input
                    id="edit-code"
                    value={editingTask.code}
                    onChange={(e) => setEditingTask({...editingTask, code: e.target.value})}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={editingTask.description}
                    onChange={(e) => setEditingTask({...editingTask, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-context">Context</Label>
                  <Input
                    id="edit-context"
                    value={editingTask.context}
                    onChange={(e) => setEditingTask({...editingTask, context: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-task-language">Task Language</Label>
                  <Input
                    id="edit-task-language"
                    value={editingTask.task_language || ''}
                    onChange={(e) => setEditingTask({...editingTask, task_language: e.target.value})}
                  />
                </div>
                {editingTask.task_code && (
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="edit-task-code">Task Code</Label>
                    <Textarea
                      id="edit-task-code"
                      value={editingTask.task_code}
                      onChange={(e) => setEditingTask({...editingTask, task_code: e.target.value})}
                      className="font-mono"
                      rows={10}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleEditCancel}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSave}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
