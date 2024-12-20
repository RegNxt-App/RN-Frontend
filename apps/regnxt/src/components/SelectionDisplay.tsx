import React from 'react';

import {format} from 'date-fns';

import {Badge} from '@rn/ui/components/ui/badge';

interface SelectionDisplayProps {
  filteredDataLength: number;
  selectedFramework: string;
  selectedLayer: string;
  selectedDate: Date;
}

const NO_FILTER = 'NO_FILTER';

export const SelectionDisplay: React.FC<SelectionDisplayProps> = ({
  filteredDataLength,
  selectedFramework,
  selectedLayer,
  selectedDate,
}) => {
  const isFrameworkSelected = selectedFramework !== NO_FILTER;
  const isLayerSelected = selectedLayer !== NO_FILTER;
  const isDateSelected = selectedDate && selectedDate.getTime() !== new Date().setHours(0, 0, 0, 0);

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 text-lg">
      <span>{filteredDataLength} tables</span>
      {isFrameworkSelected || isLayerSelected || isDateSelected ? (
        <>
          <span>for</span>
          {isFrameworkSelected ? (
            <Badge variant="secondary">Framework: {selectedFramework}</Badge>
          ) : (
            <Badge variant="outline">Framework: Any</Badge>
          )}
          {isLayerSelected ? (
            <Badge variant="secondary">Layer: {selectedLayer}</Badge>
          ) : (
            <Badge variant="outline">Layer: Any</Badge>
          )}
          {isDateSelected ? (
            <Badge variant="secondary">Date: {format(selectedDate, 'yyyy-MM-dd')}</Badge>
          ) : (
            <Badge variant="outline">Date: Any</Badge>
          )}
        </>
      ) : (
        <span className="italic text-gray-500">(Select a framework, layer, or date to filter)</span>
      )}
    </div>
  );
};
