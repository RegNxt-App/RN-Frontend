import {useCallback, useEffect, useState} from 'react';

import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {format} from 'date-fns';
import {Loader2, RefreshCw} from 'lucide-react';

import {ScrollArea} from '@rn/ui/components/ui/scroll-area';

interface Field {
  source: string;
  name: string;
  alias?: string;
  is_aggregated?: boolean;
  type?: string;
}

interface DataObject {
  name: string;
  alias?: string;
  type: string;
  id: string;
}

interface JoinCondition {
  leftOperand: string;
  operator: string;
  rightOperand: string;
}

interface Join {
  type: string;
  source: string;
  target: string;
  conditions: JoinCondition[];
}

interface Filter {
  field: string;
  operator: string;
  value: string | number;
  logicalOperator?: 'AND' | 'OR';
}

interface Aggregation {
  function: string;
  field: string;
  source: string;
  alias?: string;
}

interface DataViewConfig {
  fields: Field[];
  objects: DataObject[];
  joins: Join[];
  filters: Filter[];
  aggregations: Aggregation[];
}

interface PreviewModeProps {
  config: DataViewConfig;
  previewData: Record<string, any>[] | null;
  isLoading: boolean;
  onRefresh: () => void;
}

const SQL_OPERATORS = {
  equals: '=',
  not_equals: '!=',
  greater_than: '>',
  less_than: '<',
  greater_equals: '>=',
  less_equals: '<=',
  like: 'LIKE',
  in: 'IN',
  not_in: 'NOT IN',
  is_null: 'IS NULL',
  is_not_null: 'IS NOT NULL',
};

