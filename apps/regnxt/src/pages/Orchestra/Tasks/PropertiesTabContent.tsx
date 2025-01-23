import React from 'react';

import {TaskDetails} from '@/types/databaseTypes';

import {Input} from '@rn/ui/components/ui/input';
import {Label} from '@rn/ui/components/ui/label';
import {TabsContent} from '@rn/ui/components/ui/tabs';
import {Textarea} from '@rn/ui/components/ui/textarea';

import DisabledTooltip from './DisabledTooltip';

interface PropertiesTabContentProps {
  selectedTask: TaskDetails;
  localTask: TaskDetails;
  handleInputChange: (field: keyof TaskDetails, value: string) => void;
}

export const PropertiesTabContent: React.FC<PropertiesTabContentProps> = ({
  selectedTask,
  localTask,
  handleInputChange,
}) => {
  return (
    <TabsContent
      value="properties"
      className="space-y-4"
    >
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Code</Label>
          <DisabledTooltip isDisabled={selectedTask.is_predefined}>
            <Input
              value={localTask.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              disabled={selectedTask.is_predefined}
              placeholder="Enter code"
            />
          </DisabledTooltip>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Label</Label>
          <DisabledTooltip isDisabled={selectedTask.is_predefined}>
            <Input
              value={localTask.label}
              onChange={(e) => handleInputChange('label', e.target.value)}
              disabled={selectedTask.is_predefined}
              placeholder="Enter label"
            />
          </DisabledTooltip>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Description</Label>
          <DisabledTooltip isDisabled={selectedTask.is_predefined}>
            <Textarea
              value={localTask.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={selectedTask.is_predefined}
              className="min-h-[100px]"
              placeholder="Enter description"
            />
          </DisabledTooltip>
        </div>
      </div>
    </TabsContent>
  );
};
