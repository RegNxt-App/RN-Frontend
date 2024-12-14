// useMetadataTable.ts
import { MetadataItem } from "@/types/databaseTypes";
import { useCallback, useEffect, useMemo, useState } from "react";



export const useMetadataTable = (
  metadata: MetadataItem[] | null,
  tableData: Record<string, string | null>[],
  onSave: (updatedData: Record<string, string | null>[]) => void
) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [localTableData, setLocalTableData] = useState<
    Record<string, string | null>[]
  >([]);
  const [isDataModified, setIsDataModified] = useState(false);

  useEffect(() => {
    if (tableData && tableData.length > 0) {
      setLocalTableData(tableData);
    }
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
  }, [metadata]);

  const handleDeleteRow = useCallback((rowIndex: number) => {
    setLocalTableData((prevData) =>
      prevData.filter((_, index) => index !== rowIndex)
    );
    setIsDataModified(true);
  }, []);

  const handleSave = useCallback(() => {
    onSave(localTableData);
    setIsDataModified(false);
  }, [localTableData, onSave]);

  const filteredMetadata = useMemo(() => {
    return (
      metadata?.filter((item) =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
      ) || []
    );
  }, [metadata, searchTerm]);

  return {
    searchTerm,
    setSearchTerm,
    localTableData,
    filteredMetadata,
    handleCellChange,
    handleAddRow,
    handleDeleteRow,
    handleSave,
    isDataModified,
  };
};