export function PreviewMode({config, previewData, isLoading, onRefresh}: PreviewModeProps) {
  const [sqlQuery, setSqlQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  const generateSqlQuery = useCallback((config: DataViewConfig): string => {
    try {
      const safeConfig = {
        ...config,
        fields: Array.isArray(config.fields) ? config.fields : [],
        objects: Array.isArray(config.objects) ? config.objects : [],
        joins: Array.isArray(config.joins) ? config.joins : [],
        filters: Array.isArray(config.filters) ? config.filters : [],
        aggregations: Array.isArray(config.aggregations) ? config.aggregations : [],
      };

      const selectItems = [
        ...safeConfig.fields
          .map((field) => {
            if (!field.source || !field.column) {
              console.warn('Field is missing required properties:', field);
              return '';
            }

            const object = safeConfig.objects.find((obj) => obj.name === field.source);
            const tableName = object?.alias || field.source;
            const column = `${tableName}.${field.column}`;
            return field.alias ? `${column} AS "${field.alias}"` : column;
          })
          .filter(Boolean),
        ...safeConfig.aggregations
          .map((agg) => {
            if (!agg.function || !agg.field) {
              console.warn('Aggregation is missing required properties:', agg);
              return '';
            }
            if (agg.field.includes('.')) {
              const parts = agg.field.split('.');
              if (parts.length === 2) {
                const tableName = parts[0];
                const column = parts[1];
                const object = safeConfig.objects.find(
                  (obj) => obj.name === tableName || obj.alias === tableName
                );
                const sourceRef = object?.alias || tableName;
                const fullColumn = `${agg.function}(${sourceRef}.${column})`;
                return agg.alias ? `${fullColumn} AS "${agg.alias}"` : fullColumn;
              }
            }
            const sourceObj = agg.source ? safeConfig.objects.find((obj) => obj.name === agg.source) : null;
            const object = sourceObj || safeConfig.objects.find((obj) => obj.alias === agg.source);

            if (!object && !agg.source) {
              console.warn('Cannot resolve table for aggregation:', agg);
              return '';
            }

            const tableName = (object?.alias || agg.source || '').trim();
            if (!tableName) {
              console.warn('Empty table name for aggregation:', agg);
              return '';
            }

            const column = `${agg.function}(${tableName}.${agg.field})`;
            return agg.alias ? `${column} AS "${agg.alias}"` : column;
          })
          .filter(Boolean),
      ];

      const selectClause = `SELECT\n  ${selectItems.length ? selectItems.join(',\n  ') : '*'}`;

      if (!safeConfig.objects.length) {
        throw new Error('No tables selected');
      }
      const baseObject = safeConfig.objects[0];
      const fromClause = `FROM ${baseObject.name}${baseObject.alias ? ` AS ${baseObject.alias}` : ''}`;
      const joinClauses = safeConfig.joins.map((join) => {
        const conditions = join?.conditions
          ?.map((condition) => {
            let {leftOperand, operator, rightOperand} = condition;
            operator = SQL_OPERATORS[operator as keyof typeof SQL_OPERATORS] || operator;

            if (operator === 'IN' || operator === 'NOT IN') {
              rightOperand = `(${rightOperand})`;
            }

            return `${leftOperand} ${operator} ${rightOperand}`;
          })
          .join(' AND ');

        return `${join.type.toUpperCase()} JOIN ${join.target} ON ${conditions}`;
      });

      const whereConditions = safeConfig.filters
        .filter((filter) => {
          if (!filter.field || !filter.operator) {
            console.warn('Filter missing required properties:', filter);
            return false;
          }
          return true;
        })
        ?.map((filter, index) => {
          const operator = SQL_OPERATORS[filter.operator as keyof typeof SQL_OPERATORS] || filter.operator;
          let fieldRef = filter.field;
          if (fieldRef.includes('.')) {
            const parts = fieldRef.split('.');
            if (parts.length === 2) {
              const tableName = parts[0];
              const columnName = parts[1];
              const object = safeConfig.objects.find(
                (obj) => obj.name === tableName || obj.alias === tableName
              );
              const sourceRef = object?.alias || tableName;
              fieldRef = `${sourceRef}.${columnName}`;
            }
          }
          let condition = `${fieldRef} ${operator} `;
          if (operator === 'IS NULL' || operator === 'IS NOT NULL') {
            condition = `${fieldRef} ${operator}`;
          } else if (typeof filter.value === 'string') {
            condition += operator.toLowerCase().includes('like')
              ? `'%${filter.value}%'`
              : `'${filter.value}'`;
          } else if (filter.value !== undefined && filter.value !== null) {
            condition += filter.value;
          } else {
            console.warn('Filter has no value:', filter);
            return '';
          }
          return index > 0 && filter.logicalOperator ? `${filter.logicalOperator} ${condition}` : condition;
        })
        .filter(Boolean);

      const whereClause = whereConditions.length ? `WHERE ${whereConditions.join(' ')}` : '';

      const groupByFields = safeConfig.fields
        .filter((field) => {
          if (field.is_aggregated) return false;
          if (!field.source || !field.column) {
            console.warn('Field missing required properties for GROUP BY:', field);
            return false;
          }
          return true;
        })
        ?.map((field) => {
          const object = safeConfig.objects.find((obj) => obj.name === field.source);
          const tableName = object?.alias || field.source;
          return `${tableName}.${field.column}`;
        });

      const groupByClause =
        config.aggregations.length && groupByFields.length ? `GROUP BY ${groupByFields.join(', ')}` : '';
      const query = [selectClause, fromClause, ...joinClauses, whereClause, groupByClause]
        .filter(Boolean)
        .join('\n');

      return query;
    } catch (err) {
      console.error('Error generating SQL query:', err);
      throw new Error('Failed to generate SQL query');
    }
  }, []);

  useEffect(() => {
    try {
      const query = generateSqlQuery(config);
      setSqlQuery(query);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate SQL query');
    }
  }, [config, generateSqlQuery]);

  const formatCellValue = useCallback((value: any, type?: string) => {
    if (value === null || value === undefined) return '-';

    if (type === 'date' || type === 'timestamp') {
      try {
        return format(new Date(value), 'yyyy-MM-dd HH:mm:ss');
      } catch {
        return value;
      }
    }

    if (typeof value === 'number') {
      return value.toLocaleString();
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    return value.toString();
  }, []);

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
            {columns?.map((column) => (
              <TableHead
                key={column}
                className="whitespace-nowrap"
                style={{width: columnWidths[column]}}
              >
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {previewData?.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns?.map((column) => {
                const field = config.fields.find(
                  (f) => f.alias === column || `${f.source}.${f.name}` === column
                );
                return (
                  <TableCell key={`${rowIndex}-${column}`}>
                    {formatCellValue(row[column], field?.type)}
                  </TableCell>
                );
              })}
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
