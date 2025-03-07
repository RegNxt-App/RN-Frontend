import React from 'react';
import {Control} from 'react-hook-form';

import {ConnectionFormData, ConnectionType} from '@/types/databaseTypes';

import {FormField, FormItem, FormLabel} from '@rn/ui/components/ui/form';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';

interface ConnectionTypeSelectProps {
  types: ConnectionType[];
  onTypeSelect: (type: string) => void;
  control: Control<ConnectionFormData>;
}

const ConnectionTypeSelect: React.FC<ConnectionTypeSelectProps> = ({types, onTypeSelect, control}) => {
  return (
    <FormField
      control={control}
      name="type"
      render={({field}) => (
        <FormItem className="mb-4">
          <FormLabel>Connection Type</FormLabel>
          <Select
            value={field.value}
            onValueChange={(value) => {
              field.onChange(value);
              onTypeSelect(value);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a connection type" />
            </SelectTrigger>
            <SelectContent>
              {types.map((type) => (
                <SelectItem
                  key={type.type_id}
                  value={type.code}
                >
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};

export default ConnectionTypeSelect;
