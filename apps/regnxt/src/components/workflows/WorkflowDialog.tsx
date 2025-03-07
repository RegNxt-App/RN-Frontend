import React, {useState} from 'react';

import {useWorkflow} from '@/contexts/WorkflowContext';
import {Workflow} from '@/types/databaseTypes';

import {Dialog, DialogContent} from '@rn/ui/components/ui/dialog';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@rn/ui/components/ui/tabs';

import {WorkflowEditor} from './WorkflowEditor';
import {WorkflowForm} from './WorkflowForm';

interface WorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow?: Workflow | null;
}

export const WorkflowDialog: React.FC<WorkflowDialogProps & {onRefresh: () => void}> = ({
  open,
  onOpenChange,
  onRefresh,
}) => {
  const {workflow, isEditing} = useWorkflow();
  const [activeTab, setActiveTab] = useState(isEditing ? 'editor' : 'details');
  const [workflowDetails, setWorkflowDetails] = useState(workflow);

  if (isEditing) {
    return (
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
      >
        <DialogContent className="max-w-7xl">
          <WorkflowEditor
            workflow={workflow}
            onOpenChange={onOpenChange}
            onRefresh={onRefresh}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-7xl">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Workflow Details</TabsTrigger>
            <TabsTrigger
              value="editor"
              disabled={!workflowDetails}
            >
              Workflow Structure
            </TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <WorkflowForm
              onNext={(details) => {
                setWorkflowDetails(details);
                setActiveTab('editor');
              }}
            />
          </TabsContent>
          <TabsContent value="editor">
            <WorkflowEditor
              workflow={workflowDetails}
              isNew={true}
              onOpenChange={onOpenChange}
              onRefresh={onRefresh}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
