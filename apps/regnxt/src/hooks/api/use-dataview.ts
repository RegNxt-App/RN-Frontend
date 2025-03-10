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
          page_size: '50',
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

  const useObjectColumns = (
    selectedObjects: Array<{
      id: string;
      type: string;
      version?: {id: number} | null;
      name?: string;
    }>
  ) => {
    // Log input for debugging
    console.log('useObjectColumns - Input objects:', selectedObjects);
    
    // Create array of keys for column fetching
    const keys = selectedObjects
      .filter((obj) => {
        // Check if object has required properties
        const hasVersion = obj.version && typeof obj.version.id === 'number';
        const hasId = typeof obj.id === 'string' && obj.id.length > 0;
        if (!hasVersion || !hasId) {
          console.warn('Skipping object due to missing properties:', obj);
        }
        return hasVersion && hasId;
      })
      .map((obj) => {
        // Extract object_type and object_id from the composite id if needed
        let type = obj.type;
        let objId;
        
        if (obj.id.includes('_')) {
          const parts = obj.id.split('_');
          // If type wasn't provided, use the first part of the id
          if (!type) type = parts[0];
          objId = parts[1];
        } else {
          objId = obj.id;
        }
        
        console.log('Creating API params for object:', {
          objectType: type, 
          objectId: objId,
          versionId: obj.version?.id
        });
        
        return {
          url: `${apiEndpoint}columns/`,
          params: {
            object_type: type,
            object_id: objId,
            version_id: obj.version?.id,
          },
          origObj: obj, // Keep reference to original object
        };
      });

    return useSWR(
      keys.length ? keys : null,
      async (keys) => {
        console.log('Fetching columns for keys:', keys);
        try {
          const responses = await Promise.all(
            keys.map((key) => orchestraBackendInstance.get(key.url, {params: key.params}))
          );

          console.log('API responses:', responses.map(r => r.data));

          // Transform the responses into a consistent format
          return responses.map((response, index) => {
            const origObj = keys[index].origObj;
            return {
              id: origObj.id,
              name: origObj.name || origObj.id,
              columns: response.data.results || [],
            };
          });
        } catch (error) {
          console.error('Error fetching columns:', error);
          throw new Error('Failed to fetch columns data');
        }
      },
      {
        revalidateOnFocus: false,
        shouldRetryOnError: false,
      }
    );
  };

  // Hook for validating aggregation columns
  const validateAggregationColumns = async (columns: string[], objectType: string, versionId: number) => {
    try {
      const response = await orchestraBackendInstance.post(`${apiEndpoint}validate-aggregation/`, {
        columns,
        object_type: objectType,
        version_id: versionId,
      });
      return response.data.results;
    } catch (error) {
      console.error('Error validating aggregation columns:', error);
      throw error;
    }
  };

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
    validateAggregationColumns,
    useObjectColumns,
  };
}
