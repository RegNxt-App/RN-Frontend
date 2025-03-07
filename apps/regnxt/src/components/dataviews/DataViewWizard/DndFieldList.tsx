'use client';

import {useState} from 'react';

import {DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {Card} from '@rn/ui/components/ui/card';
import {Label} from '@rn/ui/components/ui/label';

import {SortableItem} from './sortable-item';

interface Field {
  id: string;
  name: string;
  type: string;
  table: string;
}

interface DndFieldListProps {
  fields: Field[];
  onChange: (fields: Field[]) => void;
}

export function DndFieldList({fields, onChange}: DndFieldListProps) {
  const [items, setItems] = useState(fields);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event) {
    const {active, over} = event;

    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        onChange(newItems);
        return newItems;
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        <Label>Selected Fields</Label>
        <Card className="p-4">
          <SortableContext
            items={items}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {items.map((field) => (
                <SortableItem
                  key={field.id}
                  id={field.id}
                >
                  <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{field.name}</span>
                      <span className="text-sm text-muted-foreground">({field.table})</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{field.type}</span>
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </Card>
      </div>
    </DndContext>
  );
}
