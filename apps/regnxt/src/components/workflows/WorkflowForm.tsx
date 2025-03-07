import React from 'react';
import {Controller, useForm} from 'react-hook-form';

import {Button} from '@rn/ui/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@rn/ui/components/ui/card';
import {Input} from '@rn/ui/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';
import {Textarea} from '@rn/ui/components/ui/textarea';

interface WorkflowFormData {
  workflow_id: number;
  code: string;
  label: string;
  description: string;
  engine: string;
  trigger_statement: string;
  execution_statement: string;
  active: boolean;
}

interface WorkflowFormProps {
  onNext: (data: WorkflowFormData) => void;
}

export const WorkflowForm: React.FC<WorkflowFormProps> = ({onNext}) => {
  const {
    register,
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<WorkflowFormData>({
    defaultValues: {
      code: '',
      label: '',
      description: '',
      engine: '',
      active: true,
      trigger_statement: 'null',
      execution_statement: 'null',
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Workflow Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onNext)}
          className="space-y-6"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="hidden"
                {...register('trigger_statement')}
              />
              <Input
                type="hidden"
                {...register('execution_statement')}
              />
              <div>
                <label className="text-sm font-medium">Code</label>
                <Input
                  {...register('code', {required: 'Code is required'})}
                  placeholder="Enter workflow code"
                />
                {errors.code && <p className="text-sm text-red-500 mt-1">{errors.code.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium">Engine</label>
                <Controller
                  name="engine"
                  control={control}
                  rules={{required: 'Engine is required'}}
                  render={({field}) => (
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select engine" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mage">Mage</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.engine && <p className="text-sm text-red-500 mt-1">{errors.engine.message}</p>}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Label</label>
              <Input
                {...register('label', {required: 'Label is required'})}
                placeholder="Enter workflow label"
              />
              {errors.label && <p className="text-sm text-red-500 mt-1">{errors.label.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                {...register('description', {required: 'Description is required'})}
                placeholder="Enter workflow description"
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">Next</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
