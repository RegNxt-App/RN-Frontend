import {useEffect, useState} from 'react';

import {useDataView} from '@/hooks/api/use-dataview';
import {Loader2} from 'lucide-react';

import {Card, CardContent, CardHeader, CardTitle} from '@rn/ui/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@rn/ui/components/ui/tabs';

import {Alert, AlertDescription} from '../ui/alert';
import {SqlEditor} from './DataViewWizard/SQLEditor';
import {VisualJoinEditor} from './VisualJoinEditor';

interface Table {
  id: string;
  name: string;
  columns: {name: string; type: string}[];
}

interface Join {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'inner' | 'left' | 'right' | 'full';
  conditions: {
    leftColumn: string;
    operator: string;
    rightColumn: string;
  }[];
}

interface JoinConfigurationProps {
  selectedObjects: any[]; // Use a more permissive type to handle different object formats
  config: any;
  updateConfig: (config: any) => void;
}

export function JoinConfiguration({selectedObjects, config, updateConfig}: JoinConfigurationProps) {
  const {useObjectColumns} = useDataView();
  
  console.log('JoinConfiguration - Selected Objects:', selectedObjects);
  // Ensure objects are properly formatted for the API call
  const normalizedObjects = selectedObjects.map(obj => {
    // Handle different possible object structures
    const id = obj.id || '';
    // For type, try to extract from id if not directly available
    const type = obj.type || (id.includes('_') ? id.split('_')[0] : '');
    // Use version from original object or create a default one
    const version = obj.version || { id: obj.version_id || 1 };
    // For name, try different possible fields or fallback to id
    const name = obj.name || obj.label || id;
    
    const normalized = { id, type, version, name };
    console.log('Normalized object:', normalized);
    return normalized;
  }).filter(obj => obj.id && obj.type);

  const {
    data: columnsData,
    isLoading: isLoadingColumns,
    error: columnsError,
  } = useObjectColumns(normalizedObjects);
  console.log('API Response - columnsData:', columnsData);

  const initialTables: Table[] =
    columnsData?.map((tableData) => {
      console.log('Processing table data:', tableData);
      return {
        id: tableData.id,
        name: tableData.name,
        columns: Array.isArray(tableData.columns) 
          ? tableData.columns.map((col) => ({
              name: col.name,
              type: col.type,
            }))
          : []
      };
    }) || [];

  const initialJoins: Join[] = config.joins || [];
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [joins, setJoins] = useState<Join[]>(initialJoins);
  const [sqlQuery, setSqlQuery] = useState<string>(generateSqlFromJoins(initialTables, initialJoins));

  useEffect(() => {
    if (columnsData && Array.isArray(columnsData) && columnsData.length > 0) {
      console.log('Updating tables from useEffect with columnsData:', columnsData);
      
      const updatedTables = columnsData.map((tableData) => ({
        id: tableData.id,
        name: tableData.name,
        columns: Array.isArray(tableData.columns) 
          ? tableData.columns.map((col) => ({
              name: col.name || 'Unknown',
              type: col.type || 'string',
            }))
          : []
      }));
      
      console.log('Updated tables:', updatedTables);
      setTables(updatedTables);
    }
  }, [columnsData]);

  function generateSqlFromJoins(tables: Table[], joins: Join[]): string {
    if (tables.length === 0) return '';

    let sql = 'SELECT\n  ';

    const columns = tables
      .map((table) => table.columns.map((col) => `${table.name}.${col.name}`).join(',\n  '))
      .join(',\n  ');

    sql += columns;

    sql += `\nFROM ${tables[0].name}`;

    joins.forEach((join) => {
      const sourceTable = tables.find((t) => t.id === join.sourceId);
      const targetTable = tables.find((t) => t.id === join.targetId);

      if (sourceTable && targetTable) {
        sql += `\n${join.type.toUpperCase()} JOIN ${targetTable.name}`;

        if (join.conditions.length > 0) {
          sql +=
            ' ON ' +
            join.conditions
              .map((condition) => {
                const leftTable = sourceTable.name;
                const rightTable = targetTable.name;
                return `${leftTable}.${condition.leftColumn} ${condition.operator} ${rightTable}.${condition.rightColumn}`;
              })
              .join(' AND ');
        }
      }
    });

    return sql;
  }

  function parseJoinsFromSql(sql: string): Join[] {
    const newJoins: Join[] = [];

    const joinRegex =
      /(INNER|LEFT|RIGHT|FULL)\s+JOIN\s+(\w+)\s+ON\s+([^)]+?)(?=\s+(?:INNER|LEFT|RIGHT|FULL)\s+JOIN|\s*$)/gi;
    let match;

    while ((match = joinRegex.exec(sql)) !== null) {
      const [_, type, targetTable, conditions] = match;

      const parsedConditions: {leftColumn: string; operator: string; rightColumn: string}[] = [];
      const conditionRegex = /(\w+)\.(\w+)\s*(=|!=|>|>=|<|<=)\s*(\w+)\.(\w+)/g;
      let conditionMatch;

      while ((conditionMatch = conditionRegex.exec(conditions)) !== null) {
        const [_, leftTable, leftCol, operator, rightTable, rightCol] = conditionMatch;

        parsedConditions.push({
          leftColumn: leftCol,
          operator: operator,
          rightColumn: rightCol,
        });
      }

      const sourceTable = tables.find((t) => t.name === parsedConditions[0]?.leftColumn);
      const targetTableObj = tables.find((t) => t.name === targetTable);

      if (sourceTable && targetTableObj) {
        newJoins.push({
          id: `join-${Date.now()}-${newJoins.length}`,
          sourceId: sourceTable.id,
          targetId: targetTableObj.id,
          type: type.toLowerCase() as 'inner' | 'left' | 'right' | 'full',
          conditions: parsedConditions,
        });
      }
    }

    return newJoins;
  }

  // Update visual joins when SQL changes
  const handleSqlUpdate = (sql: string) => {
    setSqlQuery(sql);
    try {
      const newJoins = parseJoinsFromSql(sql);
      setJoins(newJoins);
      updateConfig({...config, joins: newJoins, customSql: sql});
    } catch (error) {
      console.error('Failed to parse SQL:', error);
    }
  };

  const handleJoinUpdate = (newJoins: Join[]) => {
    setJoins(newJoins);
    const sql = generateSqlFromJoins(tables, newJoins);
    setSqlQuery(sql);
    updateConfig({...config, joins: newJoins, customSql: sql});
  };

  if (isLoadingColumns) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (columnsError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load table columns. Please try again.</AlertDescription>
      </Alert>
    );
  }

  return (
    <Tabs
      defaultValue="visual"
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="visual">Visual Editor</TabsTrigger>
        <TabsTrigger
          disabled
          value="advanced"
        >
          SQL Editor
        </TabsTrigger>
      </TabsList>

      <TabsContent
        value="visual"
        className="space-y-4"
      >
        <VisualJoinEditor
          tables={tables}
          joins={joins}
          onJoinUpdate={handleJoinUpdate}
        />
      </TabsContent>

      <TabsContent value="advanced">
        <Card>
          <CardHeader>
            <CardTitle>SQL Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <SqlEditor
              value={sqlQuery}
              onChange={handleSqlUpdate}
              height="400px"
              onValidQuery={handleSqlUpdate}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
