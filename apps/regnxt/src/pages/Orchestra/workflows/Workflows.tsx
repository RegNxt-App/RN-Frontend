import {useMemo, useState} from 'react';

import StartWorkflow from '@/components/workflows/StartWorkflow';
import {WorkflowDialog} from '@/components/workflows/WorkflowDialog';
import WorkflowRuns from '@/components/workflows/WorkflowRuns';
import WorkflowStats from '@/components/workflows/WorkflowStats';
import WorkflowTable from '@/components/workflows/WorkflowTable';
import {useBackend} from '@/contexts/BackendContext';
import {useWorkflow} from '@/contexts/WorkflowContext';
import {toast} from '@/hooks/use-toast';
import {Workflow, WorkflowParameter} from '@/types/databaseTypes';
import useSWR, {mutate} from 'swr';

import {Button} from '@rn/ui/components/ui/button';

const WORKFLOWS_ENDPOINT = '/api/v1/workflows/';

const WorkflowManager = () => {
  const {backendInstance} = useBackend();
  const {workflow, isEditing, setWorkflow, setIsEditing} = useWorkflow();
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isRunsDialogOpen, setIsRunsDialogOpen] = useState(false);
  const [isWorkflowDialogOpen, setIsWorkflowDialogOpen] = useState(false);
  const [selectedWorkflowForRuns, setSelectedWorkflowForRuns] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const {
    data: workflowsResponse,
    error,
    isLoading,
  } = useSWR<{
    count: number;
    num_pages: number;
    results: Workflow[];
  }>(WORKFLOWS_ENDPOINT, (url: string) => backendInstance.get(url).then((r) => r.data));

  const {data: workflowParameters = [], isLoading: isLoadingParameters} = useSWR<WorkflowParameter[]>(
    selectedWorkflow ? `${WORKFLOWS_ENDPOINT}${selectedWorkflow.workflow_id}/parameters/` : null,
    (url: string) => backendInstance.get(url).then((r) => r.data)
  );

  const workflows = workflowsResponse?.results || [];
  const filteredWorkflows = useMemo(() => {
    if (!searchQuery.trim()) {
      return workflows;
    }

    const query = searchQuery.toLowerCase();
    return workflows.filter(
      (workflow) =>
        workflow.label?.toLowerCase().includes(query) ||
        workflow.code?.toLowerCase().includes(query) ||
        workflow.description?.toLowerCase().includes(query)
    );
  }, [workflows, searchQuery]);

  const handlePlayClick = async (workflow: Workflow) => {
    try {
      setSelectedWorkflow(workflow);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch workflow parameters',
        variant: 'destructive',
      });
    }
  };

  const handleClockClick = (workflow: Workflow) => {
    setSelectedWorkflowForRuns(workflow.workflow_id);
    setIsRunsDialogOpen(true);
  };

  const handleEditWorkflow = (workflow: Workflow) => {
    setWorkflow(workflow);
    setIsEditing(true);
    setIsWorkflowDialogOpen(true);
  };

  const handleCreateWorkflow = () => {
    setWorkflow(null);
    setIsEditing(false);
    setIsWorkflowDialogOpen(true);
  };

  const handleCloseStartWorkflow = () => {
    setSelectedWorkflow(null);
  };

  const handleRefreshWorkflows = () => {
    mutate(WORKFLOWS_ENDPOINT);
  };

  const stats = useMemo(() => {
    if (!workflowsResponse?.results) {
      return {
        total: 0,
        active: 0,
        configured: 0,
        inactive: 0,
      };
    }

    const workflows = workflowsResponse.results;
    const total = workflows.length;

    const statusCounts = workflows.reduce(
      (acc, workflow) => {
        if (workflow.active && workflow.last_deployed) {
          acc.active++;
        } else if (workflow.active && !workflow.last_deployed) {
          acc.configured++;
        } else if (!workflow.active) {
          acc.inactive++;
        }
        return acc;
      },
      {
        active: 0,
        configured: 0,
        inactive: 0,
      }
    );

    return {
      total,
      ...statusCounts,
    };
  }, [workflowsResponse?.results]);

  if (error) {
    return <div className="text-red-500 p-4 text-center">Error loading workflows: {error.message}</div>;
  }

  return (
    <div className="p-4 lg:p-6 max-w-screen-2xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-1">Workflow Management</h1>
          <p className="text-sm">Configure and manage your workflow execution</p>
        </div>
        <Button onClick={handleCreateWorkflow}>Create Workflow</Button>
      </div>

      <WorkflowStats stats={stats} />

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <WorkflowTable
          workflows={filteredWorkflows}
          onPlayClick={handlePlayClick}
          onClockClick={handleClockClick}
          onEditClick={handleEditWorkflow}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        <StartWorkflow
          selectedWorkflow={selectedWorkflow}
          workflowParameters={workflowParameters}
          isLoadingParameters={isLoadingParameters}
          onClose={handleCloseStartWorkflow}
        />
      </div>
      <WorkflowRuns
        workflowId={selectedWorkflowForRuns}
        isOpen={isRunsDialogOpen}
        onOpenChange={setIsRunsDialogOpen}
      />
      <WorkflowDialog
        open={isWorkflowDialogOpen}
        onOpenChange={setIsWorkflowDialogOpen}
        workflow={workflow}
        onRefresh={handleRefreshWorkflows}
      />
    </div>
  );
};

export default WorkflowManager;
