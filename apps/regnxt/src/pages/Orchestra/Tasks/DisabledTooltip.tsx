import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@rn/ui/components/ui/tooltip';

interface DisabledTooltipProps {
  isDisabled: boolean;
  message?: string;
  children: React.ReactNode;
}

const DisabledTooltip = ({
  isDisabled,
  message = 'You cannot edit this field as it is system generated',
  children,
}: DisabledTooltipProps) => {
  if (!isDisabled) return <>{children}</>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>{children}</span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{message}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DisabledTooltip;
