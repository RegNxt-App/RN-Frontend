import {useState} from 'react';

import {SharedDataTable} from '@/components/SharedDataTable';
import {toast} from '@/hooks/use-toast';
import {orchestraBackendInstance} from '@/lib/axios';
import {Workflow, WorkflowParameter, WorkflowRun, WorkflowTask} from '@/types/databaseTypes';
import {ColumnDef} from '@tanstack/react-table';
import {Clock, Edit, Loader2, Play} from 'lucide-react';
import useSWR from 'swr';

import {Button} from '@rn/ui/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@rn/ui/components/ui/card';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@rn/ui/components/ui/dialog';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@rn/ui/components/ui/table';

import {WorkflowDialog} from './WorkflowDialog';

const WORKFLOWS_ENDPOINT = '/api/v1/workflows/';

const WorkflowManager = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [isRunsDialogOpen, setIsRunsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>([]);
  const [isWorkflowDialogOpen, setIsWorkflowDialogOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Workflow | null>(null);
  const [workflowTasks, setWorkflowTasks] = useState<WorkflowTask[]>([]);
  const columns: ColumnDef<Workflow>[] = [
    {
      accessorKey: 'code',
      header: 'Context',
      cell: ({row}) => <div className="font-medium">{row.getValue('code')}</div>,
    },
    {
      accessorKey: 'label',
      header: 'Workflow',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({row}) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handlePlayClick(row.original)}
            title="Start Workflow"
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleClockClick(row.original)}
            title="View History"
          >
            <Clock className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEditWorkflow(row.original)}
            title="Edit Workflow"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
  const {
    data: workflows = [],
    error,
    isLoading,
  } = useSWR<Workflow[]>(WORKFLOWS_ENDPOINT, async (url: string) => {
    const response = await orchestraBackendInstance.get(url);
    return response.data;
  });

  const {data: workflowParameters = [], isLoading: isLoadingParameters} = useSWR<WorkflowParameter[]>(
    selectedWorkflow ? `${WORKFLOWS_ENDPOINT}${selectedWorkflow.workflow_id}/parameters/` : null,
    async (url: string) => {
      const response = await orchestraBackendInstance.get(url);
      return response.data;
    }
  );

  const handlePlayClick = async (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setParameters({});
  };

  const handleClockClick = async (workflow: Workflow) => {
    try {
      const response = await orchestraBackendInstance.get(
        `${WORKFLOWS_ENDPOINT}${workflow.workflow_id}/runs/`
      );
      setWorkflowRuns(response.data);
      setIsRunsDialogOpen(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch workflow runs',
        variant: 'destructive',
      });
    }
  };

  const handleStartWorkflow = async () => {
    if (!selectedWorkflow) return;

    setIsSubmitting(true);
    try {
      await orchestraBackendInstance.post(
        `${WORKFLOWS_ENDPOINT}${selectedWorkflow.workflow_id}/start/`,
        parameters
      );

      toast({
        title: 'Success',
        description: 'Workflow started successfully',
      });

      setSelectedWorkflow(null);
      setParameters({});
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start workflow',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error) {
    return <div className="text-red-500 p-4 text-center">Error loading workflows: {error.message}</div>;
  }
  const handleEditWorkflow = async (workflow: Workflow) => {
    setEditingWorkflow(workflow);
    setIsWorkflowDialogOpen(true);
  };

  const handleCreateWorkflow = () => {
    setEditingWorkflow(null);
    setIsWorkflowDialogOpen(true);
  };

  return (
    <div className="p-4 lg:p-6 max-w-screen-2xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-1">Workflow Management</h1>
          <p className="text-sm">Configure and manage your workflow execution</p>
        </div>
        <Button
        // onClick={handleCreateWorkflow}
        >
          Create Workflow
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <SharedDataTable
              data={workflows}
              columns={columns}
              onRowClick={(item) => console.log()}
              showPagination={true}
            />
          </CardContent>
        </Card>

        <Card className="w-full lg:w-96">
          <CardHeader>
            <CardTitle>Start Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedWorkflow ? (
              <div className="space-y-4">
                <div className="text-sm font-medium">{selectedWorkflow.label}</div>
                {isLoadingParameters ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    {workflowParameters.map((param) => (
                      <div
                        key={param.name}
                        className="space-y-2"
                      >
                        <label className="text-sm font-medium">
                          {param.label}
                          <span className="text-xs text-gray-500 ml-1">({param.name})</span>
                        </label>
                        {param.is_enum ? (
                          <Select
                            value={parameters[param.name] || param.default_value}
                            onValueChange={(value) =>
                              setParameters((prev) => ({...prev, [param.name]: value}))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select value" />
                            </SelectTrigger>
                            <SelectContent>
                              {param.options?.length > 0 ? (
                                param.options.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={String(option.value)}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem
                                  disabled
                                  value="none"
                                >
                                  No options available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        ) : (
                          <input
                            type="text"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                            value={parameters[param.name] || param.default_value}
                            onChange={(e) =>
                              setParameters((prev) => ({
                                ...prev,
                                [param.name]: e.target.value,
                              }))
                            }
                          />
                        )}
                      </div>
                    ))}
                    <Button
                      className="w-full"
                      onClick={handleStartWorkflow}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Starting...
                        </>
                      ) : (
                        'Start Workflow'
                      )}
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">Select a workflow to start</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={isRunsDialogOpen}
        onOpenChange={setIsRunsDialogOpen}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Workflow Run History</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Started At</TableHead>
                <TableHead>Completed At</TableHead>
                <TableHead>Runtime (s)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflowRuns.map((run) => (
                <TableRow key={run['Run ID']}>
                  <TableCell>{run['Run ID']}</TableCell>
                  <TableCell>{run.Status}</TableCell>
                  <TableCell>{run['Started At']}</TableCell>
                  <TableCell>{run['Completed At']}</TableCell>
                  <TableCell>{run['Total Runtime (seconds)']}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
      <WorkflowDialog
        open={isWorkflowDialogOpen}
        onOpenChange={setIsWorkflowDialogOpen}
        workflow={editingWorkflow}
      />
    </div>
  );
};

export default WorkflowManager;
