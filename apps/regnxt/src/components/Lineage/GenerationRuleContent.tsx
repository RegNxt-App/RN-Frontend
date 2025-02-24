import React from 'react';

import {GenerationDetails} from '@/types/databaseTypes';
import {ColumnDef} from '@tanstack/react-table';

import {Card, CardContent} from '@rn/ui/components/ui/card';

import {TransformationTable} from './TransformationTable';

type ReportingCell = {
  row_name: string;
  col_name: string;
  reporting_cell: string;
  filter_statement: string;
};
interface GenerationRuleContentProps {
  details: GenerationDetails;
  selectedRow: number;
  setSelectedRow: (index: number) => void;
  columns: ColumnDef<ReportingCell>[];
}

export const GenerationRuleContent: React.FC<GenerationRuleContentProps> = ({
  details,
  selectedRow,
  setSelectedRow,
  columns,
}) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div>
            {Object.entries(
              details.column_mappings.reduce((acc, mapping) => {
                if (!acc[mapping.source_dataset]) {
                  acc[mapping.source_dataset] = [];
                }
                acc[mapping.source_dataset].push(mapping);
                return acc;
              }, {} as Record<string, typeof details.column_mappings>)
            ).map(([sourceDataset, mappings]) => (
              <div
                key={sourceDataset}
                className="mb-4"
              >
                {mappings.map((mapping, index) => (
                  <div
                    key={index}
                    className="ml-4 mb-2"
                  >
                    <h4 className="font-medium mb-2">
                      Calculation of field <span>{mapping.destination_column}</span> (
                      {mapping.destination_column_label})
                    </h4>
                    <p className="text-xs">
                      {sourceDataset} {'->'} {details.base_details.destination_dataset}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Source</h4>
          <pre className="p-4 bg-muted rounded-md text-xs overflow-auto whitespace-pre-wrap">
            {details.base_details.dataview_statement}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Calculation</h4>
          <TransformationTable<ReportingCell>
            data={details.reporting_cells}
            columns={columns}
            onRowClick={(row) => setSelectedRow(details.reporting_cells.indexOf(row))}
            showPagination={true}
            selectedRowIndex={selectedRow}
          />
          {details.reporting_cells[selectedRow] && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Filter statement</h4>
              <pre className="p-4 bg-muted rounded-md text-xs overflow-auto whitespace-pre-wrap">
                {details.reporting_cells[selectedRow].filter_statement}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
