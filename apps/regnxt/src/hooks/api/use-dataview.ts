import {useCallback} from 'react';

import {useToast} from '@/hooks/use-toast';
import {orchestraBackendInstance} from '@/lib/axios';
import useSWR, {mutate} from 'swr';

interface DataView {
  dataview_id: number;
  code: string;
  label: string;
  description: string;
  framework: string;
  type: string;
  is_system_generated: boolean;
  is_visible: boolean;
  data_objects: any[];
  data_joins: any[];
  data_fields: any[];
  data_filters: any[];
  data_aggregations: any[];
  version_nr: number;
  version_code: string;
}

interface AvailableObject {
  id: string;
  name: string;
  type: string;
  description: string;
  framework: string;
  object_type: string;
  version: {
    id: number;
    number: number;
  };
}

interface AvailableObjectsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AvailableObject[];
  page: number;
  page_size: number;
  total_pages: number;
}

export function useDataView(dataviewId?: string | number) {
  const {toast} = useToast();
  const apiEndpoint = '/api/v1/dataviews/';

  const {
    data: response,
    error,
    isLoading,
    mutate: mutateDataView,
  } = useSWR<DataView>(dataviewId ? `${apiEndpoint}${dataviewId}/` : null, orchestraBackendInstance);

  const createDataView = useCallback(
    async (data: Partial<DataView>) => {
      try {
        const response = await orchestraBackendInstance.post(apiEndpoint, data);
        await mutate(apiEndpoint);
        toast({
          title: 'Success',
          description: 'Data view created successfully',
        });
        return response.data;
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Failed to create data view',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [toast]
  );

  const updateDataView = useCallback(
    async (data: Partial<DataView>) => {
      if (!dataviewId) return;

      try {
        const response = await orchestraBackendInstance.put(`${apiEndpoint}${dataviewId}/`, data);
        await mutateDataView(); // Update local cache
        await mutate(apiEndpoint);
        toast({
          title: 'Success',
          description: 'Data view updated successfully',
        });
        return response.data;
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Failed to update data view',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [dataviewId, mutateDataView, toast]
  );

  const previewDataView = useCallback(
    async (limit: number = 100) => {
      if (!dataviewId) return;

      try {
        const response = await orchestraBackendInstance.get(
          `${apiEndpoint}${dataviewId}/preview/?limit=${limit}`
        );
        return response.data;
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Failed to preview data view',
          variant: 'destructive',
        });
        throw error;
      }
    },
    [dataviewId, toast]
  );

  const useAvailableObjects = (page: number = 1, searchTerm: string = '', framework?: string) => {
    return useSWR<AvailableObjectsResponse>(
      [`${apiEndpoint}available-objects/`, page, searchTerm, framework],
      async ([url]) => {
        const params = new URLSearchParams({
          page: String(page),
          page_size: '10',
          ...(searchTerm && {search: searchTerm}),
          ...(framework && {framework}),
        });

        const response = await orchestraBackendInstance.get(`${url}?${params}`);
        return response.data;
      }
    );
  };

  const useObjectFields = (selectedObjects: Record<string, DataViewObject>) => {
    const objectsArray = Object.values(selectedObjects);

    return useSWR(
      objectsArray.length > 0 ? [`${apiEndpoint}object-fields/`, objectsArray] : null,
      async ([url, objects]) => {
        const response = await orchestraBackendInstance.post(url, {
          objects: objects.map((obj) => ({
            id: obj.id,
            type: obj.type,
          })),
        });
        return response.data;
      }
    );
  };

  const deleteDataView = useCallback(async () => {
    if (!dataviewId) return;

    try {
      await orchestraBackendInstance.delete(`${apiEndpoint}${dataviewId}/`);
      await mutate(apiEndpoint);
      toast({
        title: 'Success',
        description: 'Data view deleted successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error || 'Failed to delete data view',
        variant: 'destructive',
      });
      throw error;
    }
  }, [dataviewId, toast]);
  return {
    dataview: response?.data,
    error,
    isLoading,
    fields: [],
    createDataView,
    updateDataView,
    deleteDataView,
    previewDataView,
    useAvailableObjects,
    useObjectFields,
  };
}
