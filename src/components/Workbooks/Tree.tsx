import React, { useEffect } from 'react';
import TreeNode from './TreeNode';
import { useAppDispatch } from '../../app/hooks';
import {
  fetchSheetData,
  updateSelectedSheet,
  updateTotalCounts,
} from '../../features/sheetData/sheetDataSlice';

interface ApiResponse {
  key: string;
  label: string;
  data: string;
  table?: string;
  children?: ApiResponse[];
  cellcount?: number;
  invalidcount?: number;
}

interface TreeProps {
  data: ApiResponse[];
  workbookId: number;
}

const Tree: React.FC<TreeProps> = ({ data, workbookId }) => {
  const dispatch = useAppDispatch();

  const calculateNodeCounts = (node: ApiResponse): ApiResponse => {
    if (!node.children || node.children.length === 0) {
      return {
        ...node,
        cellcount: node.cellcount || 0,
        invalidcount: node.invalidcount || 0,
      };
    }

    const processedChildren = node.children.map(calculateNodeCounts);

    const totalCellCount = processedChildren.reduce(
      (sum, child) => sum + (child.cellcount || 0),
      0,
    );
    const totalInvalidCount = processedChildren.reduce(
      (sum, child) => sum + (child.invalidcount || 0),
      0,
    );

    return {
      ...node,
      children: processedChildren,
      cellcount: totalCellCount,
      invalidcount: totalInvalidCount,
    };
  };

  const processTreeData = (treeData: ApiResponse[]): ApiResponse[] => {
    return treeData.map(calculateNodeCounts);
  };

  const calculateTotalCounts = (nodes: ApiResponse[]) => {
    let totalCellCount = 0;
    let totalInvalidCount = 0;

    const processNode = (node: ApiResponse) => {
      if (node.key.startsWith('tg-')) {
        totalCellCount += node.cellcount || 0;
        totalInvalidCount += node.invalidcount || 0;
      }

      if (node.children) {
        node.children.forEach(processNode);
      }
    };

    nodes.forEach(processNode);

    return {
      totalCellCount,
      totalInvalidCount,
    };
  };

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
          cellcount: node.cellcount || 0,
          invalidcount: node.invalidcount || 0,
        }),
      );
    }
  };

  useEffect(() => {
    const processedData = processTreeData(data);

    const { totalCellCount, totalInvalidCount } =
      calculateTotalCounts(processedData);
    dispatch(
      updateTotalCounts({
        totalCellCount,
        totalInvalidCount,
      }),
    );

    const firstTableNode = findFirstTableNode(processedData);
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
            cellcount: firstSheet.cellcount || 0,
            invalidcount: firstSheet.invalidcount || 0,
          }),
        );
      }
    }
  }, [data, workbookId, dispatch]);

  const processedData = processTreeData(data);

  return (
    <div>
      {processedData.map((item) => (
        <TreeNode key={item.key} node={item} onClick={handleClick} />
      ))}
    </div>
  );
};

export default Tree;