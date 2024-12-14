// components/NoResults.tsx
import { LucideIcon } from "lucide-react";

interface NoResultsProps {
  title: string;
  message: string;
  icon?: LucideIcon;
}

export const NoResults: React.FC<NoResultsProps> = ({
  title,
  message,
  icon: Icon,
}) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    {Icon && <Icon className="h-12 w-12 text-muted-foreground mb-4" />}
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground max-w-md">{message}</p>
  </div>
);
