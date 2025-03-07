import React from 'react';

import {FormControl, FormDescription, FormField, FormItem, FormLabel} from '@rn/ui/components/ui/form';
import {Input} from '@rn/ui/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';
import {Skeleton} from '@rn/ui/components/ui/skeleton';
import {Switch} from '@rn/ui/components/ui/switch';
import {Textarea} from '@rn/ui/components/ui/textarea';

interface BasicFieldsProps {
  form: any;
  isEditMode: boolean;
  dataTypes: string[] | undefined;
  isLoadingTypes: boolean;
  selectedType: string;
  onTypeChange: (value: string) => void;
}

const BasicFields: React.FC<BasicFieldsProps> = ({
  form,
  isEditMode,
  dataTypes,
  isLoadingTypes,
  selectedType,
  onTypeChange,
}) => (
  <>
    <div className="grid grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="name"
        render={({field}) => (
          <FormItem>
            <FormLabel>Variable Name</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="e.g. reporting_date"
              />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="label"
        render={({field}) => (
          <FormItem>
            <FormLabel>Display Label</FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="e.g. Reporting Date"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <FormItem>
        <FormLabel>Data Type</FormLabel>
        {isLoadingTypes ? (
          <Skeleton className="h-10 w-full" />
        ) : dataTypes ? (
          <FormField
            control={form.control}
            name="data_type"
            render={({field}) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  onTypeChange(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  {dataTypes.map((type) => (
                    <SelectItem
                      key={type}
                      value={type}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        ) : null}
      </FormItem>

      <FormField
        control={form.control}
        name="is_active"
        render={({field}) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
              <FormLabel>Status</FormLabel>
              <FormDescription>Enable or disable this variable</FormDescription>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>

    <FormField
      control={form.control}
      name="description"
      render={({field}) => (
        <FormItem>
          <FormLabel>Description</FormLabel>
          <FormControl>
            <Textarea
              {...field}
              placeholder="Provide details about the variable's purpose and usage"
              className="min-h-[100px]"
            />
          </FormControl>
        </FormItem>
      )}
    />
  </>
);

export default BasicFields;
