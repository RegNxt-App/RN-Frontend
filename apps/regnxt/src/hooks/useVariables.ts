import {useState} from 'react';

import {useBackend} from '@/contexts/BackendContext';
import {useToast} from '@/hooks/use-toast';
import {Variable} from '@/types/databaseTypes';
import useSWR, {mutate} from 'swr';

const VARIABLES_ENDPOINT = '/api/v1/variables/';

interface VariablesResponse {
  count: number;
  num_pages: number;
  results: Variable[];
}

interface UseVariablesReturn {
  variables: Variable[] | undefined;
  isLoading: boolean;
  error: any;
  getVariable: (id: number) => Promise<Variable | null>;
  saveVariable: (data: Partial<Variable>, id?: number) => Promise<Variable>;
  deleteVariable: (id: number) => Promise<boolean>;
  refreshVariables: () => Promise<void>;
  updateDependencies: (variableId: number, dependentVariableIds: number[]) => Promise<boolean>;
}

export const useVariables = (): UseVariablesReturn => {
  const {backendInstance} = useBackend();
  const {toast} = useToast();
  const [loadingState, setLoadingState] = useState<Record<string, boolean>>({});

  const {
    data: variablesData,
    error,
    isLoading,
  } = useSWR<VariablesResponse>(VARIABLES_ENDPOINT, backendInstance);

  const refreshVariables = async (): Promise<void> => {
    await mutate(VARIABLES_ENDPOINT);
  };

  const getVariable = async (id: number): Promise<Variable | null> => {
    try {
      const response = await backendInstance.get(`${VARIABLES_ENDPOINT}${id}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching variable:', error);
      return null;
    }
  };

  const saveVariable = async (data: Partial<Variable>, id?: number): Promise<Variable> => {
    try {
      let response;

      if (id) {
        response = await backendInstance.put(`${VARIABLES_ENDPOINT}${id}/`, data);
      } else {
        response = await backendInstance.post(`${VARIABLES_ENDPOINT}create-variable/`, data);
      }

      await refreshVariables();
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'An error occurred while saving the variable';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteVariable = async (id: number): Promise<boolean> => {
    try {
      setLoadingState((prev) => ({...prev, [`delete_${id}`]: true}));
      await backendInstance.delete(`${VARIABLES_ENDPOINT}${id}/`);
      await refreshVariables();
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete variable';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoadingState((prev) => ({...prev, [`delete_${id}`]: false}));
    }
  };

  const updateDependencies = async (variableId: number, dependentVariableIds: number[]): Promise<boolean> => {
    try {
      await backendInstance.post(`${VARIABLES_ENDPOINT}update-dependencies/`, {
        variable_id: variableId,
        dependent_variable_ids: dependentVariableIds,
      });
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update dependencies';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    variables: variablesData?.results,
    isLoading,
    error,
    getVariable,
    saveVariable,
    deleteVariable,
    refreshVariables,
    updateDependencies,
  };
};

export default useVariables;
