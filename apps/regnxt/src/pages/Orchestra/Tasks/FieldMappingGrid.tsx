import React from 'react';

import {FieldMappingGridProps} from '@/types/databaseTypes';

import {Badge} from '@rn/ui/components/ui/badge';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@rn/ui/components/ui/table';

export const FieldMappingGrid: React.FC<FieldMappingGridProps> = ({
  sourceFields,
  destinationFields,
  runtimeParams,
  mappings,
  onMappingChange,
  disabled,
}) => {
  const handleFieldChange = (
    destinationField: string,
    field: 'sourceField' | 'runtimeParam',
    value: string
  ) => {
    const newMappings = mappings.map((mapping) => {
      if (mapping.destinationField === destinationField) {
        return {...mapping, [field]: value};
      }
      return mapping;
    });
    onMappingChange(newMappings);
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Destination Field</TableHead>
            <TableHead>Source Field</TableHead>
            <TableHead>Runtime Parameter</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {destinationFields.map((destField) => {
            const mapping = mappings.find((m) => m.destinationField === destField.name) || {
              destinationField: destField.name,
              sourceField: '',
              runtimeParam: '',
            };

            return (
              <TableRow key={destField.name}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span>{destField.label}</span>
                    <Badge variant="secondary">{destField.type}</Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={mapping.sourceField}
                    onValueChange={(value) => handleFieldChange(destField.name, 'sourceField', value)}
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {sourceFields.map((field) => (
                        <SelectItem
                          key={field.name}
                          value={field.name}
                        >
                          {field.label} ({field.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={mapping.runtimeParam || ''}
                    onValueChange={(value) => handleFieldChange(destField.name, 'runtimeParam', value)}
                    disabled={disabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parameter (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {runtimeParams.map((param) => (
                        <SelectItem
                          key={param.id}
                          value={param.id}
                        >
                          {param.name} ({param.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
