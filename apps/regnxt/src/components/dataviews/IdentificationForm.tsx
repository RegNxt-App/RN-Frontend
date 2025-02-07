import {useEffect, useState} from 'react';

import {Input} from '@rn/ui/components/ui/input';
import {Label} from '@rn/ui/components/ui/label';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';
import {Switch} from '@rn/ui/components/ui/switch';
import {Textarea} from '@rn/ui/components/ui/textarea';

interface IdentificationFormProps {
  config: any;
  updateConfig: (data: any) => void;
}

export function IdentificationForm({config, updateConfig}: IdentificationFormProps) {
  const [formData, setFormData] = useState({
    code: config.code || '',
    label: config.label || '',
    description: config.description || '',
    framework: config.framework || '',
    visible: config.visible || false,
  });

  useEffect(() => {
    if (JSON.stringify(formData) !== JSON.stringify(config)) {
      updateConfig(formData);
    }
  }, [formData, updateConfig, config]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-2">
        <Label htmlFor="code">Code</Label>
        <Input
          id="code"
          placeholder="Enter unique code"
          value={formData.code}
          onChange={(e) => handleChange('code', e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          placeholder="Enter label"
          value={formData.label}
          onChange={(e) => handleChange('label', e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="framework">Framework</Label>
        <Select
          value={formData.framework}
          onValueChange={(value) => handleChange('framework', value)}
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
          <div className="text-sm text-muted-foreground">Make this data view visible to other users</div>
        </div>
        <Switch
          id="visible"
          checked={formData.visible}
          onCheckedChange={(checked) => handleChange('visible', checked)}
        />
      </div>
    </div>
  );
}
