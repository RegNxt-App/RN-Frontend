import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dataset, DatasetVersion } from "@/types/databaseTypes";
import { format } from "date-fns";

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: Dataset | null;
  version: DatasetVersion | null;
  historyData: any[];
}

export function VersionHistoryModal({
  isOpen,
  onClose,
  dataset,
  version,
  historyData,
}: VersionHistoryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Version History</DialogTitle>
          {dataset && version && (
            <DialogDescription>
              {dataset.label} - Version {version.version_nr}
            </DialogDescription>
          )}
        </DialogHeader>

        <ScrollArea className="h-[400px] rounded-md border p-4">
          {historyData.length > 0 ? (
            <div className="space-y-4">
              {historyData.map((item, index) => (
                <div key={index} className="border-b pb-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {format(new Date(item.valid_from), "PPP")}
                      </Badge>
                      {item.valid_to && (
                        <Badge variant="secondary">
                          Valid until: {format(new Date(item.valid_to), "PPP")}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 space-y-2">
                    {Object.entries(item.changes || {}).map(
                      ([field, value]: [string, any]) => (
                        <div
                          key={field}
                          className="text-sm grid grid-cols-3 gap-2"
                        >
                          <span className="font-medium">{field}</span>
                          <span className="text-muted-foreground line-through">
                            {value.old}
                          </span>
                          <span className="text-green-600">{value.new}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No history available for this version
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
