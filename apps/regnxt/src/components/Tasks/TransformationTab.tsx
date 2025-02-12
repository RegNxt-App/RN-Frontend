import React, {useState} from 'react';

import {useBackend} from '@/contexts/BackendContext';
import {toast} from '@/hooks/use-toast';
import {DMSubtask, Task} from '@/types/databaseTypes';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {Loader2} from 'lucide-react';
import useSWR, {mutate} from 'swr';

import {Button} from '@rn/ui/components/ui/button';
import {Card} from '@rn/ui/components/ui/card';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from '@rn/ui/components/ui/dialog';
import {Input} from '@rn/ui/components/ui/input';
import {Label} from '@rn/ui/components/ui/label';
import {ScrollArea} from '@rn/ui/components/ui/scroll-area';
import {Textarea} from '@rn/ui/components/ui/textarea';

import {SortableItem} from './SortableItem';

interface TransformationTabProps {
  disabled?: boolean;
  onSave?: () => void;
  selectedTask: Task | null;
}

export const TransformationTab: React.FC<TransformationTabProps> = ({disabled, selectedTask}) => {
  const {backendInstance} = useBackend();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedSubtask, setSelectedSubtask] = useState<DMSubtask | null>(null);
  const [newSubtask, setNewSubtask] = useState({
    label: '',
    description: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const subtasksEndpoint = selectedTask?.task_id
    ? `/api/v1/tasks/${selectedTask.task_id}/list-transformation-subtasks/`
    : null;

  const {data: subtasks = [], error, isLoading} = useSWR<DMSubtask[]>(subtasksEndpoint);

  const sortedSubtasks = React.useMemo(() => {
    return [...subtasks].sort((a, b) => a.order - b.order);
  }, [subtasks]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const {active, over} = event;

    if (!over || active.id === over.id) return;

    const oldIndex = sortedSubtasks.findIndex((item) => String(item.subtask_id) === active.id);
    const newIndex = sortedSubtasks.findIndex((item) => String(item.subtask_id) === over.id);

    const newSubtasks = arrayMove(sortedSubtasks, oldIndex, newIndex);

    const orderUpdates = newSubtasks.map((subtask, index) => ({
      subtask_id: subtask.subtask_id,
      order: index + 1,
    }));

    try {
      const updatedSubtasks = newSubtasks.map((subtask, index) => ({
        ...subtask,
        order: index + 1,
      }));
      mutate(subtasksEndpoint, updatedSubtasks, false);

      await backendInstance.put(`/api/v1/tasks/${selectedTask?.task_id}/update-subtask-order/`, {
        subtasks: orderUpdates,
      });

      mutate(subtasksEndpoint);

      toast({
        title: 'Success',
        description: 'Order updated successfully',
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order',
        variant: 'destructive',
      });
      mutate(subtasksEndpoint);
    }
  };

  const handleCreateSubtask = async () => {
    if (!selectedTask?.task_id) return;

    if (!newSubtask.label.trim()) {
      toast({
        title: 'Error',
        description: 'Label is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await backendInstance.post(
        `/api/v1/tasks/${selectedTask.task_id}/create-transformation-subtask/`,
        newSubtask
      );

      await mutate(subtasksEndpoint);

      toast({
        title: 'Success',
        description: 'Transformation created successfully',
      });

      setIsCreateDialogOpen(false);
      setNewSubtask({label: '', description: ''});
    } catch (error) {
      console.error('Error creating subtask:', error);
      toast({
        title: 'Error',
        description: 'Failed to create transformation',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Transformations</h2>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          disabled={disabled}
        >
          Create Transformation
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-4">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : (
                <>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={sortedSubtasks.map((item) => String(item.subtask_id))}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {sortedSubtasks.map((subtask) => (
                          <SortableItem
                            key={subtask.subtask_id}
                            id={String(subtask.subtask_id)}
                            disabled={disabled}
                            selected={selectedSubtask?.subtask_id === subtask.subtask_id}
                            label={subtask.label}
                            description={subtask.description}
                            onClick={() => setSelectedSubtask(subtask)}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>

                  {!sortedSubtasks.length && (
                    <div className="text-center py-8 text-gray-500">No transformations created yet</div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </Card>

        <Card className="col-span-8 p-6">
          {selectedSubtask ? (
            <div className="space-y-6">
              <div className="pb-4 border-b">
                <Label className="text-sm text-muted-foreground">Name</Label>
                <h3 className="text-lg font-medium mt-1">{selectedSubtask.label}</h3>
              </div>

              <div className="pb-4 border-b">
                <Label className="text-sm text-muted-foreground">Description</Label>
                <p className="mt-1 text-gray-600">
                  {selectedSubtask.description || 'No description provided'}
                </p>
              </div>

              <div className="pt-4 border-t">
                <Label className="text-sm text-muted-foreground">Output Fields</Label>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <pre className="text-sm">
                    {selectedSubtask.output_fields?.length
                      ? JSON.stringify(selectedSubtask.output_fields, null, 2)
                      : 'No output fields configured'}
                  </pre>
                </div>
              </div>

              <div className="pt-4">
                <Label className="text-sm text-muted-foreground">Filters</Label>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  <pre className="text-sm">
                    {selectedSubtask.filters?.length
                      ? JSON.stringify(selectedSubtask.filters, null, 2)
                      : 'No filters configured'}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">Select a transformation to view details</div>
          )}
        </Card>
      </div>

      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Transformation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Label</Label>
              <Input
                value={newSubtask.label}
                onChange={(e) =>
                  setNewSubtask((prev) => ({
                    ...prev,
                    label: e.target.value,
                  }))
                }
                placeholder="Enter transformation name"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newSubtask.description}
                onChange={(e) =>
                  setNewSubtask((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter transformation description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateSubtask}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransformationTab;
