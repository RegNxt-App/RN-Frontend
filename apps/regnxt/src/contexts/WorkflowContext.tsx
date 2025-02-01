import React, {createContext, useContext, useState} from 'react';

import {Workflow} from '@/types/databaseTypes';

interface WorkflowContextType {
  workflow: Workflow | null;
  isEditing: boolean;
  setWorkflow: (workflow: Workflow | null) => void;
  setIsEditing: (isEditing: boolean) => void;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const WorkflowProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const value = {
    workflow,
    isEditing,
    setWorkflow,
    setIsEditing,
  };

  return <WorkflowContext.Provider value={value}>{children}</WorkflowContext.Provider>;
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within a WorkflowProvider');
  }
  return context;
};
