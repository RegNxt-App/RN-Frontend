import React from 'react';

import {Task} from '@/types/databaseTypes';

import {Input} from '@rn/ui/components/ui/input';
import {Label} from '@rn/ui/components/ui/label';
import {TabsContent} from '@rn/ui/components/ui/tabs';
import {Textarea} from '@rn/ui/components/ui/textarea';

import {TooltipWrapper} from '../TooltipWrapper';

interface PropertiesTabContentProps {
  task: Task;
  onTaskChange: (field: keyof Task, value: string) => void;
}

export const PropertiesTabContent: React.FC<PropertiesTabContentProps> = ({task, onTaskChange}) => {
  if (!task) return null;
  return (
    <TabsContent
      value="properties"
      className="space-y-4"
    >
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Code</Label>
          <TooltipWrapper
            disabled={true}
            disabledMessage="You cannot modify code for any task"
          >
            <Input
              value={task.code || ''}
              onChange={(e) => onTaskChange('code', e.target.value)}
              disabled={true}
              placeholder="Enter code"
            />
          </TooltipWrapper>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Label</Label>
          <TooltipWrapper
            disabled={task.is_predefined}
            disabledMessage="You cannot modify a system-generated task"
          >
            <Input
              value={task.label || ''}
              onChange={(e) => onTaskChange('label', e.target.value)}
              disabled={task.is_predefined}
              placeholder="Enter label"
            />
          </TooltipWrapper>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Description</Label>
          <TooltipWrapper
            disabled={task.is_predefined}
            disabledMessage="You cannot modify a system-generated task"
          >
            <Textarea
              value={task.description || ''}
              onChange={(e) => onTaskChange('description', e.target.value)}
              disabled={task.is_predefined}
              className="min-h-[100px]"
              placeholder="Enter description"
            />
          </TooltipWrapper>
        </div>
      </div>
    </TabsContent>
  );
};
