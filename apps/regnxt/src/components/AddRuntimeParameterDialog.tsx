import React from 'react';

import {toast} from '@/hooks/use-toast';
import {orchestraBackendInstance} from '@/lib/axios';
import {AvailableParameter} from '@/types/databaseTypes';

import {Button} from '@rn/ui/components/ui/button';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from '@rn/ui/components/ui/dialog';
import {Input} from '@rn/ui/components/ui/input';
import {Label} from '@rn/ui/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';

interface AddRuntimeParameterDialogProps {
  taskId: number;
  availableParameters: AvailableParameter[];
  onParameterAdd: () => void;
  isDisabled: boolean;
}

export const AddRuntimeParameterDialog = ({
  taskId,
  availableParameters,
  onParameterAdd,
  isDisabled,
}: AddRuntimeParameterDialogProps) => {
  const [selectedParam, setSelectedParam] = React.useState<string>('');
  const [defaultValue, setDefaultValue] = React.useState<string>('');
  const [open, setOpen] = React.useState(false);

  const handleAdd = async () => {
    try {
      await orchestraBackendInstance.post(`/api/v1/tasks/${taskId}/add-runtime-parameter/`, [
        {
          parameter_id: parseInt(selectedParam),
          default_value: defaultValue,
        },
      ]);

      onParameterAdd();
      setOpen(false);
      setSelectedParam('');
      setDefaultValue('');

      toast({
        title: 'Success',
        description: 'Runtime parameter added successfully',
      });
    } catch (error) {
      console.error('Failed to add runtime parameter:', error);
      toast({
        title: 'Error',
        description: 'Failed to add runtime parameter',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isDisabled}
        >
          Add Parameter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Runtime Parameter</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Parameter</Label>
            <Select
              value={selectedParam}
              onValueChange={setSelectedParam}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select parameter" />
              </SelectTrigger>
              <SelectContent>
                {availableParameters.map((param) => (
                  <SelectItem
                    key={param.variable_id}
                    value={param.variable_id.toString()}
                  >
                    {param.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Default Value</Label>
            <Input
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              placeholder="Enter default value"
            />
          </div>
        </div>
        <Button
          onClick={handleAdd}
          disabled={!selectedParam}
        >
          Add Parameter
        </Button>
      </DialogContent>
    </Dialog>
  );
};
