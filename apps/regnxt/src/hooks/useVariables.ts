import {useState} from 'react';

import {useBackend} from '@/contexts/BackendContext';
import {useToast} from '@/hooks/use-toast';
import {Variable} from '@/types/databaseTypes';
import useSWR, {mutate} from 'swr';

const VARIABLES_ENDPOINT = '/api/v1/variables/';
const DEPENDENCIES_ENDPOINT = '/api/v1/variables/{id}/dependencies/';

interface VariablesResponse {
  count: number;
  num_pages: number;
  results: Variable[];
}

interface VariableDependency {
  variable_id: number;
  name: string;
  label: string;
  data_type: string;
  default_value: string | null;
  is_active: boolean;
}

interface UseVariablesReturn {
  variables: Variable[] | undefined;
  isLoading: boolean;
  error: any;
  getVariable: (id: number) => Promise<Variable | null>;
  saveVariable: (data: Partial<Variable>, id?: number) => Promise<Variable>;
  deleteVariable: (id: number) => Promise<boolean>;
  refreshVariables: () => Promise<void>;
  getDependencies: (id: number) => Promise<VariableDependency[]>;
  addDependency: (variableId: number, dependentVariableId: number) => Promise<boolean>;
  removeDependency: (variableId: number, dependentVariableId: number) => Promise<boolean>;
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
  } = useSWR<VariablesResponse>(VARIABLES_ENDPOINT, async (url: string) => {
    const response = await backendInstance.get(url);
    return response.data;
  });

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

  const getDependencies = async (id: number): Promise<VariableDependency[]> => {
    try {
      const url = DEPENDENCIES_ENDPOINT.replace('{id}', id.toString());
      const response = await backendInstance.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching dependencies:', error);
      return [];
    }
  };

  const addDependency = async (variableId: number, dependentVariableId: number): Promise<boolean> => {
    try {
      await backendInstance.post(`${VARIABLES_ENDPOINT}${variableId}/add-dependency/`, {
        dependent_variable_id: dependentVariableId,
      });
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to add dependency';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  const removeDependency = async (variableId: number, dependentVariableId: number): Promise<boolean> => {
    try {
      await backendInstance.post(`${VARIABLES_ENDPOINT}${variableId}/remove-dependency/`, {
        dependent_variable_id: dependentVariableId,
      });
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to remove dependency';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateDependencies = async (variableId: number, dependentVariableIds: number[]): Promise<boolean> => {
    try {
      await backendInstance.post(`${VARIABLES_ENDPOINT}batch-update-dependencies/`, {
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
    getDependencies,
    addDependency,
    removeDependency,
    updateDependencies,
  };
};

export default useVariables;
