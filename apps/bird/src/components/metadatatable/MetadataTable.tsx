import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MetadataItem, ValidationResult } from "@/types/databaseTypes";
import { AlertCircle } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ExcelOperations } from "../ExcelOperations";
import { NoResults } from "../NoResults";
import { Button } from "../ui/button";
import { MetadataTableBody } from "./MetadataTableBody";
import { MetadataTableHeader } from "./MetadataTableHeader";

interface MetadataTableProps {
  metadata: MetadataItem[] | null;
  tableData: Record<string, string | null>[];
  isLoading: boolean;
  hasAppliedFilters: boolean;
  onSave: any;
  onValidate: (tableData: Record<string, string | null>[]) => void;
  selectedTable: { code: string; label: string };
  datasetVersion: { version_nr: string };
  validationResults: ValidationResult[];
  hasMandatoryFilters: any;
}

const PAGE_SIZE = 10;

export const MetadataTable: React.FC<MetadataTableProps> = ({
  metadata,
  tableData,
  isLoading,
  onSave,
  onValidate,
  selectedTable,
  hasAppliedFilters,
  datasetVersion,
  validationResults,
  hasMandatoryFilters,
}) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [localTableData, setLocalTableData] = useState<
    Record<string, string | null>[]
  >([]);
  const [isDataModified, setIsDataModified] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (tableData && tableData.length > 0) {
      const initialData = tableData.map((row) => ({ ...row, id: row.id }));
      setLocalTableData(initialData);
    } else {
      setLocalTableData([]);
    }
    setIsDataModified(false);
    setCurrentPage(1);
  }, [tableData]);

  const handleCellChange = useCallback(
    (rowIndex: number, columnName: string, value: string | null) => {
      setLocalTableData((prevData) => {
        const newData = [...prevData];
        newData[rowIndex] = {
          ...newData[rowIndex],
          [columnName]: value === "" ? null : value,
        };
        return newData;
      });
      setIsDataModified(true);
    },
    []
  );

  const handleAddRow = useCallback(() => {
    if (!metadata) return;
    const newRow = Object.fromEntries(
      metadata.map((column) => [column.code, null])
    );
    setLocalTableData((prevData) => [...prevData, newRow]);
    setIsDataModified(true);

    // If adding a new row would be on a new page, switch to that page
    const newTotalRows = localTableData.length + 1;
    const newLastPage = Math.ceil(newTotalRows / PAGE_SIZE);
    setCurrentPage(newLastPage);
  }, [metadata, localTableData.length]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // Get current and original IDs to determine deletes
      const currentIds = new Set(localTableData.map((row) => row.id));
      const originalIds = new Set(tableData.map((row) => row.id));

      // Find deleted IDs by comparing original and current IDs
      const deletedIds = Array.from(originalIds).filter(
        (id) => !currentIds.has(id)
      );

      // Pass both data and deletions to onSave
      await onSave({
        data: localTableData,
        deletions: deletedIds,
      });

      setIsDataModified(false);

      toast({
        title: "Success",
        description:
          deletedIds.length > 0
            ? `Successfully saved changes and deleted ${deletedIds.length} row(s)`
            : "Successfully saved changes",
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: "Failed to save changes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [localTableData, tableData, onSave, toast]);
  const handleValidate = useCallback(async () => {
    setIsValidating(true);
    try {
      const validationResults = (await onValidate(localTableData)) as any;
      if (validationResults && validationResults.length > 0) {
        const firstErrorElement = document.querySelector(
          '[data-validation-error="true"]'
        );
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    } catch (error) {
      console.error("Validation error:", error);
    } finally {
      setIsValidating(false);
    }
  }, [onValidate, localTableData]);

  const filteredMetadata = useMemo(() => {
    return (
      metadata?.filter((item) =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
      ) || []
    );
  }, [metadata, searchTerm]);

  const totalPages = Math.ceil(localTableData.length / PAGE_SIZE);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return localTableData.slice(startIndex, startIndex + PAGE_SIZE);
  }, [localTableData, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!metadata || metadata.length === 0) {
    return (
      <NoResults
        title="No Data Available"
        message="No data available for the selected filters."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between flex-end">
        <h3 className="text-xl font-semibold">
          Data for table {selectedTable.code} | {selectedTable.label}{" "}
          {datasetVersion && `| Version ${datasetVersion.version_nr}`}
        </h3>

        <div className="flex items-center space-x-2">
          <ExcelOperations
            objectCode={selectedTable.code.toLowerCase()}
            columns={metadata}
            onUpload={onSave}
            currentData={localTableData}
            isLoading={isSaving || isLoading}
          />
        </div>
      </div>

      {hasMandatoryFilters() && !hasAppliedFilters ? (
        <NoResults
          title="Mandatory Filters Required"
          message="Please apply the required filters above to view the data."
          icon={AlertCircle}
        />
      ) : (
        <>
          <MetadataTableHeader
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleAddRow={handleAddRow}
            handleSave={handleSave}
            onValidate={handleValidate}
            isDataModified={isDataModified}
            isSaving={isSaving}
            isValidating={isValidating}
          />

          <MetadataTableBody
            filteredMetadata={filteredMetadata}
            localTableData={paginatedData}
            handleCellChange={handleCellChange}
            handleDeleteRow={(rowIndex) => {
              const actualIndex = (currentPage - 1) * PAGE_SIZE + rowIndex;
              setLocalTableData((prevData) =>
                prevData.filter((_, index) => index !== actualIndex)
              );
              setIsDataModified(true);
            }}
            validationResults={validationResults}
          />

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
              {Math.min(currentPage * PAGE_SIZE, localTableData.length)} of{" "}
              {localTableData.length} entries
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      onClick={() => handlePageChange(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  )
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const LoadingSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-3/4" />
    <div className="flex justify-between">
      <Skeleton className="h-10 w-1/3" />
      <Skeleton className="h-10 w-1/4" />
    </div>
    <div className="space-y-2">
      {[...Array(5)].map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  </div>
);

export default MetadataTable;
