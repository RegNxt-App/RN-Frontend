import React from 'react';
import {Control} from 'react-hook-form';

import {VariableFormData} from '@/hooks/useVariableForm';

import {FormField, FormItem, FormLabel} from '@rn/ui/components/ui/form';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';

interface BooleanFieldsProps {
  control: Control<VariableFormData>;
}

const BooleanFields: React.FC<BooleanFieldsProps> = ({control}) => (
  <div className="grid grid-cols-1 gap-4">
    <FormField
      control={control}
      name="default_value"
      render={({field}) => (
        <FormItem>
          <FormLabel>Default Value</FormLabel>
          <div className="flex items-center space-x-2">
            <Select
              value={field.value?.toString() || ''}
              onValueChange={field.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select default value" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FormItem>
      )}
    />
  </div>
);

export default BooleanFields;
