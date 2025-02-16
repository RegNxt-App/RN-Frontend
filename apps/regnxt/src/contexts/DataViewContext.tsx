import React, {Dispatch, SetStateAction, createContext, useContext, useState} from 'react';

import {useBackend} from '@/contexts/BackendContext';
import {toast} from '@/hooks/use-toast';
import {ApiResponse, DataViewObject, Field} from '@/types/databaseTypes';
import useSWR from 'swr';

interface DataViewContextType {
  selectedObjects: Record<string, DataViewObject>;
  fields: Field[];
  setSelectedObjects: Dispatch<SetStateAction<Record<string, DataViewObject>>>;
  setFields: (fields: Field[]) => void;
  fetchFieldsForObjects: (objects: DataViewObject[]) => Promise<void>;
  useAvailableObjects: (
    page: number,
    searchTerm: string,
    framework?: string
  ) => {
    data: ApiResponse<DataViewObject> | undefined;
    error: any;
    isLoading: boolean;
    mutate: () => Promise<any>;
  };
}

const DataViewContext = createContext<DataViewContextType | undefined>(undefined);

export function DataViewProvider({children}: {children: React.ReactNode}) {
  const [selectedObjects, setSelectedObjects] = useState<Record<string, DataViewObject>>();
  const [fields, setFields] = useState<Field[]>([]);
  const {backendInstance} = useBackend();

  const fetchFieldsForObjects = async (objects: DataViewObject[]) => {
    if (!objects.length) return;

    try {
      const response = await backendInstance.post('/api/v1/dataviews/object-fields/', {
        objects: objects.map((obj) => ({
          id: obj.id,
          type: obj.type,
        })),
      });

      const transformedFields = response.data.results.flatMap((table: any) =>
        table.fields.map((field: any) => ({
          id: `${table.table_name}_${field.name}`,
          name: field.name,
          table: table.table_name,
          label: field.label,
          type: field.type,
          description: field.description,
          selected: false,
        }))
      );

      setFields(transformedFields);
    } catch (error) {
      console.error('Error fetching fields:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch fields for selected objects',
        variant: 'destructive',
      });
    }
  };

  const useAvailableObjects = (page: number, searchTerm: string, framework?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: '10',
      search: searchTerm,
      ...(framework ? {framework} : {}),
    });

    const {data, error, isLoading, mutate} = useSWR<ApiResponse<DataViewObject>>(
      `/api/v1/dataviews/available-objects/?${params.toString()}`,
      async (url) => {
        const response = await backendInstance.get(url);
        return response.data;
      },
      {
        revalidateOnFocus: false,
        dedupingInterval: 5000, // Dedupe requests within 5 seconds
        shouldRetryOnError: false,
      }
    );

    return {
      data,
      error,
      isLoading,
      mutate,
    };
  };

  return (
    <DataViewContext.Provider
      value={{
        selectedObjects,
        setSelectedObjects,
        fields,
        setFields,
        fetchFieldsForObjects,
        useAvailableObjects,
      }}
    >
      {children}
    </DataViewContext.Provider>
  );
}

export function useDataView() {
  const context = useContext(DataViewContext);
  if (!context) {
    throw new Error('useDataView must be used within a DataViewProvider');
  }
  return context;
}
