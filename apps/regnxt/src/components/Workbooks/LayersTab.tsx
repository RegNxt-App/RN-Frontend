import {useEffect, useState} from 'react';

import Api from '../../utils/Api';
import LayersTable from '../Tables/workbooks/layers/LayersData';
import Loader from '../loader';

interface LayersTableData {
  versionId: number;
  from: string;
  to: string;
  reason: string;
  modifier: string;
}

interface VersionResponse {
  workbookId: number;
  versionId: number;
  fromDate: string;
  toDate: string;
  reason: string;
  modificationDate: string;
  modifierId: number;
}

interface LayersTabProps {
  workbookId: string;
}

const LayersTab: React.FC<LayersTabProps> = ({workbookId}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [versions, setVersions] = useState<LayersTableData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchVersions = async () => {
    try {
      setIsLoading(true);
      const response = await Api.get(`/RI/Workbook/version?workbookId=${workbookId}`);

      const transformedData: LayersTableData[] = response.data.map((version: VersionResponse) => ({
        versionId: version.versionId,
        from: new Date(version.fromDate).toLocaleString(),
        to: new Date(version.toDate).toLocaleString(),
        reason: version.reason,
        modifier: `User ${version.modifierId}`,
      }));

      setVersions(transformedData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch version data');
      console.error('Error fetching versions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [workbookId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <LayersTable
      data={versions}
      workbookId={workbookId}
      onDataChange={fetchVersions}
    />
  );
};

export default LayersTab;
