import {SystemVariable} from '@/types/databaseTypes';
import {FileText, Tag} from 'lucide-react';

import {Button} from '@rn/ui/components/ui/button';
import {Input} from '@rn/ui/components/ui/input';

interface VariableCardProps {
  selectedVariable: SystemVariable;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (variable: SystemVariable) => void;
  onChange: (variable: SystemVariable) => void;
}

export function VariableCard({selectedVariable, isEditing, onEdit, onSave, onChange}: VariableCardProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{selectedVariable.variable_name}</h2>
        <Button
          onClick={() => {
            if (isEditing) {
              onSave(selectedVariable);
            } else {
              onEdit();
            }
          }}
        >
          {isEditing ? 'Save Changes' : 'Edit'}
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-500">
        <span className="flex items-center">
          <Tag className="w-4 h-4 mr-1" /> {selectedVariable.category}
        </span>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Value</label>
          <Input
            value={selectedVariable.value || ''}
            onChange={(e) => {
              onChange({
                ...selectedVariable,
                value: e.target.value,
              });
            }}
            disabled={!isEditing}
            className="font-mono"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <p className="text-sm text-gray-600">{selectedVariable.description}</p>
        </div>
      </div>
    </div>
  );
}

export function EmptyVariableCard() {
  return (
    <div className="h-[calc(100vh-16rem)] flex items-center justify-center">
      <div className="text-center">
        <FileText className="w-12 h-12 mx-auto mb-4" />
        <h3 className="text-3xl font-bold mb-2">No Setting Selected</h3>
        <p>Select a setting from the browser to view and edit its details</p>
      </div>
    </div>
  );
}
