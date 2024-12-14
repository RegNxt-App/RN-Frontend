import { Edge } from "@xyflow/react";
import React from "react";

interface EdgeContextMenuProps {
  x: number;
  y: number;
  edge: Edge;
  onEdit: (edge: Edge) => void;
  onDelete: (edge: Edge) => void;
  onClose: () => void;
}

const EdgeContextMenu: React.FC<EdgeContextMenuProps> = ({
  x,
  y,
  edge,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className="absolute bg-white border border-gray-200 rounded shadow-md z-50"
      style={{ top: y, left: x }}
    >
      <ul>
        <li
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => onEdit(edge)}
        >
          Edit Relationship
        </li>
        <li
          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => onDelete(edge)}
        >
          Delete Relationship
        </li>
      </ul>
    </div>
  );
};

export default EdgeContextMenu;
