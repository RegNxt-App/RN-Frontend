import React from 'react';
import {Control} from 'react-hook-form';

import {FormControl, FormField, FormItem, FormLabel} from '@rn/ui/components/ui/form';
import {Input} from '@rn/ui/components/ui/input';

interface PostgresFormProps {
  control: Control<any>;
  prefix?: string;
}

interface FormFieldConfig {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  className?: string;
}

export const PostgresForm: React.FC<PostgresFormProps> = ({control, prefix = 'properties'}) => {
  const fields: FormFieldConfig[][] = [
    [
      {name: 'POSTGRES_HOST', label: 'Host', placeholder: 'database.example.com', className: 'col-span-3'},
      {name: 'POSTGRES_PORT', label: 'Port', placeholder: '5432', type: 'number', className: 'col-span-3'},
    ],
    [
      {name: 'POSTGRES_USER', label: 'Username', placeholder: 'db_user', className: 'col-span-3'},
      {name: 'POSTGRES_DBNAME', label: 'Database Name', placeholder: 'my_database', className: 'col-span-3'},
    ],
    [
      {name: 'POSTGRES_SCHEMA', label: 'Schema', placeholder: 'public', className: 'col-span-3'},
      {
        name: 'POSTGRES_PASSWORD',
        label: 'Password',
        type: 'password',
        placeholder: 'Enter password',
        className: 'col-span-3',
      },
    ],
    [
      {
        name: 'POSTGRES_CONNECT_TIMEOUT',
        label: 'Connect Timeout',
        type: 'number',
        placeholder: '10',
        className: 'col-span-6',
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
      ))}
    </div>
  );
};

export default PostgresForm;
