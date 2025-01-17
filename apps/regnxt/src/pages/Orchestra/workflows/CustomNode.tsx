import React from 'react';

import {CustomNodeProps} from '@/types/databaseTypes';
import {Handle, Position} from '@xyflow/react';

const getTypeLabel = (typeId: number) => {
  switch (typeId) {
    case 1:
      return 'Data loader';
    case 2:
      return 'Data writer';
    default:
      return 'Transformation';
  }
};

export const CustomNode = ({data}: CustomNodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2"
      />
      <div className="flex flex-col">
        <div className="text-sm font-bold text-green-600">{data.label}</div>
        <div className="text-xs text-gray-500">{getTypeLabel(data.type)}</div>
        {data.language && <div className="mt-2 text-xs bg-gray-100 px-2 py-1 rounded">{data.language}</div>}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2"
      />
    </div>
  );
};
