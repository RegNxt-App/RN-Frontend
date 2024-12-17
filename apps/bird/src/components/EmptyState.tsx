import React from 'react';

import {FileText, LucideIcon} from 'lucide-react';

import {Button} from '@rn/ui/components/ui/button';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = FileText,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center space-y-4 rounded-lg border border-dashed bg-card px-4 py-12 ${className}`}
    >
      <Icon className="h-12 w-12 text-muted-foreground" />
      <div className="space-y-2 text-center">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {action && (
        <Button
          onClick={action.onClick}
          variant="secondary"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
