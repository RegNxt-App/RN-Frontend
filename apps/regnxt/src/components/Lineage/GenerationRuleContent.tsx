import React, {useMemo} from 'react';

import {GenerationDetails} from '@/types/databaseTypes';
import {getTableAlias, highlightAliasReferences, highlightDatasetName} from '@/utils/lineageUtils';
import {ColumnDef, Row} from '@tanstack/react-table';

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
  const {
    highlight_source_dataset: highlightSourceDataset,
    column_mappings,
    base_details,
    reporting_cells,
  } = details;

  const sourceDatasetMappings = useMemo(() => {
    return column_mappings.reduce<Record<string, typeof column_mappings>>((acc, mapping) => {
      (acc[mapping.source_dataset] ||= []).push(mapping);
      return acc;
    }, {});
  }, [column_mappings]);

  const tableColumns = useMemo(() => {
    const highlightedColumns = column_mappings
      .filter((m) => m.source_dataset === highlightSourceDataset)
      .map((m) => m.destination_column);

    return columns.map((col) => ({
      ...col,
      cell: ({row}: {row: Row<ReportingCell>}) => {
        if (!('accessorKey' in col)) return null;

        const value = row.getValue(col.accessorKey as keyof ReportingCell);
        const displayValue = typeof value === 'string' ? value : String(value);
        const shouldHighlight = highlightedColumns.some(
          (c) => c && typeof value === 'string' && value.includes(c)
        );

        return (
          <div className={`text-xs break-words ${shouldHighlight ? 'bg-yellow-100' : ''}`}>
            {displayValue}
          </div>
        );
      },
    }));
  }, [columns, column_mappings, highlightSourceDataset]);

  const highlightText = useMemo(
    () => (text: string) => {
      if (!text || !highlightSourceDataset) return text;
      const tableAlias = getTableAlias(text, highlightSourceDataset);
      if (!tableAlias) {
        return highlightDatasetName(text, highlightSourceDataset);
      }
      const tablePattern = new RegExp(`${highlightSourceDataset}\\s+${tableAlias}`, 'g');
      const tableParts = text.split(tablePattern);
      if (tableParts.length <= 1) {
        return text;
      }
      const initialElements: React.ReactNode[] = [];
      for (let i = 0; i < tableParts.length; i++) {
        if (i > 0) {
          initialElements.push(
            <span
              key={`table-${i}`}
              className="bg-yellow-200 font-medium"
            >
              {`${highlightSourceDataset} ${tableAlias}`}
            </span>
          );
        }
        initialElements.push(tableParts[i]);
      }
      const processedElements = initialElements.map((element, index) =>
        highlightAliasReferences(element, tableAlias, index)
      );
      return processedElements;
    },
    [highlightSourceDataset]
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Data selection</h4>
          <pre className="p-4 bg-muted rounded-md text-xs overflow-y-auto whitespace-pre-wrap break-words w-full">
            {highlightText(base_details.dataview_statement)}
          </pre>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Column mappings</h4>

          {Object.entries(sourceDatasetMappings).map(([sourceDataset, mappings]) => {
            const isHighlighted = sourceDataset === highlightSourceDataset;
            return (
              <div
                key={sourceDataset}
                className={`mb-4 ${isHighlighted ? 'bg-yellow-50 p-2 rounded-md' : ''}`}
              >
                <h3
                  className={`font-bold mb-2 break-words ${
                    isHighlighted ? 'bg-yellow-100 px-2 py-1 rounded' : ''
                  }`}
                >
                  Source Dataset: {sourceDataset}
                </h3>

                <div className="pl-4">
                  {mappings.map((mapping, index) => (
                    <div
                      key={index}
                      className="mb-2 group"
                    >
                      <p className="text-sm">
                        <span
                          className="cursor-help"
                          title={mapping.destination_column_label}
                        >
                          {sourceDataset}.{mapping.source_column}
                        </span>
                        {' → '}
                        <span>
                          {base_details.destination_dataset}.{mapping.destination_column}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h4 className="font-medium mb-2">Calculation</h4>
          <TransformationTable<ReportingCell>
            data={reporting_cells}
            columns={tableColumns}
            onRowClick={(row) => setSelectedRow(reporting_cells.indexOf(row))}
            showPagination={true}
            selectedRowIndex={selectedRow}
          />

          {reporting_cells[selectedRow] && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Filter statement</h4>
              <pre className="p-4 bg-muted rounded-md text-xs overflow-y-auto whitespace-pre-wrap break-words w-full">
                {highlightText(reporting_cells[selectedRow].filter_statement)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
