import {Fragment, useEffect, useMemo, useState} from 'react';

import {useDataView} from '@/contexts/DataViewContext';
import {Field} from '@/types/databaseTypes';

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
  const {fields, setFields} = useDataView();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSelected, setShowSelected] = useState(false);
  const [groupByTable, setGroupByTable] = useState(true);

  useEffect(() => {
    if (config?.length > 0) {
      setFields(config.map((field) => ({...field, selected: true})));
    }
  }, []);

  useEffect(() => {
    const selectedFields = fields.filter((field) => field.selected);
    if (JSON.stringify(selectedFields) !== JSON.stringify(config)) {
      updateConfig(selectedFields);
    }
  }, [fields, config, updateConfig]);

  const toggleFieldSelection = (id: string) => {
    setFields(fields.map((field) => (field.id === id ? {...field, selected: !field.selected} : field)));
  };

  const toggleTableFields = (tableName: string, selected: boolean) => {
    setFields(fields.map((field) => (field.table === tableName ? {...field, selected} : field)));
  };

  const groupedFields = useMemo(() => {
    const filtered = fields.filter(
      (field) =>
        field?.name?.toLowerCase().includes(searchTerm?.toLowerCase()) && (!showSelected || field.selected)
    );

    if (!groupByTable) return {ungrouped: filtered};

    return filtered.reduce((acc, field) => {
      const table = field.table;
      if (!acc[table]) acc[table] = [];
      acc[table].push(field);
      return acc;
    }, {} as Record<string, Field[]>);
  }, [fields, searchTerm, showSelected, groupByTable]);

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
              id="show-selected"
              checked={showSelected}
              onCheckedChange={(checked) => setShowSelected(checked as boolean)}
            />
            <span>Show selected only</span>
          </Label>
          <Label className="flex items-center space-x-2 cursor-pointer">
            <Checkbox
              id="group-by-table"
              checked={groupByTable}
              onCheckedChange={(checked) => setGroupByTable(checked as boolean)}
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
            {groupByTable
              ? Object.entries(groupedFields).map(([tableName, tableFields]) => (
                  <Fragment key={tableName}>
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
                          <Label htmlFor={`field-${field.id}`}>{field.label || field.name}</Label>
                        </TableCell>
                        <TableCell>{field.table}</TableCell>
                        <TableCell>{field.type}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{field.description}</TableCell>
                      </TableRow>
                    ))}
                  </Fragment>
                ))
              : groupedFields.ungrouped.map((field) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Checkbox
                        id={`field-${field.id}`}
                        checked={field.selected}
                        onCheckedChange={() => toggleFieldSelection(field.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Label htmlFor={`field-${field.id}`}>{field.label || field.name}</Label>
                    </TableCell>
                    <TableCell>{field.table}</TableCell>
                    <TableCell>{field.type}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{field.description}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
