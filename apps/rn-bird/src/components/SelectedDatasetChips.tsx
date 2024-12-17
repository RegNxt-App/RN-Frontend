import { X } from "lucide-react";

interface SelectedDatasetChipsProps {
  selectedDatasets: Array<{
    dataset_version_id: number;
    dataset_name: string;
    version_nr: number;
  }>;
  onRemove: (id: number) => void;
}

export default function SelectedDatasetChips(
  { selectedDatasets, onRemove }: SelectedDatasetChipsProps = {
    selectedDatasets: [],
    onRemove: () => {},
  }
) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {selectedDatasets.map((dataset) => (
        <div
          key={dataset.dataset_version_id}
          className="flex items-center bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm"
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
