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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await Api.get(
          `/RI/Workbook/Tables?workbookId=${workbookId}&includeSheets=true`,
        );
        setData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, [workbookId]);

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
          placeholder="filter..."
          className="w-full p-2 border rounded"
        />
      </div>
      <Tree data={data} workbookId={workbookId} />
    </div>
  );
};

export default StructureTab;
