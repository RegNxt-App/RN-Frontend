import React from 'react';

import {Edge} from '@xyflow/react';

interface EdgeContextMenuProps {
  x: number;
  y: number;
  edge: Edge;
  onEdit: (edge: Edge) => void;
  onDelete: (edge: Edge) => void;
  onClose: () => void;
}

const EdgeContextMenu: React.FC<EdgeContextMenuProps> = ({x, y, edge, onEdit, onDelete}) => {
  return (
    <div
      className="absolute z-50 rounded border border-gray-200 bg-white shadow-md"
      style={{top: y, left: x}}
    >
      <ul>
        <li
          className="cursor-pointer px-4 py-2 hover:bg-gray-100"
          onClick={() => onEdit(edge)}
        >
          Edit Relationship
        </li>
        <li
          className="cursor-pointer px-4 py-2 hover:bg-gray-100"
          onClick={() => onDelete(edge)}
        >
          Delete Relationship
        </li>
      </ul>
    </div>
  );
};

export default EdgeContextMenu;
