import React from 'react';

import {CheckCircle, Loader, Plus, Save, Search} from 'lucide-react';

import {Button} from '@rn/ui/components/ui/button';
import {Input} from '@rn/ui/components/ui/input';

interface MetadataTableHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleAddRow: () => void;
  handleSave: () => void;
  onValidate: () => void;
  isDataModified: boolean;
  isSaving: boolean;
  isValidating: boolean;
}

export const MetadataTableHeader: React.FC<MetadataTableHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  handleAddRow,
  handleSave,
  isSaving,
  isValidating,
  onValidate,
  isDataModified,
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center">
      <Search className="mr-2 h-5 w-5 text-gray-500" />
      <Input
        placeholder="Search columns..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />
    </div>
    <div className="space-x-2">
      <Button
        onClick={handleAddRow}
        variant="outline"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Row
      </Button>
      <Button
        onClick={handleSave}
        disabled={!isDataModified || isSaving}
      >
        {isSaving ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>
      <Button
        onClick={onValidate}
        variant="secondary"
        disabled={isValidating}
      >
        {isValidating ? (
          <Loader className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle className="mr-2 h-4 w-4" />
        )}
        {isValidating ? 'Validating...' : 'Validate'}
      </Button>
    </div>
  </div>
);
