import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface ApiResponse {
  key: string;
  label: string;
  data: string;
  children?: ApiResponse[];
}

interface TreeNodeProps {
  node: ApiResponse;
  onClick: (label: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({ node, onClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    onClick(node.key);
  };

  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="ml-4">
      <div
        className="flex items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {hasChildren && (
          <span className="mr-2">
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        )}
        <strong onClick={handleClick}>{node.label}</strong>
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
