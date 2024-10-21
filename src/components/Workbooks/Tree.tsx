import React from 'react';
import TreeNode from './TreeNode';
import { useAppDispatch } from '../../app/hooks';
import { fetchSheetData } from '../../features/sheetData/sheetDataSlice';
import { updateSelectedSheet } from '../../features/sheetData/sheetDataSlice';

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

  const handleClick = (node: ApiResponse) => {
    const sheetIdMatch = node.key.match(/s-(\d+)/);
    const sheetId = sheetIdMatch ? sheetIdMatch[1] : null;

    if (sheetId) {
      console.log('Sheet ID:', sheetId);
      dispatch(fetchSheetData({ workbookId, sheetId }));
    }

    dispatch(
      updateSelectedSheet({
        table: node.table || node.data,
        label: node.label,
      }),
    );
  };

  return (
    <div>
      {data.map((item) => (
        <TreeNode key={item.key} node={item} onClick={handleClick} />
      ))}
    </div>
  );
};

export default Tree;
