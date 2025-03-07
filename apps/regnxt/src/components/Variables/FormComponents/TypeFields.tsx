import React from 'react';
import {Control} from 'react-hook-form';

import {VariableFormData} from '@/hooks/useVariableForm';

import {FormControl, FormDescription, FormField, FormItem, FormLabel} from '@rn/ui/components/ui/form';
import {Input} from '@rn/ui/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';
import {Textarea} from '@rn/ui/components/ui/textarea';

interface TypeFieldsProps {
  type: string;
  control: Control<VariableFormData>;
}

const TypeFields: React.FC<TypeFieldsProps> = ({type, control}) => {
  const renderStringFields = () => (
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

  const renderNumberFields = () => (
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

  const renderBooleanFields = () => (
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

  const renderEnumFields = () => (
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

  switch (type) {
    case 'string':
      return renderStringFields();
    case 'number':
    case 'integer':
      return renderNumberFields();
    case 'boolean':
      return renderBooleanFields();
    case 'enum':
      return renderEnumFields();
    case 'date':
    default:
      return null;
  }
};

export default TypeFields;
