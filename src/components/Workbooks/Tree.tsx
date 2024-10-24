import React, { useEffect } from 'react';
import TreeNode from './TreeNode';
import { useAppDispatch } from '../../app/hooks';
import {
  fetchSheetData,
  updateSelectedSheet,
} from '../../features/sheetData/sheetDataSlice';

interface ApiResponse {
  key: string;
  label: string;
  data: string;
  table?: string;
  children?: ApiResponse[];
}

interface TreeProps {
  data: ApiResponse[];
  workbookId: number;
}

const Tree: React.FC<TreeProps> = ({ data, workbookId }) => {
  const dispatch = useAppDispatch();

  const findFirstTableNode = (nodes: ApiResponse[]): ApiResponse | null => {
    for (const node of nodes) {
      if (node.key.startsWith('tg-')) {
        if (node.children && node.children.length > 0) {
          const firstTableNode = node.children.find(
            (child) => child.key.startsWith('t-') && child.data === 'table',
          );
          if (firstTableNode) {
            return firstTableNode;
          }
        }
      } else if (node.key.startsWith('t-') && node.data === 'table') {
        return node;
      }

      if (node.children) {
        const found = findFirstTableNode(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const handleClick = (node: ApiResponse) => {
    const sheetIdMatch = node.key.match(/s-(\d+)/);
    const sheetId = sheetIdMatch ? sheetIdMatch[1] : null;

    if (sheetId) {
      dispatch(fetchSheetData({ workbookId, sheetId }));
      dispatch(
        updateSelectedSheet({
          table: node.table || node.data,
          label: node.label,
          sheetId: sheetId,
        }),
      );
    }
  };

  useEffect(() => {
    const firstTableNode = findFirstTableNode(data);
    if (
      firstTableNode &&
      firstTableNode.children &&
      firstTableNode.children.length > 0
    ) {
      const firstSheet = firstTableNode.children[0];
      const sheetIdMatch = firstSheet.key.match(/s-(\d+)/);
      const sheetId = sheetIdMatch ? sheetIdMatch[1] : null;

      if (sheetId) {
        dispatch(fetchSheetData({ workbookId, sheetId }));
        dispatch(
          updateSelectedSheet({
            table: firstTableNode.label,
            label: firstSheet.label,
            sheetId: sheetId,
          }),
        );
      }
    }
  }, [data, workbookId, dispatch]);

  return (
    <div>
      {data.map((item) => (
        <TreeNode key={item.key} node={item} onClick={handleClick} />
      ))}
    </div>
  );
};

export default Tree;
