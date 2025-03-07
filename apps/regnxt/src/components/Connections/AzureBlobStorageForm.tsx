import React from 'react';
import {Control} from 'react-hook-form';

import {FormControl, FormField, FormItem, FormLabel} from '@rn/ui/components/ui/form';
import {Input} from '@rn/ui/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';

interface AzureBlobStorageFormProps {
  control: Control<any>;
  prefix?: string;
}

interface FormFieldConfig {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  className?: string;
  isSelect?: boolean;
  options?: {value: string; label: string}[];
}

export const AzureBlobStorageForm: React.FC<AzureBlobStorageFormProps> = ({
  control,
  prefix = 'properties',
}) => {
  const fields: FormFieldConfig[][] = [
    [
      {
        name: 'account_name',
        label: 'Storage Account Name',
        placeholder: 'mystorageaccount',
        className: 'col-span-3',
      },
      {
        name: 'container_name',
        label: 'Container Name',
        placeholder: 'mycontainer',
        className: 'col-span-3',
      },
    ],
    [
      {
        name: 'account_key',
        label: 'Account Key',
        type: 'password',
        placeholder: 'Enter account key',
        className: 'col-span-6',
      },
    ],
    [
      {
        name: 'protocol',
        label: 'Protocol',
        isSelect: true,
        className: 'col-span-3',
        options: [
          {value: 'https', label: 'HTTPS'},
          {value: 'http', label: 'HTTP'},
        ],
      },
      {
        name: 'endpoint_suffix',
        label: 'Endpoint Suffix',
        placeholder: 'core.windows.net',
        className: 'col-span-3',
      },
    ],
    [
      {
        name: 'timeout',
        label: 'Timeout (seconds)',
        type: 'number',
        placeholder: '60',
        className: 'col-span-3',
      },
      {
        name: 'retry_mode',
        label: 'Retry Mode',
        isSelect: true,
        className: 'col-span-3',
        options: [
          {value: 'exponential', label: 'Exponential'},
          {value: 'fixed', label: 'Fixed'},
        ],
      },
    ],
  ];

  return (
    <div className="space-y-4">
      {fields.map((rowFields, rowIndex) => (
        <div
          key={rowIndex}
          className="grid grid-cols-6 gap-4"
        >
          {rowFields.map((field) => (
            <FormField
              key={field.name}
              control={control}
              name={`${prefix}.${field.name}`}
              render={({field: formField}) => (
                <FormItem className={field.className}>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    {field.isSelect ? (
                      <Select
                        value={formField.value}
                        onValueChange={formField.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${field.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem
                              key={option.value}
                              value={option.value}
                            >
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        {...formField}
                        type={field.type || 'text'}
                        placeholder={field.placeholder}
                      />
                    )}
                  </FormControl>
                </FormItem>
              )}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default AzureBlobStorageForm;
