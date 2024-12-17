import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2 } from "lucide-react"; // Add this import

import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { fastApiInstance } from "@/lib/axios";
import { cn } from "@/lib/utils";
import { Column } from "@/types/databaseTypes";
import { History, Plus } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import ColumnFormModal from "./ColumnFormModal";
import { ConfirmDialog } from "./ConfirmDialog";

const HISTORIZATION_TYPES = {
  0: {
    label: "No Historization",
    description: "No change tracking for this column",
    className: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  },
  1: {
    label: "Always Latest",
    description: "Only keeps the most recent value",
    className: "bg-purple-100 text-purple-700 hover:bg-purple-200",
  },
  2: {
    label: "Versioning",
    description: "Maintains full history of all changes",
    className: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
  },
} as const;

interface EditableColumnTableProps {
  initialColumns: Column[];
  datasetId: string | number;
  versionId: string | number;
  onColumnChange?: () => void;
  isLoading?: boolean;
}

interface ColumnData {
  data: Column[];
}

export const EditableColumnTable: React.FC<EditableColumnTableProps> = ({
  datasetId,
  versionId,
  isLoading,
}) => {
  const { toast } = useToast();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<Column | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [columnToDelete, setColumnToDelete] = useState<Column | null>(null);
  const columnKey = versionId
    ? `/api/v1/datasets/${datasetId}/version-columns/?version_id=${versionId}`
    : null;

  const { data: columns, mutate: mutateColumns } = useSWR<ColumnData>(
    columnKey,
    fastApiInstance
  );

  const handleFormSubmit = useCallback(
    async (data: any) => {
      try {
        const payload = {
          columns: [
            {
              ...selectedColumn,
              ...data,
              dataset_version_column_id:
                selectedColumn?.dataset_version_column_id,
              column_order: selectedColumn?.column_order,
              is_visible: true,
              is_filter: data.is_filter ?? true,
              is_report_snapshot_field: data.is_mandatory_filter ?? false,
              is_system_generated: false,
            },
          ],
        };

        await fastApiInstance.post(
          `/api/v1/datasets/${datasetId}/update-columns/?version_id=${versionId}`,
          payload
        );

        mutateColumns();

        setIsFormModalOpen(false);
        setSelectedColumn(null);

        toast({
          title: "Success",
          description: selectedColumn
            ? "Column updated successfully"
            : "Column created successfully",
        });
      } catch (error: any) {
        console.error("Error saving column:", error);
        toast({
          title: "Error",
          description:
            error?.response?.data?.error ||
            "Failed to save column. Please try again.",
          variant: "destructive",
        });
      }
    },
    [datasetId, versionId, mutateColumns, toast, selectedColumn]
  );

  const handleEditClick = useCallback((column: Column) => {
    setSelectedColumn(column);
    setIsFormModalOpen(true);
  }, []);

  const handleDeleteClick = useCallback((column: Column) => {
    setColumnToDelete(column);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!columnToDelete) return;

    try {
      await fastApiInstance.post(
        `/api/v1/datasets/${datasetId}/update-columns/?version_id=${versionId}`,
        {
          is_delete_operation: true,
          columns_to_delete: [columnToDelete?.dataset_version_column_id],
        }
      );

      mutateColumns();

      toast({
        title: "Success",
        description: "Column deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting column:", error);
      toast({
        title: "Error",
        description: "Failed to delete column",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setColumnToDelete(null);
    }
  }, [columnToDelete, datasetId, versionId, toast, mutateColumns]);

  const filteredColumns = useMemo(() => {
    console.log("columns: ", columns);
    return (
      columns &&
      columns?.data?.filter(
        (column: Column) =>
          column.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          column.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [columns, searchTerm]);

  const renderHistorizationBadge = (historization_type: number) => {
    const config =
      HISTORIZATION_TYPES[
        historization_type as keyof typeof HISTORIZATION_TYPES
      ];

    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="inline-flex items-center gap-2">
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${config.className}`}
              >
                <History className="h-4 w-4" />
                {config.label}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-white border shadow-lg p-3 rounded-lg max-w-xs">
            <div className="space-y-2">
              <p className="font-medium text-gray-600 text-sm">
                {config.label}
              </p>
              <p className="text-sm text-gray-600">{config.description}</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search columns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-xs"
        />
        <Button
          onClick={() => setIsFormModalOpen(true)}
          disabled={isLoading}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Column
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Code</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Mandatory</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Visible</TableHead>
              <TableHead>Filter</TableHead>
              <TableHead>Mandatory Filter</TableHead>
              <TableHead>Historization</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredColumns?.map((column: Column) => (
              <TableRow
                key={column.dataset_version_column_id}
                className="hover:bg-gray-50"
              >
                <TableCell>{column.code}</TableCell>
                <TableCell>{column.label}</TableCell>
                <TableCell>{column.datatype}</TableCell>
                <TableCell>{column.role}</TableCell>
                <TableCell>
                  <Switch checked={column.is_mandatory} disabled />
                </TableCell>
                <TableCell>
                  <Switch checked={column.is_key} disabled />
                </TableCell>
                <TableCell>
                  <Switch checked={column.is_visible} disabled />
                </TableCell>
                <TableCell>
                  <Switch checked={column.is_filter} disabled />
                </TableCell>
                <TableCell>
                  <Switch checked={column.is_report_snapshot_field} disabled />
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {renderHistorizationBadge(column.historization_type)}
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(column)}
                              disabled={column.is_system_generated}
                              className="h-8 w-8 text-gray-600 hover:text-gray-900"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {column.is_system_generated
                            ? "Cannot edit system-generated column"
                            : "Edit column"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(column)}
                              disabled={column.is_system_generated}
                              className={cn(
                                "h-8 w-8",
                                column.is_system_generated
                                  ? "text-gray-400"
                                  : "text-red-600 hover:text-red-700 hover:bg-red-50"
                              )}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          {column.is_system_generated
                            ? "Cannot delete system-generated column"
                            : "Delete column"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ColumnFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedColumn(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={selectedColumn || undefined}
        versionId={versionId}
      />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Column"
        message={`Are you sure you want to delete the column "${columnToDelete?.label}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default EditableColumnTable;
