import React from 'react';

import {useWorkflow} from '@/contexts/WorkflowContext';
import {WorkflowDialogProps} from '@/types/databaseTypes';

import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@rn/ui/components/ui/dialog';

import {WorkflowEditor} from './WorkflowEditor';

export const WorkflowDialog: React.FC<WorkflowDialogProps> = ({open, onOpenChange}) => {
  const {workflow, isEditing} = useWorkflow();

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-7xl">
        <DialogHeader>
          <DialogTitle>{isEditing ? `Edit Workflow: ${workflow?.label}` : 'Create New Workflow'}</DialogTitle>
        </DialogHeader>
        <WorkflowEditor className="mt-4" />
      </DialogContent>
    </Dialog>
  );
};
