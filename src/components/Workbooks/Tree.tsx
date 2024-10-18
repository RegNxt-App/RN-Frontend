import TreeNode from './TreeNode';
import Api from '../../utils/Api';
import { useAppDispatch } from '../../app/hooks';
import { fetchSheetData } from '../../features/sheetData/sheetDataSlice';
import { setSelection } from '../../features/sheetData/selectionSlice';
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

const Tree = ({ data, workbookId }: TreeProps) => {
  const dispatch = useAppDispatch();

  const handleClick = async (key: string) => {
    const sheetIdMatch = key.match(/s-(\d+)/);
    const sheetId = sheetIdMatch ? sheetIdMatch[1] : null;

    if (sheetId) {
      console.log('Sheet ID:', sheetId);
      dispatch(fetchSheetData({ workbookId, sheetId }));
    } else {
      console.error('Invalid key format, could not extract sheetId');
    }
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
