import React from 'react';

import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@rn/ui/components/ui/tooltip';

interface TooltipWrapperProps {
  children: React.ReactNode;
  disabled?: boolean;
  disabledMessage?: string;
}

export const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  disabled = false,
  disabledMessage = 'You cannot edit this field as it is system generated',
}) => {
  if (!disabled) {
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
