import { Column } from "@/types/databaseTypes";
import { Loader } from "lucide-react";
import React from "react";
import { EditableColumnTable } from "./EditableColumnTable";

interface DatasetVersionColumnsProps {
  datasetId: number;
  versionId: number;
  columns?: Column[];
  onUpdateColumns: (columns: Column[]) => Promise<void>;
  isLoading?: boolean;
}

export const DatasetVersionColumns: React.FC<DatasetVersionColumnsProps> = ({
  versionId,
  datasetId,
  columns = [],
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Dataset Version Columns</h3>
      <EditableColumnTable
        initialColumns={columns}
        datasetId={datasetId}
        isLoading={isLoading}
        versionId={versionId}
      />
    </div>
  );
};
