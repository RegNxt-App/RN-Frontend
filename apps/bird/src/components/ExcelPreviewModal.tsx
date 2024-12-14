import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ExcelPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Record<string, string | null>[];
  columns: any[];
  onSave: (data: Record<string, string | null>[]) => Promise<void>;
}

const ExcelPreviewModal = ({
  isOpen,
  onClose,
  data,
  columns,
  onSave,
}: ExcelPreviewModalProps) => {
  const [previewData, setPreviewData] = useState<
    Record<string, string | null>[]
  >([]);
  const [isSaving, setIsSaving] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data && data.length > 0) {
      setPreviewData(data);
    }
  }, [data]);

  const handleCellChange = (
    rowIndex: number,
    columnName: string,
    value: string | null
  ) => {
    setPreviewData((prevData) => {
      const newData = [...prevData];
      newData[rowIndex] = {
        ...newData[rowIndex],
        [columnName]: value === "" ? null : value,
      };
      return newData;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(previewData);
      onClose();
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={false}>
      <DialogContent
        ref={dialogRef}
        className="max-w-[95vw] h-[90vh] flex flex-col overflow-hidden p-0"
      >
        <DialogHeader className="px-4 py-2">
          <DialogTitle>
            Preview Excel Data ({previewData.length} rows)
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden px-4">
          <div className="h-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead
                    className="sticky left-0 z-20 bg-gray-50 w-[50px]"
                    style={{ position: "sticky" }}
                  >
                    Row #
                  </TableHead>
                  {columns.map((column) => (
                    <TableHead
                      key={column.code}
                      className="px-4 py-3 text-left min-w-[200px]"
                    >
                      <div className="flex items-center space-x-1">
                        <span>{column.label}</span>
                        {/* ... tooltips remain the same ... */}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell
                      className="sticky left-0 z-20 bg-white border-r"
                      style={{ position: "sticky" }}
                    >
                      {rowIndex + 1}
                    </TableCell>
                    {columns.map((column) => (
                      <TableCell
                        key={column.code}
                        className="p-0 min-w-[200px]"
                      >
                        <Input
                          type="text"
                          value={row[column.code] || ""}
                          onChange={(e) =>
                            handleCellChange(
                              rowIndex,
                              column.code,
                              e.target.value
                            )
                          }
                          className="border-0 h-8 focus:ring-0 focus:ring-offset-0 bg-transparent"
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="p-4 bg-gray-50 border-t mt-auto">
          <div className="text-sm text-gray-500">
            {previewData.length} row(s) loaded
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || previewData.length === 0}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default ExcelPreviewModal;
