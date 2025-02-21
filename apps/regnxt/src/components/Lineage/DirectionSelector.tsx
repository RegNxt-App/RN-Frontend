import React from 'react';

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {LineageDirection} from '@/types/databaseTypes';
import {ArrowRightLeft} from 'lucide-react';

import {Switch} from '@rn/ui/components/ui/switch';

interface DirectionSelectorProps {
  direction: LineageDirection;
  onDirectionChange: (direction: LineageDirection) => void;
}

const DirectionSelector: React.FC<DirectionSelectorProps> = ({direction, onDirectionChange}) => {
  const handleChange = (checked: boolean) => {
    onDirectionChange(checked ? 'source-to-destination' : 'destination-to-source');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-base font-medium">
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          Direction
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="grid gap-1.5">
            <Label
              htmlFor="direction-toggle"
              className="font-medium text-sm"
            >
              {direction === 'source-to-destination' ? 'Source → Destination' : 'Destination → Source'}
            </Label>
            <p className="text-muted-foreground text-xs">
              {direction === 'source-to-destination'
                ? 'Showing data flow from sources to destinations'
                : 'Showing data flow from destinations back to sources'}
            </p>
          </div>
          <Switch
            id="direction-toggle"
            checked={direction === 'source-to-destination'}
            onCheckedChange={handleChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default DirectionSelector;
