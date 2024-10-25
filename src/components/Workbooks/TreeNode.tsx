import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface ApiResponse {
  key: string;
  label: string;
  data: string;
  table?: string;
  children?: ApiResponse[];
  cellcount?: number;
  invalidcount?: number;
}

interface TreeNodeProps {
  node: ApiResponse;
  onClick: (node: ApiResponse) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, onClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(node);
  };

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="ml-4">
      <div className="flex items-center cursor-pointer" onClick={toggleOpen}>
        {hasChildren && (
          <span className="mr-2">
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}
        <div className="flex items-center gap-2">
          <strong onClick={handleClick}>{node.label}</strong>
          {node.cellcount !== undefined && (
            <span className="text-sm text-gray-500">({node.cellcount})</span>
          )}
        </div>
      </div>

      {isOpen && hasChildren && (
        <div className="ml-4">
          {node.children?.map((child) => (
            <TreeNode key={child.key} node={child} onClick={onClick} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TreeNode;
