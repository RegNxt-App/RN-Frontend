import React, {useEffect, useState} from 'react';

import GenericComboBox from '@/components/ComboBox';
import {birdBackendInstance} from '@/lib/axios';
import {format} from 'date-fns';
import useSWR from 'swr';

import {Checkbox} from '@rn/ui/components/ui/checkbox';

interface DatasetVersionSelectorProps {
  framework: string;
  layer: string;
  date: Date;
  onSelect: (datasetVersion: any) => void;
  selectedVersions: string[];
}

interface DatasetVersionResponse {
  data: {
    dataset_version_id: number;
    version_code: string;
  };
}

interface DataVersionColumnsResponse {
  data: any[];
}

const DatasetVersionSelector: React.FC<DatasetVersionSelectorProps> = ({
  framework,
  layer,
  date,
  onSelect,
  selectedVersions,
}) => {
  const [selectedDataset, setSelectedDataset] = useState<any>(null);

  const {data: datasetVersion} = useSWR<DatasetVersionResponse>(
    selectedDataset
      ? `/api/v1/datasets/${selectedDataset.dataset_id}/versions/?date=${format(date, 'yyyy-MM-dd')}`
      : null,
    birdBackendInstance
  );

  const {data: dataVersionColumns} = useSWR<DataVersionColumnsResponse>(
    datasetVersion?.data
      ? `/api/v1/datasets/${selectedDataset.dataset_id}/columns/?version_id=${datasetVersion.data.dataset_version_id}`
      : null,
    birdBackendInstance
  );

  useEffect(() => {
    setSelectedDataset(null);
  }, [framework, layer]);

  const handleDatasetSelect = (dataset: any) => {
    setSelectedDataset(dataset);
  };

  const handleVersionSelect = () => {
    if (datasetVersion?.data && dataVersionColumns?.data) {
      const versionWithColumns = {
        ...datasetVersion.data,
        columns: dataVersionColumns.data,
      };
      onSelect(versionWithColumns);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <GenericComboBox
        apiEndpoint="/api/v1/datasets/"
        placeholder="Select a Dataset"
        onSelect={handleDatasetSelect}
      />
      {datasetVersion?.data && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`version-${datasetVersion.data.dataset_version_id}`}
            checked={selectedVersions.includes(datasetVersion.data.dataset_version_id.toString())}
            onCheckedChange={handleVersionSelect}
          />
          <label htmlFor={`version-${datasetVersion.data.dataset_version_id}`}>
            {datasetVersion.data.version_code || 'Unnamed Version'}
          </label>
        </div>
      )}
    </div>
  );
};

export default DatasetVersionSelector;
