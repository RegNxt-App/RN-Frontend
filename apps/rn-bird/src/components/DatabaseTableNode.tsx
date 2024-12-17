import {memo} from 'react';

import {Handle, Position} from '@xyflow/react';

interface Column {
  column_name: string;
  data_type: string;
  is_primary_key: boolean;
}

interface DatabaseTableNodeProps {
  id: string;
  data: {
    label: string;
    columns: Column[];
  };
}

const DatabaseTableNode = memo(({id, data}: DatabaseTableNodeProps) => {
  return (
    <div
      className="overflow-hidden rounded-md border-2 border-gray-300 bg-white shadow-md"
      style={{width: 250}}
    >
      <div className="truncate bg-blue-500 px-4 py-2 text-center font-bold text-white">{data.label}</div>
      <div className="max-h-[4000px] overflow-y-auto p-2">
        {data.columns.map((column, index) => (
          <div
            key={`${id}-${column.column_name}`}
            className="flex items-center border-b border-gray-200 py-1 text-sm last:border-b-0"
          >
            <Handle
              type="target"
              position={Position.Left}
              id={`${id}.${column.column_name}.left`}
              style={{left: '-8px', top: `${index * 24 + 36}px`}}
            />
            <Handle
              type="source"
              position={Position.Right}
              id={`${id}.${column.column_name}.right`}
              style={{right: '-8px', top: `${index * 24 + 36}px`}}
            />
            <span className={`mr-2 ${column.is_primary_key ? 'text-yellow-500' : ''}`}>
              {column.is_primary_key ? '🔑' : ''}
            </span>
            <span className="truncate font-medium">{column.column_name}</span>
            <span className="ml-auto text-xs text-gray-500">{column.data_type}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

DatabaseTableNode.displayName = 'DatabaseTableNode';

export default DatabaseTableNode;
