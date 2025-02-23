import {Fragment, useEffect, useState} from 'react';

import {useDataViewContext} from '@/contexts/DataViewContext';
import {useDataView} from '@/hooks/api/use-dataview';
import {Field} from '@/types/databaseTypes';
import {Loader2} from 'lucide-react';

import {Checkbox} from '@rn/ui/components/ui/checkbox';
import {Input} from '@rn/ui/components/ui/input';
import {Label} from '@rn/ui/components/ui/label';
import {ScrollArea} from '@rn/ui/components/ui/scroll-area';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@rn/ui/components/ui/table';

interface FieldSelectionProps {
  config: Field[];
  updateConfig: (fields: Field[]) => void;
}

export function FieldSelection({config, updateConfig}: FieldSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSelected, setShowSelected] = useState(false);
  const [groupByTable, setGroupByTable] = useState(true);

  const {selectedObjects, fields, setFields, toggleFieldSelection} = useDataViewContext();
  const {useObjectFields} = useDataView();

  const {data: fieldsData, error, isLoading} = useObjectFields(selectedObjects);

  // Add this effect before the fieldsData effect
  useEffect(() => {
    if (config.length > 0 && fields.length === 0) {
      setFields((prev) => {
        const newFields = [...prev];
        config.forEach((configField) => {
          const fieldIndex = newFields.findIndex(
            (f) =>
              f.source === configField.source &&
              (f.column === configField.column || f.alias === configField.column)
          );
          if (fieldIndex !== -1) {
            newFields[fieldIndex] = {
              ...newFields[fieldIndex],
              selected: true,
            };
          }
        });
        return newFields;
      });
    }
  }, [config, fields.length, setFields]);
  useEffect(() => {
    if (fieldsData?.results) {
      const transformedFields = fieldsData.results.flatMap((tableInfo) =>
        tableInfo.fields.map((field) => {
          // Create the field ID in the same format as used in config
          const fieldId = `${field.id}`;

          // Check if this field was previously selected in config
          const existingField = config.find(
            (f) => f.source === tableInfo.table_name && (f.column === field.name || f.alias === field.name)
          );

          return {
            id: fieldId,
            source: tableInfo.table_name,
            column: field.name,
            alias: field.name,
            type: field.type,
            description: field.description,
            // Preserve selected state from config if it exists
            selected: !!existingField,
          };
        })
      );
      setFields(transformedFields);
    }
  }, [fieldsData, setFields, config]); // Added config to dependencies

  useEffect(() => {
    const selectedFields = fields.filter((field) => field.selected);
    updateConfig(selectedFields);
  }, [fields, updateConfig]);

  const toggleTableFields = (tableName: string, selected: boolean) => {
    setFields((prevFields) =>
      prevFields.map((field) => (field.source === tableName ? {...field, selected} : field))
    );
  };

  const groupedFields = groupByTable
    ? fields.reduce((acc, field) => {
        const fieldName = field.alias || field.column || '';
        if (
          !fieldName.toLowerCase().includes(searchTerm?.toLowerCase() || '') ||
          (showSelected && !field.selected)
        ) {
          return acc;
        }
        const table = field.source || 'Unknown';
        if (!acc[table]) acc[table] = [];
        acc[table].push(field);
        return acc;
      }, {} as Record<string, Field[]>)
    : {
        ungrouped: fields.filter((field) => {
          const fieldName = field.alias || field.column || '';
          return (
            fieldName.toLowerCase().includes(searchTerm?.toLowerCase() || '') &&
            (!showSelected || field.selected)
          );
        }),
      };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] items-center justify-center text-destructive">
        <p>Error loading fields. Please try again.</p>
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center text-muted-foreground">
        <p>No fields available. Please select objects first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Input
            type="text"
            placeholder="Search fields..."
            className="w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Label className="flex items-center space-x-2 cursor-pointer">
            <Checkbox
              checked={showSelected}
              onCheckedChange={(checked) => setShowSelected(!!checked)}
            />
            <span>Show selected only</span>
          </Label>
          <Label className="flex items-center space-x-2 cursor-pointer">
            <Checkbox
              checked={groupByTable}
              onCheckedChange={(checked) => setGroupByTable(!!checked)}
            />
            <span>Group by table</span>
          </Label>
        </div>

        <div className="text-sm text-muted-foreground">
          {fields.filter((f) => f.selected).length} of {fields.length} fields selected
        </div>
      </div>
      <ScrollArea className="h-[400px] border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Field Name</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(groupedFields).map(([tableName, tableFields]) => (
              <Fragment key={tableName}>
                {groupByTable && (
                  <TableRow className="bg-muted/50">
                    <TableCell>
                      <Checkbox
                        checked={tableFields.every((f) => f.selected)}
                        onCheckedChange={(checked) => toggleTableFields(tableName, !!checked)}
                      />
                    </TableCell>
                    <TableCell
                      colSpan={4}
                      className="font-medium"
                    >
                      {tableName} ({tableFields.length} fields)
                    </TableCell>
                  </TableRow>
                )}
                {tableFields.map((field) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Checkbox
                        id={`field-${field.id}`}
                        checked={field.selected}
                        onCheckedChange={() => toggleFieldSelection(field.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Label htmlFor={`field-${field.id}`}>{field.alias || field.column}</Label>
                    </TableCell>
                    <TableCell>{field.source}</TableCell>
                    <TableCell>{field.type || '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {field.description || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
