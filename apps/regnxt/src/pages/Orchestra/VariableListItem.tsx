import {SystemVariable} from '@/types/databaseTypes';
import {FileText} from 'lucide-react';

interface VariableListItemProps {
  variable: SystemVariable;
  isSelected: boolean;
  onSelect: (variable: SystemVariable) => void;
}
export function VariableListItem({variable, isSelected, onSelect}: VariableListItemProps) {
  return (
    <div
      className={`flex items-center justify-between ml-8 p-2 hover:bg-gray-100 rounded-lg cursor-pointer ${
        isSelected ? 'bg-gray-100' : ''
      }`}
      onClick={() => onSelect(variable)}
    >
      <div className="flex items-start min-w-0">
        <FileText className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <div className="text-sm">{variable.variable_name}</div>
          <div className="text-xs text-gray-500">{variable.value || 'No value set'}</div>
        </div>
      </div>
    </div>
  );
}
