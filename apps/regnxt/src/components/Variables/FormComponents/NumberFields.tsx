import React from 'react';
import {Control} from 'react-hook-form';

import {VariableFormData} from '@/hooks/useVariableForm';

import {FormControl, FormField, FormItem, FormLabel} from '@rn/ui/components/ui/form';
import {Input} from '@rn/ui/components/ui/input';

interface NumberFieldsProps {
  control: Control<VariableFormData>;
}

const NumberFields: React.FC<NumberFieldsProps> = ({control}) => (
  <div className="grid grid-cols-2 gap-4">
    <FormField
      control={control}
      name="min_value"
      render={({field}) => (
        <FormItem>
          <FormLabel>Minimum Value (Optional)</FormLabel>
          <FormControl>
            <Input
              {...field}
              value={field.value ?? ''}
              type="number"
              placeholder="Minimum allowed value"
            />
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="max_value"
      render={({field}) => (
        <FormItem>
          <FormLabel>Maximum Value (Optional)</FormLabel>
          <FormControl>
            <Input
              {...field}
              value={field.value ?? ''}
              type="number"
              placeholder="Maximum allowed value"
            />
          </FormControl>
        </FormItem>
      )}
    />
    <FormField
      control={control}
      name="default_value"
      render={({field}) => (
        <FormItem className="col-span-2">
          <FormLabel>Default Value (Optional)</FormLabel>
          <FormControl>
            <Input
              {...field}
              value={field.value ?? ''}
              type="number"
              placeholder="Default numeric value"
            />
          </FormControl>
        </FormItem>
      )}
    />
  </div>
);

export default NumberFields;
