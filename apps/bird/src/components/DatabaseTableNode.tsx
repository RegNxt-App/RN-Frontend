import { Handle, Position } from "@xyflow/react";
import { memo } from "react";

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

const DatabaseTableNode = memo(({ id, data }: DatabaseTableNodeProps) => {
  return (
    <div
      className="bg-white border-2 border-gray-300 rounded-md shadow-md overflow-hidden"
      style={{ width: 250 }}
    >
      <div className="bg-blue-500 text-white font-bold py-2 px-4 text-center truncate">
        {data.label}
      </div>
      <div className="p-2 max-h-[4000px] overflow-y-auto">
        {data.columns.map((column, index) => (
          <div
            key={`${id}-${column.column_name}`}
            className="flex items-center text-sm py-1 border-b border-gray-200 last:border-b-0"
          >
            <Handle
              type="target"
              position={Position.Left}
              id={`${id}.${column.column_name}.left`}
              style={{ left: "-8px", top: `${index * 24 + 36}px` }}
            />
            <Handle
              type="source"
              position={Position.Right}
              id={`${id}.${column.column_name}.right`}
              style={{ right: "-8px", top: `${index * 24 + 36}px` }}
            />
            <span
              className={`mr-2 ${
                column.is_primary_key ? "text-yellow-500" : ""
              }`}
            >
              {column.is_primary_key ? "🔑" : ""}
            </span>
            <span className="font-medium truncate">{column.column_name}</span>
            <span className="ml-auto text-gray-500 text-xs">
              {column.data_type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

DatabaseTableNode.displayName = "DatabaseTableNode";

export default DatabaseTableNode;
