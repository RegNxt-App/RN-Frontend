import React, {useMemo} from 'react';

import {Handle, Position} from '@xyflow/react';

interface CustomNodeProps {
  data: {
    label: string;
    type: number;
    language?: string;
  };
}

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

export const CustomNode = React.memo(({data}: CustomNodeProps) => {
  const typeLabel = useMemo(() => getTypeLabel(data.type), [data.type]);

  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-stone-400">
      <Handle
        type="target"
        position={Position.Top}
        className="w-2 h-2"
      />
      <div className="flex flex-col">
        <div className="text-sm font-bold text-primary">{data.label}</div>
        <div className="text-xs text-gray-500">{typeLabel}</div>
        {data.language && <div className="mt-2 text-xs bg-gray-100 px-2 py-1 rounded">{data.language}</div>}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2 h-2"
      />
    </div>
  );
});
