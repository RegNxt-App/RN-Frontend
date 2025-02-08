import {useEffect, useState} from 'react';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Loader2, RefreshCw} from 'lucide-react';

import {ScrollArea} from '@rn/ui/components/ui/scroll-area';

interface DataViewConfig {
  fields: Array<{
    source: string;
    name: string;
    alias?: string;
  }>;
  objects: Array<{
    name: string;
    alias?: string;
  }>;
  joins: Array<{
    type: string;
    target: string;
    conditions: string[];
  }>;
  filters: string[];
  aggregations: Array<{
    function: string;
    column: string;
    alias?: string;
  }>;
}

interface PreviewModeProps {
  config: DataViewConfig;
  previewData: any[] | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export function PreviewMode({config, previewData, isLoading, onRefresh}: PreviewModeProps) {
  const [sqlQuery, setSqlQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const query = generateSqlQuery(config);
      setSqlQuery(query);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate SQL query');
    }
  }, [config]);

  const generateSqlQuery = (config: DataViewConfig): string => {
    // Generate SELECT clause
    const selectItems = [
      // Add regular fields
      ...config.fields.map((field) => {
        const column = `${field.source}.${field.name}`;
        return field.alias ? `${column} AS ${field.alias}` : column;
      }),
      // Add aggregations
      ...config.aggregations.map((agg) => {
        const column = `${agg.function}(${agg.column})`;
        return agg.alias ? `${column} AS ${agg.alias}` : column;
      }),
    ];

    const selectClause = `SELECT ${selectItems.length ? selectItems.join(', ') : '*'}`;

    // Generate FROM clause
    const fromObject = config.objects[0];
    const fromClause = `FROM ${fromObject.name}${fromObject.alias ? ` AS ${fromObject.alias}` : ''}`;

    // Generate JOIN clauses
    const joinClauses = config.joins
      .map((join) => {
        return `${join.type} JOIN ${join.target} ON ${join.conditions.join(' AND ')}`;
      })
      .join('\n');

    // Generate WHERE clause
    const whereClause = config.filters.length ? `WHERE ${config.filters.join(' AND ')}` : '';

    // Generate GROUP BY clause if there are aggregations
    const groupByFields = config.fields
      .filter((field) => !config.aggregations.some((agg) => agg.column === `${field.source}.${field.name}`))
      .map((field) => `${field.source}.${field.name}`);

    const groupByClause =
      config.aggregations.length && groupByFields.length ? `GROUP BY ${groupByFields.join(', ')}` : '';

    // Combine all parts
    return [selectClause, fromClause, joinClauses, whereClause, groupByClause].filter(Boolean).join('\n');
  };

  const renderPreviewTable = () => {
    if (!previewData?.length) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg font-medium">No preview data available</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your configuration or refresh the preview
          </p>
        </div>
      );
    }

    const columns = Object.keys(previewData[0]);

    return (
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead
                key={column}
                className="whitespace-nowrap"
              >
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {previewData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell key={`${rowIndex}-${column}`}>
                  {typeof row[column] === 'number'
                    ? row[column].toLocaleString()
                    : row[column]?.toString() || '-'}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>SQL Query</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh Preview
          </Button>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
          ) : (
            <pre className="bg-muted/50 overflow-x-auto rounded-md p-4 text-sm">
              <code>{sqlQuery}</code>
            </pre>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-[400px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ScrollArea className="h-[400px] rounded-md border">{renderPreviewTable()}</ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
