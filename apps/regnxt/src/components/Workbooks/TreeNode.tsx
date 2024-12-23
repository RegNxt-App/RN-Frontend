import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {Dialog} from '@headlessui/react';
import {ChevronDown, ChevronRight, Settings, X} from 'lucide-react';

import {selectDialogState, setDialogState} from '../../features/sheetData/sheetDataSlice';
import ManageSheetsDialog from '../ManageSheetsDialog';

interface ApiResponse {
  key: string;
  label: string;
  children?: ApiResponse[];
  cellcount?: number;
  invalidcount?: number;
}
interface TreeNodeProps {
  node: ApiResponse;
  onClick: (node: ApiResponse) => void;
  workbookId: number;
  expandedNodes: Set<string>;
  onToggleExpand: (nodeKey: string) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({node, onClick, workbookId, expandedNodes, onToggleExpand}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();

  const dialogState = useSelector(selectDialogState);
  const [currentTableId, setCurrentTableId] = useState<number | null>(null);
  const isExpanded = expandedNodes.has(node.key);

  if (!workbookId) {
    console.warn('WorkbookId is undefined');
    return null;
  }

  const findTableId = (node: ApiResponse): number | null => {
    // If current node is a table
    if (node.key.startsWith('t-')) {
      const match = node.key.match(/t-(\d+)/);
      return match ? parseInt(match[1]) : null;
    }

    // If current node is a sheet, look at parent node in children array
    if (node.label === '<openaxis>') {
      // Find the parent node that starts with 't-'
      let parent = node;
      while (parent.key && !parent.key.startsWith('t-')) {
        const parentKey = parent.key.split('/')[0];
        // Go up the tree to find table node
        if (parentKey.startsWith('t-')) {
          const match = parentKey.match(/t-(\d+)/);
          return match ? parseInt(match[1]) : null;
        }
      }
    }
    return null;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (node.label === '<openaxis>') {
      const tableId = findTableId(node);
      setCurrentTableId(tableId);
      console.log('Found Table ID:', tableId);

      dispatch(setDialogState({isOpen: true, dialogType: 'manage-sheets'}));
    } else {
      onClick(node);
    }
  };

  const handleCloseDialog = () => {
    dispatch(setDialogState({isOpen: false, dialogType: null}));
    setCurrentTableId(null);
  };

  const toggleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleExpand(node.key);
  };

  const hasChildren = node.children && node.children.length > 0;

  const renderLabel = () => {
    if (node.label === '<openaxis>') {
      return (
        <div className="flex items-center gap-2">
          <Settings
            size={16}
            strokeWidth={1.75}
          />
          <span>Manage Sheets</span>
        </div>
      );
    }
    return node.label;
  };

  console.log('WorkbookId in treenode', workbookId);
  return (
    <>
      <div
        className="ml-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center cursor-pointer"
          onClick={toggleOpen}
        >
          {hasChildren && (
            <span className="mr-2">
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          )}
          <div className="flex items-center gap-2">
            <strong onClick={handleClick}>{renderLabel()}</strong>
            {node.cellcount !== undefined && node.invalidcount !== undefined && (
              <span className="text-sm text-gray-500">
                ( {node.cellcount} | {node.invalidcount} | {node.invalidcount} )
              </span>
            )}
          </div>
        </div>

        {isExpanded && hasChildren && (
          <div className="ml-4">
            {node.children?.map((child) => (
              <TreeNode
                key={child.key}
                node={child}
                onClick={onClick}
                workbookId={workbookId}
                expandedNodes={expandedNodes}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </div>
        )}
      </div>

      {dialogState.isOpen && dialogState.dialogType === 'manage-sheets' && currentTableId && workbookId && (
        <Dialog
          open={true}
          onClose={handleCloseDialog}
          className="relative"
        >
          <div
            className="fixed"
            aria-hidden="true"
          />
          <ManageSheetsDialog
            isOpen={true}
            onClose={handleCloseDialog}
            workbookId={workbookId}
            tableId={currentTableId}
          />
        </Dialog>
      )}
    </>
  );
};

export default TreeNode;
