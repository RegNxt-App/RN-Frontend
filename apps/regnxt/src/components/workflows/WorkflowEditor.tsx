import React from 'react';

import '@xyflow/react/dist/style.css';

import {FlowCanvas} from '@/components/workflows/FlowCanvas';
import {TaskPanel} from '@/components/workflows/TaskPanel';
import {toast} from '@/hooks/use-toast';
import {orchestraBackendInstance} from '@/lib/axios';

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
  const handleSave = async (tasks: any[]) => {
    try {
      if (isNew) {
        await orchestraBackendInstance.post('/api/v1/workflows/', {
          ...workflow,
          tasks,
        });

        onOpenChange(false);
        onRefresh();
      } else {
        await orchestraBackendInstance.put(`/api/v1/workflows/${workflow.workflow_id}/dag/`, {
          tasks,
        });
      }

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
