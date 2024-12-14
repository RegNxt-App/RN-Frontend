import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { MetadataItem, ValidationResult } from "@/types/databaseTypes";
import { Trash } from "lucide-react";
import React from "react";
import { MetadataTableCell } from "./MetadataTableCell";

interface MetadataTableRowProps {
  row: Record<string, string | null>;
  rowIndex: number;
  filteredMetadata: MetadataItem[];
  handleCellChange: (
    rowIndex: number,
    columnName: string,
    value: string | null
  ) => void;
  handleDeleteRow: (rowIndex: number) => void;
  validationResults: ValidationResult[];
}

export const MetadataTableRow: React.FC<MetadataTableRowProps> = ({
  row,
  rowIndex,
  filteredMetadata,
  handleCellChange,
  handleDeleteRow,
  validationResults,
}) => (
  <TableRow
    key={rowIndex}
    className={`hover:bg-gray-50 transition-colors ${
      validationResults.some((result) => result.row_id === rowIndex.toString())
        ? "bg-red-50"
        : ""
    }`}
    data-validation-error={validationResults.some(
      (result) => result.row_id === rowIndex.toString()
    )}
  >
    <TableCell>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleDeleteRow(rowIndex)}
      >
        <Trash className="h-4 w-4 text-red-500" />
      </Button>
    </TableCell>
    {filteredMetadata.map((item) => (
      <MetadataTableCell
        key={`${rowIndex}-${item.dataset_version_column_id}`}
        item={item}
        row={row}
        rowIndex={rowIndex}
        handleCellChange={handleCellChange}
        validationResults={validationResults}
      />
    ))}
  </TableRow>
);
