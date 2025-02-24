import React, {useState} from 'react';

import {DerivationDetails, GenerationDetails} from '@/types/databaseTypes';
import {ColumnDef} from '@tanstack/react-table';
import {Loader2} from 'lucide-react';

import {Badge} from '@rn/ui/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@rn/ui/components/ui/dialog';

import {DerivationRuleContent} from './DerivationRuleContent';
import {GenerationRuleContent} from './GenerationRuleContent';

type TransformationDetail = DerivationDetails | GenerationDetails;

interface TransformationDetailsDialogProps {
  details: TransformationDetail | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}
type ReportingCell = {
  row_name: string;
  col_name: string;
  reporting_cell: string;
  filter_statement: string;
};
const TransformationDetailsDialog: React.FC<TransformationDetailsDialogProps> = ({
  details,
  isOpen,
  onClose,
  isLoading = false,
}) => {
  const [selectedRow, setSelectedRow] = useState(0);
  const columns: ColumnDef<ReportingCell>[] = [
    {
      accessorKey: 'row_name',
      header: 'Row Name',
      cell: ({row}) => <div className="text-xs">{row.getValue('row_name')}</div>,
    },
    {
      accessorKey: 'col_name',
      header: 'Column Name',
      cell: ({row}) => <div className="text-xs">{row.getValue('col_name')}</div>,
    },
    {
      accessorKey: 'reporting_cell',
      header: 'Reporting Cell',
      cell: ({row}) => <div className="text-xs">{row.getValue('reporting_cell')}</div>,
    },
  ];
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-5xl max-h-[98vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {details?.type === 'derivation' ? 'Derivation' : 'Generation'} Rule Details
          </DialogTitle>
          <DialogDescription className="text-xs break-all">
            {details?.base_details.logical_transformation_rule_id || ''}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Loading transformation details...</span>
          </div>
        ) : details ? (
          <>
            <div className="flex items-center justify-center space-x-2 my-2">
              <Badge
                variant="outline"
                className="px-3 py-1"
              >
                {details.base_details.destination_dataset}
              </Badge>
            </div>
            {details.type === 'derivation' ? (
              <DerivationRuleContent details={details} />
            ) : (
              <GenerationRuleContent
                details={details}
                selectedRow={selectedRow}
                setSelectedRow={setSelectedRow}
                columns={columns}
              />
            )}
          </>
        ) : (
          <div className="py-4 text-center text-muted-foreground">No transformation details available</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TransformationDetailsDialog;
