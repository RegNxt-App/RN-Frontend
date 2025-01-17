import {Workflow, WorkflowDialogProps} from '@/types/databaseTypes';

import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@rn/ui/components/ui/dialog';

import {WorkflowEditor} from './WorkflowEditor';

export const WorkflowDialog: React.FC<WorkflowDialogProps> = ({open, onOpenChange, workflow}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-7xl">
        <DialogHeader>
          <DialogTitle>{workflow ? `Edit Workflow: ${workflow.label}` : 'Create New Workflow'}</DialogTitle>
        </DialogHeader>
        <WorkflowEditor className="mt-4" />
      </DialogContent>
    </Dialog>
  );
};
