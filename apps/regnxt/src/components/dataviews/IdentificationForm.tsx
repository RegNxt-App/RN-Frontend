import {useEffect} from 'react';
import {useForm} from 'react-hook-form';

import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';

import {Alert, AlertDescription} from '@rn/ui/components/ui/alert';
import {Input} from '@rn/ui/components/ui/input';
import {Label} from '@rn/ui/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';
import {Switch} from '@rn/ui/components/ui/switch';
import {Textarea} from '@rn/ui/components/ui/textarea';

// Form validation schema
const formSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50),
  label: z.string().min(1, 'Label is required').max(100),
  description: z.string().max(500).optional(),
  framework: z.string().min(1, 'Framework is required'),
  visible: z.boolean().default(true),
});

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
  availableFrameworks?: Array<{value: string; label: string}>;
}

export function IdentificationForm({
  config,
  updateConfig,
  isEdit = false,
  availableFrameworks = [
    {value: 'framework1', label: 'Framework 1'},
    {value: 'framework2', label: 'Framework 2'},
  ],
}: IdentificationFormProps) {
  const {
    register,
    watch,
    setValue,
    formState: {errors},
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      label: '',
      description: '',
      framework: '',
      visible: true,
    },
  });

  // Initialize form with config values when in edit mode or when config changes
  useEffect(() => {
    if (config) {
      // Reset form with config values, preserving validation state
      reset(
        {
          code: config.code || '',
          label: config.label || '',
          description: config.description || '',
          framework: config.framework || '',
          visible: config.visible ?? true,
        },
        {
          keepDirty: false,
          keepErrors: false,
        }
      );
    }
  }, [config, reset]);

  // Watch form values and update parent
  const formValues = watch();
  useEffect(() => {
    // Only update if we have valid required fields
    if (formValues.code && formValues.label && formValues.framework) {
      updateConfig(formValues);
    }
  }, [formValues, updateConfig]);

  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="code">
          Code
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="code"
          placeholder="Enter unique code"
          {...register('code')}
          disabled={isEdit}
          className={errors.code ? 'border-destructive' : ''}
        />
        {errors.code && <span className="text-sm text-destructive">{errors.code.message}</span>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="label">
          Label
          <span className="text-destructive">*</span>
        </Label>
        <Input
          id="label"
          placeholder="Enter label"
          {...register('label')}
          className={errors.label ? 'border-destructive' : ''}
        />
        {errors.label && <span className="text-sm text-destructive">{errors.label.message}</span>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter description"
          {...register('description')}
          className={errors.description ? 'border-destructive' : ''}
        />
        {errors.description && <span className="text-sm text-destructive">{errors.description.message}</span>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="framework">
          Framework
          <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formValues.framework}
          onValueChange={(value) => setValue('framework', value, {shouldDirty: true})}
        >
          <SelectTrigger
            id="framework"
            className={errors.framework ? 'border-destructive' : ''}
          >
            <SelectValue placeholder="Select framework" />
          </SelectTrigger>
          <SelectContent>
            {availableFrameworks.map((framework) => (
              <SelectItem
                key={framework.value}
                value={framework.value}
              >
                {framework.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.framework && <span className="text-sm text-destructive">{errors.framework.message}</span>}
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="visible">Visible</Label>
          <div className="text-sm text-muted-foreground">Make this data view visible to other users</div>
        </div>
        <Switch
          id="visible"
          checked={formValues.visible}
          onCheckedChange={(checked) => setValue('visible', checked, {shouldDirty: true})}
        />
      </div>

      {isEdit && (
        <Alert>
          <AlertDescription>
            Some fields may be disabled in edit mode to maintain data integrity.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
