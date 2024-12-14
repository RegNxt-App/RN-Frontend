import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Workbook } from "exceljs";
import { Download, Upload } from "lucide-react";
import { useRef, useState } from "react";
import ExcelPreviewModal from "./ExcelPreviewModal";

interface MetadataItem {
  code: string;
  datatype?: string;
  value_options?: Array<{
    value?: string;
    item_name?: string;
    item_code?: string;
    reporting_date?: string;
    entity?: string;
  }>;
  label: string;
}

interface ExcelOperationsProps {
  objectCode: string;
  columns: MetadataItem[];
  onUpload: (data: any) => Promise<void>;
  currentData?: any[];
  isLoading?: boolean;
}

export const ExcelOperations: React.FC<ExcelOperationsProps> = ({
  objectCode,
  columns,
  onUpload,
  currentData,
  isLoading,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<
    Record<string, string | null>[]
  >([]);

  const downloadTemplate = async () => {
    try {
      const workbook = new Workbook();
      const dataSheet = workbook.addWorksheet("Data") as any;
      const headers = columns.map((col) => col.code);

      // Create Validation sheet
      const validationSheet = workbook.addWorksheet("Validation");
      const columnsWithValidation = columns.filter(
        (col) => col.value_options?.length
      );

      // Add validation data vertically for each column
      let currentCol = 1;
      for (const col of columnsWithValidation) {
        // Add column header
        validationSheet.getCell(1, currentCol).value = col.code;

        // Add validation values
        col.value_options?.forEach((option, index) => {
          const value =
            option?.item_name ||
            option?.value ||
            option?.reporting_date ||
            option?.entity ||
            "";
          validationSheet.getCell(index + 2, currentCol).value = value;
        });
        currentCol++;
      }

      dataSheet.addRow(headers);
      columns.forEach((col, colIndex) => {
        if (col.value_options?.length) {
          const validationColIndex = columnsWithValidation.findIndex(
            (vc) => vc.code === col.code
          );

          if (validationColIndex !== -1) {
            const validationColLetter = getExcelColumn(validationColIndex + 1);
            const maxOptions = col.value_options?.length || 0;
            const dataColLetter = getExcelColumn(colIndex + 1);
            dataSheet?.dataValidations?.add(
              `${dataColLetter}2:${dataColLetter}1000`,
              {
                type: "list",
                allowBlank: true,
                formulae: [
                  `Validation!$${validationColLetter}$2:$${validationColLetter}$${
                    maxOptions + 1
                  }`,
                ],
              }
            );
          }
        }
      });

      const infoSheet = workbook.addWorksheet("Info");
      infoSheet.addRow(["object_code", objectCode]);
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${objectCode}_template.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Template downloaded successfully",
      });
    } catch (error) {
      console.error("Template creation error:", error);
      toast({
        title: "Error",
        description: "Failed to create template",
        variant: "destructive",
      });
    }
  };

  // Helper function to convert column index to Excel column letter
  function getExcelColumn(columnNumber: number): string {
    let dividend = columnNumber;
    let columnName = "";
    let modulo;

    while (dividend > 0) {
      modulo = (dividend - 1) % 26;
      columnName = String.fromCharCode(65 + modulo) + columnName;
      dividend = Math.floor((dividend - modulo) / 26);
    }

    return columnName;
  }

  const downloadData = async () => {
    try {
      if (!currentData?.length) {
        toast({
          title: "No Data",
          description: "No data available to download",
          variant: "destructive",
        });
        return;
      }

      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet("Data");
      worksheet.addRow(columns.map((col) => col.label));
      currentData.forEach((row) => {
        const rowData = columns.map((col) => row[col.code]);
        worksheet.addRow(rowData);
      });
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${objectCode}_data.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast({
        title: "Success",
        description: "Data downloaded successfully",
      });
    } catch (error) {
      console.error("Data download error:", error);
      toast({
        title: "Error",
        description: "Failed to download data",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      toast({
        title: "Processing",
        description: "Reading file data...",
      });

      const workbook = new Workbook();
      await workbook.xlsx.load(await file.arrayBuffer());

      const worksheet = workbook.getWorksheet("Data");
      if (!worksheet) {
        throw new Error("Data worksheet not found");
      }

      const headers = worksheet.getRow(1).values as string[];
      headers.shift();

      const columnMapping = new Map<number, string>();
      headers.forEach((header, index) => {
        const matchingColumn = columns.find((col) => col.code === header);
        if (matchingColumn) {
          columnMapping.set(index + 1, matchingColumn.code);
        }
      });

      const processedData: Record<string, string | null>[] = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;

        const rowData: Record<string, string | null> = {};
        columnMapping.forEach((code, index) => {
          const cellValue = row.getCell(index).value;
          if (
            cellValue !== null &&
            cellValue !== undefined &&
            cellValue !== ""
          ) {
            const column = columns.find((col) => col.code === code);
            if (column?.value_options) {
              // Find the corresponding item_code for the displayed item_name
              const option = column.value_options.find(
                (opt) => opt.item_name === cellValue.toString()
              );
              rowData[code] = option?.item_code || cellValue.toString();
            } else {
              rowData[code] = cellValue.toString();
            }
          } else {
            rowData[code] = null;
          }
        });

        if (Object.values(rowData).some((value) => value !== null)) {
          processedData.push(rowData);
        }
      });

      if (processedData.length === 0) {
        throw new Error("No valid data found in the file");
      }

      setPreviewData(processedData);
      setIsPreviewModalOpen(true);
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to process file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handlePreviewSave = async (data: Record<string, string | null>[]) => {
    try {
      await onUpload({ data });
      setIsPreviewModalOpen(false);
      toast({
        title: "Success",
        description: `Successfully uploaded ${data.length} rows of data`,
      });
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Error",
        description: "Failed to save data",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={downloadTemplate}
              disabled={isLoading}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </TooltipTrigger>
          <TooltipContent>Download empty template</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={downloadData}
              disabled={isLoading || !currentData?.length}
            >
              <Download className="h-4 w-4 mr-2" />
              Save Data
            </Button>
          </TooltipTrigger>
          <TooltipContent>Download current data as Excel</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Data
            </Button>
          </TooltipTrigger>
          <TooltipContent>Upload Excel file</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".xlsx,.xls"
        onChange={handleUpload}
        disabled={isLoading || isUploading}
      />
      <ExcelPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        data={previewData}
        columns={columns}
        onSave={handlePreviewSave}
      />
    </div>
  );
};
