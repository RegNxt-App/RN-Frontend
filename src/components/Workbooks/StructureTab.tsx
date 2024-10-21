import { AlertTriangle, Database, Save } from 'lucide-react';
import Tree from './Tree';
import { useState, useEffect } from 'react';
import Api from '../../utils/Api';
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
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [workbookId]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term === '') {
      // If search is cleared, reset to original data
      setFilteredData(data);
    } else {
      // Filter the tree data based on the search term
      const filtered = filterTree(data, term.toLowerCase());
      setFilteredData(filtered);
    }
  };

  const filterTree = (nodes: ApiResponse[], term: string): ApiResponse[] => {
    return nodes
      .map((node) => {
        // Check if node label or any children's labels match the search term
        const matches =
          node.label.toLowerCase().includes(term) ||
          (node.children && filterTree(node.children, term).length > 0);

        // If it matches, return the node with filtered children
        if (matches) {
          return {
            ...node,
            children: node.children ? filterTree(node.children, term) : [],
          };
        }

        return null; // If no match, return null
      })
      .filter((node) => node !== null) as ApiResponse[]; // Remove null entries
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
