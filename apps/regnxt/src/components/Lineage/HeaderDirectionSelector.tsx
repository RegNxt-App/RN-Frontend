import React from 'react';

import {LineageDirection} from '@/types/databaseTypes';

import {Switch} from '@rn/ui/components/ui/switch';

interface HeaderDirectionSelectorProps {
  direction: LineageDirection;
  onDirectionChange: (direction: LineageDirection) => void;
}

const HeaderDirectionSelector: React.FC<HeaderDirectionSelectorProps> = ({direction, onDirectionChange}) => {
  const handleChange = (checked: boolean) => {
    onDirectionChange(checked ? 'source-to-destination' : 'destination-to-source');
  };

  return (
    <div className="flex space-x-6 border p-4 rounded-lg">
      <span
        className={`text-sm font-medium ${
          direction === 'destination-to-source' ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        Destination → Source
      </span>

      <Switch
        id="header-direction-toggle"
        checked={direction === 'source-to-destination'}
        onCheckedChange={handleChange}
        className="data-[state=checked]:bg-primary"
      />

      <span
        className={`text-sm font-medium ${
          direction === 'source-to-destination' ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        Source → Destination
      </span>
    </div>
  );
};

export default HeaderDirectionSelector;
