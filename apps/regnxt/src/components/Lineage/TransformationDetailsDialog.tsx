import React, {useMemo, useState} from 'react';

import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {TransformationDetail} from '@/types/databaseTypes';
import {ArrowRight, FileJson, Loader2} from 'lucide-react';

import {Badge} from '@rn/ui/components/ui/badge';
import {Card, CardContent, CardHeader, CardTitle} from '@rn/ui/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@rn/ui/components/ui/dialog';

interface TransformationDetailsDialogProps {
  details: TransformationDetail[];
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

const TransformationDetailsDialog: React.FC<TransformationDetailsDialogProps> = ({
  details,
  isOpen,
  onClose,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<string>('mapping');

  const transformationInfo = useMemo(
    () =>
      details && details.length > 0
        ? {
            id: details[0].logical_transformation_rule_id,
            sourceDataset: details[0].source_dataset,
            destinationDataset: details[0].destination_dataset,
          }
        : null,
    [details]
  );

  const mappingsBySource = useMemo(
    () =>
      details && details.length > 0
        ? details.reduce((acc, detail) => {
            const key = detail.source_column || '(null)';
            if (!acc[key]) {
              acc[key] = [];
            }
            acc[key].push(detail);
            return acc;
          }, {} as Record<string, typeof details>)
        : {},
    [details]
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-5xl max-h-[98vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">Transformation Rule Details</DialogTitle>
          <DialogDescription className="font-mono text-xs break-all">
            {transformationInfo?.id || ''}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Loading transformation details...</span>
          </div>
        ) : transformationInfo ? (
          <>
            <div className="flex items-center justify-center space-x-2 my-2">
              <Badge
                variant="outline"
                className="px-3 py-1"
              >
                {transformationInfo.sourceDataset}
              </Badge>
              <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Badge
                variant="outline"
                className="px-3 py-1"
              >
                {transformationInfo.destinationDataset}
              </Badge>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="mapping">Column Mapping</TabsTrigger>
                <TabsTrigger value="json">JSON View</TabsTrigger>
              </TabsList>

              <TabsContent
                value="mapping"
                className="mt-2"
              >
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Source Column</TableHead>
                          <TableHead>Destination Column</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {details.map((detail, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-xs">
                              {detail.source_column || (
                                <span className="text-muted-foreground italic">(null)</span>
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {detail.destination_column || (
                                <span className="text-muted-foreground italic">(null)</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                <div className="mt-4">
                  <div className="text-sm font-medium">Statistics</div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{details.length}</div>
                        <div className="text-xs text-muted-foreground">Total Columns Mapped</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold">{Object.keys(mappingsBySource).length}</div>
                        <div className="text-xs text-muted-foreground">Source Columns</div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent
                value="json"
                className="mt-2"
              >
                <Card>
                  <CardHeader className="pb-0">
                    <CardTitle className="text-sm flex items-center">
                      <FileJson className="h-4 w-4 mr-2" />
                      Transformation JSON
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="p-4 bg-muted rounded-md text-xs overflow-auto max-h-96">
                      {JSON.stringify(details, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="py-4 text-center text-muted-foreground">No transformation details available</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransformationDetailsDialog;
