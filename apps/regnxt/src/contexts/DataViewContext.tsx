import React, {Dispatch, SetStateAction, createContext, useContext, useState} from 'react';

import {DataViewObject, Field} from '@/types/databaseTypes';

interface DataViewContextType {
  selectedObjects: Record<string, DataViewObject>;
  fields: Field[];
  setSelectedObjects: Dispatch<SetStateAction<Record<string, DataViewObject>>>;
  setFields: Dispatch<SetStateAction<Field[]>>;
  toggleFieldSelection: (fieldId: string) => void;
}

const DataViewContext = createContext<DataViewContextType | undefined>(undefined);

export function DataViewProvider({children}: {children: React.ReactNode}) {
  const [selectedObjects, setSelectedObjects] = useState<Record<string, DataViewObject>>({});
  const [fields, setFields] = useState<Field[]>([]);

  const toggleFieldSelection = (fieldId: string) => {
    setFields((prevFields) =>
      prevFields.map((field) => (field.id === fieldId ? {...field, selected: !field.selected} : field))
    );
  };
  const value = {
    selectedObjects,
    setSelectedObjects,
    fields,
    setFields,
    toggleFieldSelection,
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
