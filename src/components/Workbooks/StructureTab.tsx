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
  const [data, setData] = useState<ApiResponse[]>([]);
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
        setFilteredData(response.data);
        setLoading(false);
        if (response.data.length > 0) {
          const firstItem = response.data[0];
          dispatch(
            updateSelectedSheet({
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
        <Database className="mr-2 text-blue-500 cursor-pointer" size={32} />
        <Save className="mr-2 text-orange-500 cursor-pointer" size={32} />
        <AlertTriangle className="mr-2 text-red-500 cursor-pointer" size={32} />
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
