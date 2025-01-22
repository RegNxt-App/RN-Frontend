import React from 'react';

import {useSortable} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {GripVertical} from 'lucide-react';

interface SortableItemProps {
  id: string;
  label: string;
  description: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function SortableItem({id, label, selected, disabled, onClick}: SortableItemProps) {
  const {attributes, listeners, setNodeRef, transform, transition, isDragging} = useSortable({id, disabled});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 rounded-lg hover:bg-gray-100 transition-colors 
        ${selected ? 'bg-gray-100' : ''} 
        ${isDragging ? 'shadow-lg opacity-50' : ''}`}
    >
      <div className="flex items-center gap-2">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:cursor-grabbing p-1 rounded hover:bg-gray-200 transition-colors"
        >
          <GripVertical className="w-4 h-4 text-gray-500" />
        </div>
        <div
          className="flex-1 cursor-pointer"
          onClick={onClick}
        >
          <h4 className="font-small">{label}</h4>
        </div>
      </div>
    </div>
  );
}
