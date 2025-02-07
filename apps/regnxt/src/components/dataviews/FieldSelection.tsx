import { useEffect, useState } from 'react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@rn/ui/components/ui/table';

import { Checkbox } from '@rn/ui/components/ui/checkbox';
import { Input } from '@rn/ui/components/ui/input';
import { Label } from '@rn/ui/components/ui/label';
import { ScrollArea } from '@rn/ui/components/ui/scroll-area';

interface Field {
  id: string;
  name: string;
  table: string;
  type: string;
  selected: boolean;
}

interface FieldSelectionProps {
  config: Field[];
  updateConfig: (fields: Field[]) => void;
}

export function FieldSelection({config, updateConfig}: FieldSelectionProps) {
  const [fields, setFields] = useState<Field[]>(
    config.length > 0
      ? config
      : [
          {id: '1', name: 'Customer ID', table: 'Customer Data', type: 'Integer', selected: false},
          {id: '2', name: 'First Name', table: 'Customer Data', type: 'String', selected: false},
          {id: '3', name: 'Last Name', table: 'Customer Data', type: 'String', selected: false},
          {id: '4', name: 'Email', table: 'Customer Data', type: 'String', selected: false},
          {id: '5', name: 'Transaction ID', table: 'Transaction History', type: 'Integer', selected: false},
          {id: '6', name: 'Amount', table: 'Transaction History', type: 'Decimal', selected: false},
          {id: '7', name: 'Date', table: 'Transaction History', type: 'Date', selected: false},
          {id: '8', name: 'Account Balance', table: 'Account Summary', type: 'Decimal', selected: false},
        ]
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [showSelected, setShowSelected] = useState(false);

  useEffect(() => {
    const selectedFields = fields.filter((field) => field.selected);
    if (JSON.stringify(selectedFields) !== JSON.stringify(config)) {
      updateConfig(selectedFields);
    }
  }, [fields, config, updateConfig]);

  const toggleFieldSelection = (id: string) => {
    setFields(fields.map((field) => (field.id === id ? {...field, selected: !field.selected} : field)));
  };

  const filteredFields = fields.filter(
    (field) =>
      field.name.toLowerCase().includes(searchTerm.toLowerCase()) && (!showSelected || field.selected)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Search fields..."
          className="max-w-sm"
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
      </div>
      <ScrollArea className="h-[400px] border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Field Name</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFields.map((field) => (
              <TableRow key={field.id}>
                <TableCell>
                  <Checkbox
                    id={`field-${field.id}`}
                    checked={field.selected}
                    onCheckedChange={() => toggleFieldSelection(field.id)}
                  />
                </TableCell>
                <TableCell>
                  <Label htmlFor={`field-${field.id}`}>{field.name}</Label>
                </TableCell>
                <TableCell>{field.table}</TableCell>
                <TableCell>{field.type}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
