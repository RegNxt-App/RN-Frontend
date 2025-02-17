import React from 'react';
import {Control} from 'react-hook-form';

import {FormControl, FormField, FormItem, FormLabel} from '@rn/ui/components/ui/form';
import {Input} from '@rn/ui/components/ui/input';

interface AzureFileShareFormProps {
  control: Control<any>;
  prefix?: string;
}

export const AzureFileShareForm: React.FC<AzureFileShareFormProps> = ({control, prefix = 'properties'}) => {
  const fields = [
    {name: 'access_key', label: 'Access Key', type: 'password'},
    {name: 'file_share_name', label: 'File Share Name', placeholder: 'myfileshare'},
    {name: 'storage_account_name', label: 'Storage Account Name', placeholder: 'mystorageaccount'},
  ];

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <FormField
          key={field.name}
          control={control}
          name={`${prefix}.${field.name}`}
          render={({field: formField}) => (
            <FormItem>
              <FormLabel>{field.label}</FormLabel>
              <FormControl>
                <Input
                  {...formField}
                  type={field.type || 'text'}
                  placeholder={field.placeholder}
                />
              </FormControl>
            </FormItem>
          )}
        />
      ))}
    </div>
  );
};
