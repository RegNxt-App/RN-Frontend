import React from 'react';

import {TooltipWrapperProps} from '@/types/databaseTypes';

import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@rn/ui/components/ui/tooltip';

export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  disabled = false,
  disabledMessage = 'You cannot edit this field as it is system generated',
  enabled = true,
}) => {
  if (!enabled || !disabled) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="cursor-not-allowed opacity-50">{children}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{disabledMessage}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
