import {LucideIcon} from 'lucide-react';

interface NoResultsProps {
  title: string;
  message: string;
  icon?: LucideIcon;
}

export const NoResults: React.FC<NoResultsProps> = ({title, message, icon: Icon}) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    {Icon && <Icon className="mb-4 h-12 w-12 text-muted-foreground" />}
    <h3 className="mb-2 text-lg font-semibold">{title}</h3>
    <p className="max-w-md text-sm text-muted-foreground">{message}</p>
  </div>
);
