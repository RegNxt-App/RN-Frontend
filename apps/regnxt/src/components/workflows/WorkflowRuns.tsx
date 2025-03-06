import {useMemo, useState} from 'react';

import {SharedDataTable} from '@/components/SharedDataTable';
import {useBackend} from '@/contexts/BackendContext';
import {toast} from '@/hooks/use-toast';
import {WorkflowRun} from '@/types/databaseTypes';
import {ColumnDef} from '@tanstack/react-table';
import {Loader2} from 'lucide-react';

import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@rn/ui/components/ui/dialog';

const WORKFLOWS_ENDPOINT = '/api/v1/workflows/';

interface WorkflowRunsProps {
  workflowId: number | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const WorkflowRuns: React.FC<WorkflowRunsProps> = ({workflowId, isOpen, onOpenChange}) => {
  const {backendInstance} = useBackend();
  const [workflowRuns, setWorkflowRuns] = useState<WorkflowRun[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useMemo(() => {
    const fetchWorkflowRuns = async () => {
      if (!workflowId || !isOpen) return;

      setIsLoading(true);
      try {
        const response = await backendInstance.get(`${WORKFLOWS_ENDPOINT}${workflowId}/runs/`);
        setWorkflowRuns(response.data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch workflow runs',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkflowRuns();
  }, [workflowId, isOpen, backendInstance]);

  const formatDateTime = (dateTimeString: string | null) => {
    if (!dateTimeString || dateTimeString === 'N/A') return 'N/A';
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString();
    } catch {
      return dateTimeString;
    }
  };

  const formatRuntime = (runtime: string | number) => {
    if (runtime === 'N/A') return runtime;
    if (typeof runtime === 'number') {
      return runtime.toFixed(2);
    }
    return runtime;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'running':
        return 'text-blue-600';
      case 'cancelled':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const runColumns = useMemo<ColumnDef<WorkflowRun>[]>(
    () => [
      {
        accessorKey: 'run_id',
        header: 'Run ID',
        cell: ({row}) => <div className="font-medium">{row.getValue('run_id')}</div>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({row}) => (
          <div className={getStatusColor(row.getValue('status'))}>{row.getValue('status')}</div>
        ),
      },
      {
        accessorKey: 'started_at',
        header: 'Started At',
        cell: ({row}) => formatDateTime(row.getValue('started_at')),
      },
      {
        accessorKey: 'completed_at',
        header: 'Completed At',
        cell: ({row}) => formatDateTime(row.getValue('completed_at')),
      },
      {
        accessorKey: 'total_runtime_seconds',
        header: 'Runtime (s)',
        cell: ({row}) => formatRuntime(row.getValue('total_runtime_seconds')),
      },
    ],
    []
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Workflow Run History</DialogTitle>
        </DialogHeader>
        <div className="max-h-[90vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : workflowRuns.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No run history available</div>
          ) : (
            <SharedDataTable
              data={workflowRuns}
              columns={runColumns}
              showPagination={true}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WorkflowRuns;
