import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Input } from '@rn/ui/components/ui/input';
import { Label } from '@rn/ui/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@rn/ui/components/ui/select';
import { Switch } from '@rn/ui/components/ui/switch';
import { Textarea } from '@rn/ui/components/ui/textarea';

interface FormData {
  code: string;
  label: string;
  description: string;
  framework: string;
  visible: boolean;
}

interface IdentificationFormProps {
  config: Partial<FormData>;
  updateConfig: (data: FormData) => void;
  isEdit?: boolean;
}

export function IdentificationForm({ config, updateConfig, isEdit }: IdentificationFormProps) {
  const { register, watch, setValue, control } = useForm<FormData>({
    defaultValues: {
      code: config.code || '',
      label: config.label || '',
      description: config.description || '',
      framework: config.framework || '',
      visible: config.visible || false,
    }
  });

  // Watch all form changes
  const formValues = watch();

  // Update parent component whenever form values change
  useEffect(() => {
    updateConfig(formValues);
  }, [formValues, updateConfig]);

  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="code">Code</Label>
        <Input
          id="code"
          placeholder="Enter unique code"
          {...register('code')}
          disabled={isEdit}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          placeholder="Enter label"
          {...register('label')}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter description"
          {...register('description')}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="framework">Framework</Label>
        <Select
          value={formValues.framework}
          onValueChange={(value) => setValue('framework', value, { shouldDirty: true })}
        >
          <SelectTrigger id="framework">
            <SelectValue placeholder="Select framework" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="framework1">Framework 1</SelectItem>
            <SelectItem value="framework2">Framework 2</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="visible">Visible</Label>
          <div className="text-sm text-muted-foreground">
            Make this data view visible to other users
          </div>
        </div>
        <Switch
          id="visible"
          checked={formValues.visible}
          onCheckedChange={(checked) => setValue('visible', checked, { shouldDirty: true })}
        />
      </div>
    </div>
  );
}