import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { MetadataItem, ValidationResult } from "@/types/databaseTypes";
import { format } from "date-fns";
import { AlertTriangle } from "lucide-react";
import React, { useMemo } from "react";
import { DatePicker } from "../GDate";
import { TableCell } from "../ui/table";

interface MetadataTableCellProps {
  item: MetadataItem;
  row: Record<string, string | null>;
  rowIndex: number;
  handleCellChange: (
    rowIndex: number,
    columnName: string,
    value: string | null
  ) => void;
  validationResults: ValidationResult[];
}

interface NormalizedOption {
  value: string;
  label: string;
}

const getInputType = (datatype: string): string => {
  switch (datatype.toLowerCase()) {
    case "number":
    case "integer":
    case "float":
    case "double":
    case "integer(6)":
      return "number";
    case "gregorianday":
    case "date":
      return "date";
    default:
      return "text";
  }
};

const normalizeValueOptions = (
  valueOptions: any[] | undefined
): NormalizedOption[] => {
  if (!valueOptions || !Array.isArray(valueOptions)) return [];

  return valueOptions
    .map((option) => {
      // If the option has item_code and item_name
      if (option.item_code !== undefined && option.item_name !== undefined) {
        return {
          value: option.item_code?.toString() || "",
          label: option.item_name || option.item_code?.toString() || "",
        };
      }

      // If option has reporting_date
      if (option.reporting_date) {
        const formattedDate = option.reporting_date.toString();
        const dateValue =
          formattedDate.length === 8
            ? `${formattedDate.slice(0, 4)}-${formattedDate.slice(
                4,
                6
              )}-${formattedDate.slice(6, 8)}`
            : formattedDate;
        return {
          value: dateValue,
          label: dateValue,
        };
      }

      // Handle direct value object
      if (typeof option === "object" && option !== null) {
        const value = Object.values(option)[0];
        return {
          value: value?.toString() || "",
          label: value?.toString() || "",
        };
      }

      return {
        value: option?.toString() || "",
        label: option?.toString() || "",
      };
    })
    .filter((option) => option.value !== ""); // Filter out empty options
};

const getValidationErrors = (
  row: Record<string, string | null>,
  columnName: string,
  validationResults: ValidationResult[]
): ValidationResult[] => {
  return validationResults.filter((result) => {
    const rowMatch = row.id
      ? result.row_id === row.id.toString()
      : result.row_id === "unsaved";
    const columnMatch =
      result.column_name.toLowerCase() === columnName.toLowerCase();
    return rowMatch && columnMatch;
  });
};

export const MetadataTableCell: React.FC<MetadataTableCellProps> = ({
  item,
  row,
  rowIndex,
  handleCellChange,
  validationResults,
}) => {
  const inputType = getInputType(item.datatype);
  const validationErrors = getValidationErrors(
    row,
    item.code,
    validationResults
  );
  const hasError = validationErrors.length > 0;
  const currentValue = row[item.code]?.toString() || "";

  const normalizedOptions = useMemo(() => {
    return normalizeValueOptions(item.value_options);
  }, [item.value_options]);

  const commonInputProps = {
    className: cn(
      "w-full border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-md shadow-sm",
      hasError && "border-red-500 pr-8"
    ),
  };

  const isValidDate = (dateString: string, pattern: string): boolean => {
    if (!pattern) return true;
    const regex = new RegExp(`^${pattern}$`);
    return regex.test(dateString);
  };

  const renderInput = () => {
    // Handle Select for value_options
    if (normalizedOptions.length > 0) {
      return (
        <Select
          value={currentValue}
          onValueChange={(value) =>
            handleCellChange(rowIndex, item.code, value)
          }
          // disabled={item.is_system_generated}
        >
          <SelectTrigger
            className={cn(commonInputProps.className, "h-10")}
            data-validation-error={hasError}
          >
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            {normalizedOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    // Handle Date inputs
    if (inputType === "date" && item.datatype === "GregorianDay") {
      const dateValue = row[item.code];
      const datePattern =
        item.datatype_format?.split("#!#")[1]?.split("=")[1] || "";

      return (
        <DatePicker
          value={dateValue}
          onChange={(newValue) =>
            handleCellChange(rowIndex, item.code, newValue)
          }
          isValidDate={(date) =>
            isValidDate(format(date, "yyyy-MM-dd"), datePattern)
          }
          className={commonInputProps.className}
          // disabled={item.is_system_generated}
        />
      );
    }

    // Default Input
    return (
      <Input
        type={inputType}
        value={currentValue}
        onChange={(e) =>
          handleCellChange(rowIndex, item.code, e.target.value || null)
        }
        // disabled={item.is_system_generated}
        {...commonInputProps}
        data-validation-error={hasError}
      />
    );
  };

  return (
    <TableCell
      className={cn("px-4 py-2 text-sm relative", hasError && "bg-red-50")}
      data-validation-error={hasError}
    >
      <div className="relative w-full">
        {renderInput()}
        {hasError && validationErrors.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertTriangle
                  className="h-4 w-4 text-red-500 absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer"
                  aria-label="Validation Error"
                />
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-xs p-2">
                  {validationErrors.map((error, index) => (
                    <p key={index} className="text-sm text-red-500 mb-1">
                      {error.validation_msg}
                    </p>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </TableCell>
  );
};
