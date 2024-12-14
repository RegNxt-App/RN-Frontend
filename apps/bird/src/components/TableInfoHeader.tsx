import { Badge } from "@/components/ui/badge";

interface TableData {
  dataset_id: number;
  code: string;
  label: string;
  description: string;
  framework: string;
  type: string;
}

interface DatasetVersion {
  version_nr: string;
  dataset_version_id: string;
}

interface TableInfoHeaderProps {
  selectedTable: TableData;
  datasetVersion: DatasetVersion;
}

export const TableInfoHeader: React.FC<TableInfoHeaderProps> = ({
  selectedTable,
  datasetVersion,
}) => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <h2 className="text-2xl font-bold mb-2">{selectedTable.label}</h2>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">Code: {selectedTable.code}</Badge>
        <Badge variant="outline">ID: {selectedTable.dataset_id}</Badge>
        <Badge variant="outline">Framework: {selectedTable.framework}</Badge>
        <Badge variant="outline">Type: {selectedTable.type}</Badge>
        {datasetVersion && (
          <>
            <Badge variant="outline">
              Version: {datasetVersion.version_nr}
            </Badge>
            <Badge variant="outline">
              Version ID: {datasetVersion.dataset_version_id}
            </Badge>
          </>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-600">{selectedTable.description}</p>
    </div>
  );
};
