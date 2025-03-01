import React from 'react';
import {Control} from 'react-hook-form';

import {VariableFormData} from '@/hooks/useVariableForm';

import {FormControl, FormField, FormItem, FormLabel} from '@rn/ui/components/ui/form';
import {Input} from '@rn/ui/components/ui/input';

interface StringFieldsProps {
  control: Control<VariableFormData>;
}

const StringFields: React.FC<StringFieldsProps> = ({control}) => (
  <div className="grid grid-cols-1 gap-4">
    <FormField
      control={control}
      name="regex_pattern"
      render={({field}) => (
        <FormItem>
          <FormLabel>Regex Pattern (Optional)</FormLabel>
          <FormControl>
            <Input
              {...field}
              value={field.value || ''}
              placeholder="e.g. ^[A-Za-z0-9]{1,10}$"
            />
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="default_value"
      render={({field}) => (
        <FormItem>
          <FormLabel>Default Value (Optional)</FormLabel>
          <FormControl>
            <Input
              {...field}
              value={field.value || ''}
              placeholder="Default string value"
            />
          </FormControl>
        </FormItem>
      )}
    />
  </div>
);

export default StringFields;
