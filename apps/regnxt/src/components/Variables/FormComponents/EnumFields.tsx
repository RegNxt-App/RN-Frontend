import React from 'react';
import {Control} from 'react-hook-form';

import {VariableFormData} from '@/hooks/useVariableForm';

import {FormControl, FormDescription, FormField, FormItem, FormLabel} from '@rn/ui/components/ui/form';
import {Input} from '@rn/ui/components/ui/input';
import {Textarea} from '@rn/ui/components/ui/textarea';

interface EnumFieldsProps {
  control: Control<VariableFormData>;
}

const EnumFields: React.FC<EnumFieldsProps> = ({control}) => (
  <div className="grid grid-cols-1 gap-4">
    <FormField
      control={control}
      name="allowed_values"
      render={({field}) => (
        <FormItem>
          <FormLabel>Allowed Values</FormLabel>
          <FormControl>
            <Textarea
              {...field}
              value={field.value || ''}
              placeholder="Comma-separated values or SQL statement"
              className="min-h-[100px]"
            />
          </FormControl>
          <FormDescription>
            Enter comma-separated values (e.g., "red,green,blue") or SQL statement
          </FormDescription>
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
              placeholder="Must be one of the allowed values"
            />
          </FormControl>
        </FormItem>
      )}
    />
  </div>
);

export default EnumFields;
