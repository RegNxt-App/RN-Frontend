import {useMemo} from 'react';

import {SharedDataTable} from '@/components/SharedDataTable';
import {TooltipWrapper} from '@/components/TooltipWrapper';
import {Workflow} from '@/types/databaseTypes';
import {ColumnDef} from '@tanstack/react-table';
import {Clock, Edit, Play} from 'lucide-react';

import {Badge} from '@rn/ui/components/ui/badge';
import {Button} from '@rn/ui/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@rn/ui/components/ui/card';

interface WorkflowTableProps {
  workflows: Workflow[];
  onPlayClick: (workflow: Workflow) => void;
  onClockClick: (workflow: Workflow) => void;
  onEditClick: (workflow: Workflow) => void;
}

const WorkflowTable: React.FC<WorkflowTableProps> = ({workflows, onPlayClick, onClockClick, onEditClick}) => {
  const columns = useMemo<ColumnDef<Workflow>[]>(
    () => [
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
        accessorKey: 'last_deployed',
        header: 'Status',
        cell: ({row}) => {
          const isDeployed = row.original.last_deployed !== null;
          return (
            <Badge
              variant={isDeployed ? 'default' : 'secondary'}
              className={
                isDeployed ? 'bg-green-100 text-green-800 hover:text-white' : 'bg-gray-100 text-gray-800'
              }
            >
              {isDeployed ? 'Deployed' : 'Not Deployed'}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({row}) => {
          const workflow = row.original;
          const isDeployed = workflow.last_deployed !== null;

          return (
            <div className="flex space-x-2">
              <TooltipWrapper
                disabled={!isDeployed}
                disabledMessage="Workflow must be deployed before running"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onPlayClick(workflow)}
                  disabled={!isDeployed}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </TooltipWrapper>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onClockClick(workflow)}
                title="View History"
              >
                <Clock className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEditClick(workflow)}
                title="Edit Workflow"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [onPlayClick, onClockClick, onEditClick]
  );

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Workflows</CardTitle>
      </CardHeader>
      <CardContent>
        <SharedDataTable
          data={workflows}
          columns={columns}
          showPagination={true}
        />
      </CardContent>
    </Card>
  );
};

export default WorkflowTable;
