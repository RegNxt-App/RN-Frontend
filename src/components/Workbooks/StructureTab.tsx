import { AlertTriangle, Database, Save } from 'lucide-react';
import Tree from './Tree';
import { useState, useEffect } from 'react';
import Api from '../../utils/Api';
import { useDispatch } from 'react-redux';

import { updateSelectedSheet } from '../../features/sheetData/sheetDataSlice';
interface StructureTabProps {
  workbookId: number;
}

interface ApiResponse {
  key: string;
  label: string;
  data: string;
  children?: ApiResponse[];
}

const StructureTab: React.FC<StructureTabProps> = ({ workbookId }) => {
  const dispatch = useDispatch();
  const [data, setData] = useState<ApiResponse[]>([]); //sheets
  const [filteredData, setFilteredData] = useState<ApiResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Api.get(
          `/RI/Workbook/Tables?workbookId=${workbookId}&includeSheets=true`,
        );
        setData(response.data);
        console.log('Sheet.key:', response.data.key, response.data);
        setFilteredData(response.data);
        setLoading(false);
        if (response.data.length > 0) {
          const firstItem = response.data[0];
          dispatch(
            updateSelectedSheet({
              sheetId: firstItem.id,
              table: firstItem.data,
              label: firstItem.label,
            }),
          );
        }
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [workbookId, dispatch]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term === '') {
      setFilteredData(data);
    } else {
      const filtered = filterTree(data, term.toLowerCase());
      setFilteredData(filtered);
    }
  };

  const filterTree = (nodes: ApiResponse[], term: string): ApiResponse[] => {
    return nodes
      .map((node) => {
        const matches =
          node.label.toLowerCase().includes(term) ||
          (node.children && filterTree(node.children, term).length > 0);

        if (matches) {
          return {
            ...node,
            children: node.children ? filterTree(node.children, term) : [],
          };
        }

        return null;
      })
      .filter((node) => node !== null) as ApiResponse[];
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className="flex mb-4">
        <div className="relative mr-2">
          <Database className="text-blue-500 cursor-pointer" size={32} />
          <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
            1
          </span>
        </div>
        <div className="relative mr-2">
          <Save className="text-orange-500 cursor-pointer" size={32} />
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
            2
          </span>
        </div>
        <div className="relative mr-2">
          <AlertTriangle className="text-red-500 cursor-pointer" size={32} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            20
          </span>
        </div>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="w-full p-2 border rounded"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      <Tree data={filteredData} workbookId={workbookId} />
    </div>
  );
};

export default StructureTab;
