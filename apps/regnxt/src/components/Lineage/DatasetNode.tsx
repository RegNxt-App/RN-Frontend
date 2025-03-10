import {memo} from 'react';

import {cn} from '@/lib/utils';
import {Handle, Node, NodeProps, Position} from '@xyflow/react';
import {Database} from 'lucide-react';

import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@rn/ui/components/ui/tooltip';

interface DatasetNodeData extends Node<Record<string, string>, string> {
  label: string;
  layer?: string;
  isSelected?: boolean;
}

const DatasetNode = ({data, isConnectable}: NodeProps<DatasetNodeData>) => {
  const {label, layer, isSelected} = data;

  return (
    <div
      className={cn(
        'px-4 py-2 shadow-md rounded-md w-56 bg-background border-2',
        isSelected ? 'border-primary' : 'border-border'
      )}
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="w-2 h-2 rounded-full bg-primary"
      />

      <div className="flex flex-col items-center">
        <Database className="h-6 w-6 text-primary mb-2" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-full text-xs text-center font-medium truncate overflow-hidden">{label}</div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {layer && (
          <div className="mt-1 px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs truncate max-w-full">
            {layer}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="w-2 h-2 rounded-full bg-primary"
      />
    </div>
  );
};

export default memo(DatasetNode);
