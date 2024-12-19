import {Dataset, DatasetVersion} from '@/types/databaseTypes';
import {format} from 'date-fns';

import {Badge} from '@rn/ui/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@rn/ui/components/ui/dialog';
import {ScrollArea} from '@rn/ui/components/ui/scroll-area';

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
    <Dialog
      open={isOpen}
      onOpenChange={onClose}
    >
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
                <div
                  key={index}
                  className="border-b pb-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{format(new Date(item.valid_from), 'PPP')}</Badge>
                      {item.valid_to && (
                        <Badge variant="secondary">
                          Valid until: {format(new Date(item.valid_to), 'PPP')}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 space-y-2">
                    {Object.entries(item.changes || {}).map(([field, value]: [string, any]) => (
                      <div
                        key={field}
                        className="grid grid-cols-3 gap-2 text-sm"
                      >
                        <span className="font-medium">{field}</span>
                        <span className="text-muted-foreground line-through">{value.old}</span>
                        <span className="text-green-600">{value.new}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No history available for this version
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
