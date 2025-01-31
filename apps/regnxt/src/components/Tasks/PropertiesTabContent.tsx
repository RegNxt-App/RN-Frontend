import React from 'react';

import {PropertiesTabContentProps, TaskDetails} from '@/types/databaseTypes';

import {Input} from '@rn/ui/components/ui/input';
import {Label} from '@rn/ui/components/ui/label';
import {TabsContent} from '@rn/ui/components/ui/tabs';
import {Textarea} from '@rn/ui/components/ui/textarea';

import {TooltipWrapper} from './TooltipWrapper';

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
          <TooltipWrapper
            disabled={selectedTask.is_predefined}
            disabledMessage="You cannot modify a system-generated task"
          >
            <Input
              value={localTask.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              disabled={selectedTask.is_predefined}
              placeholder="Enter code"
            />
          </TooltipWrapper>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Label</Label>
          <TooltipWrapper
            disabled={selectedTask.is_predefined}
            disabledMessage="You cannot modify a system-generated task"
          >
            <Input
              value={localTask.label}
              onChange={(e) => handleInputChange('label', e.target.value)}
              disabled={selectedTask.is_predefined}
              placeholder="Enter label"
            />
          </TooltipWrapper>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Description</Label>
          <TooltipWrapper
            disabled={selectedTask.is_predefined}
            disabledMessage="You cannot modify a system-generated task"
          >
            <Textarea
              value={localTask.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              disabled={selectedTask.is_predefined}
              className="min-h-[100px]"
              placeholder="Enter description"
            />
          </TooltipWrapper>
        </div>
      </div>
    </TabsContent>
  );
};
