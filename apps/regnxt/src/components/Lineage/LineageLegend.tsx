import React from 'react';

import {TRANSFORMATION_COLORS} from '@/utils/lineageUtils';

interface LineageLegendProps {
  className?: string;
}

const LineageLegend: React.FC<LineageLegendProps> = ({className}) => {
  return (
    <div className="absolute bottom-4 right-4 bg-white p-3 rounded-md shadow-md z-10 text-xs">
      <h3 className="font-medium mb-2">Transformation Types</h3>
      <div className="space-y-2">
        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded mr-2"
            style={{backgroundColor: TRANSFORMATION_COLORS.COPY}}
          ></div>
          <span>Copy</span>
        </div>
        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded mr-2"
            style={{backgroundColor: TRANSFORMATION_COLORS.DER}}
          ></div>
          <span>Derivation</span>
        </div>
        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded mr-2"
            style={{backgroundColor: TRANSFORMATION_COLORS.GEN}}
          ></div>
          <span>Generation</span>
        </div>
        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded mr-2"
            style={{backgroundColor: TRANSFORMATION_COLORS.ALLOC}}
          ></div>
          <span>Allocation</span>
        </div>
      </div>
    </div>
  );
};

export default LineageLegend;
