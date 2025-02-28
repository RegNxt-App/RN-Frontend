import React, {createContext, useContext, useEffect, useState} from 'react';

import {DataViewObject, Field} from '@/types/databaseTypes';

interface DataViewContextType {
  selectedObjects: Record<string, DataViewObject>;
  fields: Field[];
  setSelectedObjects: React.Dispatch<React.SetStateAction<Record<string, DataViewObject>>>;
  setFields: React.Dispatch<React.SetStateAction<Field[]>>;
  toggleFieldSelection: (fieldId: string) => void;
  initializeContext: (data: any) => void;
}

const DataViewContext = createContext<DataViewContextType | undefined>(undefined);

export function DataViewProvider({
  children,
  initialData = null,
}: {
  children: React.ReactNode;
  initialData?: any;
}) {
  const [selectedObjects, setSelectedObjects] = useState<Record<string, DataViewObject>>({});
  const [fields, setFields] = useState<Field[]>([]);

  const toggleFieldSelection = (fieldId: string) => {
    setFields((prevFields) =>
      prevFields.map((field) => (field.id === fieldId ? {...field, selected: !field.selected} : field))
    );
  };

  const initializeContext = (data: any) => {
    if (!data) return;

    if (data.data_objects) {
      const objectsMap = data.data_objects.reduce(
        (acc: Record<string, DataViewObject>, obj: DataViewObject) => {
          acc[obj.id] = obj;
          return acc;
        },
        {}
      );
      setSelectedObjects(objectsMap);
    }

    if (data.data_fields) {
      // Store the original fields data to maintain references while adding selections
      const originalFields = [...data.data_fields];
      
      // Create a map of fields by ID for easy reference
      const fieldsById = originalFields.reduce((acc: Record<string, any>, field: any) => {
        acc[field.id] = field;
        return acc;
      }, {});
      
      // Update the fields with selection state
      setFields((prevFields) => {
        // If we already have fields, update their selection state
        if (prevFields.length > 0) {
          return prevFields.map((field) => ({
            ...field,
            selected: field.id in fieldsById,
            // If this field exists in the original data, use its alias
            alias: fieldsById[field.id]?.alias || field.alias || field.column,
          }));
        }
        
        // If we don't have fields yet, initialize with the original data
        // (will be replaced when object fields are loaded)
        return originalFields.map((field: any) => ({
          ...field,
          selected: true,
        }));
      });
    }
  };

  useEffect(() => {
    if (initialData) {
      initializeContext(initialData);
    }
  }, [initialData]);

  const value = {
    selectedObjects,
    setSelectedObjects,
    fields,
    setFields,
    toggleFieldSelection,
    initializeContext,
  };

  return <DataViewContext.Provider value={value}>{children}</DataViewContext.Provider>;
}

export function useDataViewContext() {
  const context = useContext(DataViewContext);
  if (!context) {
    throw new Error('useDataViewContext must be used within a DataViewProvider');
  }
  return context;
}
