import React from 'react';
import {Control} from 'react-hook-form';

import {FormControl, FormField, FormItem, FormLabel} from '@rn/ui/components/ui/form';
import {Input} from '@rn/ui/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';

interface AwsS3FormProps {
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

export const AwsS3Form: React.FC<AwsS3FormProps> = ({control, prefix = 'properties'}) => {
  const fields: FormFieldConfig[][] = [
    [
      {
        name: 'bucket_name',
        label: 'Bucket Name',
        placeholder: 'my-s3-bucket',
        className: 'col-span-3',
      },
      {
        name: 'region',
        label: 'Region',
        isSelect: true,
        className: 'col-span-3',
        options: [
          {value: 'us-east-1', label: 'US East (N. Virginia)'},
          {value: 'us-west-1', label: 'US West (N. California)'},
          {value: 'us-west-2', label: 'US West (Oregon)'},
          {value: 'eu-west-1', label: 'EU (Ireland)'},
          {value: 'eu-central-1', label: 'EU (Frankfurt)'},
          {value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)'},
          {value: 'ap-southeast-2', label: 'Asia Pacific (Sydney)'},
          {value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)'},
          {value: 'ap-northeast-2', label: 'Asia Pacific (Seoul)'},
          {value: 'sa-east-1', label: 'South America (São Paulo)'},
        ],
      },
    ],
    [
      {
        name: 'access_key_id',
        label: 'Access Key ID',
        placeholder: 'Enter AWS access key ID',
        className: 'col-span-6',
      },
    ],
    [
      {
        name: 'secret_access_key',
        label: 'Secret Access Key',
        type: 'password',
        placeholder: 'Enter AWS secret access key',
        className: 'col-span-6',
      },
    ],
    [
      {
        name: 'storage_class',
        label: 'Storage Class',
        isSelect: true,
        className: 'col-span-3',
        options: [
          {value: 'STANDARD', label: 'Standard'},
          {value: 'REDUCED_REDUNDANCY', label: 'Reduced Redundancy'},
          {value: 'STANDARD_IA', label: 'Standard-IA'},
          {value: 'ONEZONE_IA', label: 'One Zone-IA'},
          {value: 'INTELLIGENT_TIERING', label: 'Intelligent-Tiering'},
          {value: 'GLACIER', label: 'Glacier'},
          {value: 'DEEP_ARCHIVE', label: 'Deep Archive'},
        ],
      },
      {
        name: 'endpoint_url',
        label: 'Endpoint URL (Optional)',
        placeholder: 'Custom endpoint URL',
        className: 'col-span-3',
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

export default AwsS3Form;
