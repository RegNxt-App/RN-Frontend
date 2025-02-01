import React from 'react';

import '@xyflow/react/dist/style.css';

import {FlowCanvas} from '@/components/workflows/FlowCanvas';
import {TaskPanel} from '@/components/workflows/TaskPanel';

interface WorkflowEditorProps {
  className?: string;
}

export const WorkflowEditor: React.FC<WorkflowEditorProps> = ({className}) => {
  return (
    <div className={className}>
      <div className="flex h-[600px] gap-4">
        <TaskPanel />
        <FlowCanvas />
      </div>
    </div>
  );
};
