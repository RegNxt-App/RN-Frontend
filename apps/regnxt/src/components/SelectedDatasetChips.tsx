import {X} from 'lucide-react';

interface SelectedDatasetChipsProps {
  selectedDatasets: Array<{
    dataset_version_id: number;
    dataset_name: string;
    version_nr: number;
  }>;
  onRemove: (id: number) => void;
}

export default function SelectedDatasetChips(
  {selectedDatasets, onRemove}: SelectedDatasetChipsProps = {
    selectedDatasets: [],
    onRemove: () => {},
  }
) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {selectedDatasets.map((dataset) => (
        <div
          key={dataset.dataset_version_id}
          className="flex items-center rounded-full bg-primary px-3 py-1 text-sm text-primary-foreground"
        >
          <span>
            {dataset.dataset_name} (v{dataset.version_nr})
          </span>
          <button
            onClick={() => onRemove(dataset.dataset_version_id)}
            className="ml-2 focus:outline-none"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
