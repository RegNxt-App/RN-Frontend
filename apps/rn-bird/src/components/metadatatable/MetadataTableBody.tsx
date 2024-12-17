// MetadataTableBody.tsx
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { MetadataItem, ValidationResult } from "@/types/databaseTypes";
import { Circle, Info, Key } from "lucide-react";
import React from "react";
import { MetadataTableRow } from "./MetadataTableRow";

interface MetadataTableBodyProps {
  filteredMetadata: MetadataItem[];
  localTableData: Record<string, string | null>[];
  handleCellChange: (
    rowIndex: number,
    columnName: string,
    value: string | null
  ) => void;
  handleDeleteRow: (rowIndex: number) => void;
  validationResults: ValidationResult[];
}

export const MetadataTableBody: React.FC<MetadataTableBodyProps> = ({
  filteredMetadata,
  localTableData,
  handleCellChange,
  handleDeleteRow,
  validationResults,
}) => {
  return (
    <div className="rounded-md border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[50px]"></TableHead>
              {filteredMetadata.map((item) => (
                <TableHead
                  key={item.dataset_version_column_id}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  <div className="flex items-center space-x-1">
                    <span>{item.label}</span>
                    <TooltipProvider>
                      {item.is_key && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Key className="h-3 w-3 text-yellow-500" />
                          </TooltipTrigger>
                          <TooltipContent>Key Column</TooltipContent>
                        </Tooltip>
                      )}
                      {item.is_mandatory && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Circle className="h-3 w-3 fill-current text-red-500" />
                          </TooltipTrigger>
                          <TooltipContent>Mandatory Field</TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger>
                          <Popover>
                            <PopoverTrigger>
                              <Info className="h-3 w-3 text-blue-500 cursor-pointer" />
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-4">
                              <div className="space-y-2 text-sm">
                                <p>
                                  <strong>Code:</strong> {item.code}
                                </p>
                                <p>
                                  <strong>Label:</strong> {item.label}
                                </p>
                                <p>
                                  <strong>Description:</strong>{" "}
                                  {item.description}
                                </p>
                                <p>
                                  <strong>Data Type:</strong> {item.datatype}
                                </p>
                                <p>
                                  <strong>Is Key:</strong>{" "}
                                  {item.is_key ? "Yes" : "No"}
                                </p>
                                <p>
                                  <strong>Is Mandatory:</strong>{" "}
                                  {item.is_mandatory ? "Yes" : "No"}
                                </p>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TooltipTrigger>
                        <TooltipContent>Column Details</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {localTableData.length > 0 ? (
              localTableData.map((row, rowIndex) => (
                <MetadataTableRow
                  key={rowIndex}
                  row={row}
                  rowIndex={rowIndex}
                  filteredMetadata={filteredMetadata}
                  handleCellChange={handleCellChange}
                  handleDeleteRow={handleDeleteRow}
                  validationResults={validationResults}
                />
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={filteredMetadata.length + 1}
                  className="text-center py-4"
                >
                  No data available. Click 'Add Row' to add new data.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
