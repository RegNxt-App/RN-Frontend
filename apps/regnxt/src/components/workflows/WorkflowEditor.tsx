import React from 'react';

import '@xyflow/react/dist/style.css';

import {FlowCanvas} from '@/components/workflows/FlowCanvas';
import {TaskPanel} from '@/components/workflows/TaskPanel';
import {useBackend} from '@/contexts/BackendContext';
import {toast} from '@/hooks/use-toast';

interface WorkflowEditorProps {
  className?: string;
  workflow: any;
  isNew?: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
}

export const WorkflowEditor: React.FC<WorkflowEditorProps> = ({
  className,
  workflow,
  isNew = false,
  onOpenChange,
  onRefresh,
}) => {
  const {backendInstance} = useBackend();
  const handleSave = async (tasks: any[]) => {
    try {
      if (isNew) {
        await backendInstance.post('/api/v1/workflows/', {
          ...workflow,
          tasks,
        });
      } else {
        await backendInstance.put(`/api/v1/workflows/${workflow.workflow_id}/dag/`, {
          tasks,
        });
      }
      onOpenChange(false);
      onRefresh();

      toast({
        title: 'Success',
        description: `Workflow ${isNew ? 'created' : 'updated'} successfully`,
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isNew ? 'create' : 'update'} workflow`,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className={className}>
      <div className="flex h-[600px] gap-4">
        <TaskPanel />
        <FlowCanvas
          workflow={workflow}
          onSave={isNew ? handleSave : undefined}
          className="flex-1"
        />
      </div>
    </div>
  );
};
