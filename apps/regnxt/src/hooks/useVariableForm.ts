import {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {useNavigate, useParams} from 'react-router-dom';

import {useBackend} from '@/contexts/BackendContext';
import {useToast} from '@/hooks/use-toast';
import useVariables from '@/hooks/useVariables';
import {Variable} from '@/types/databaseTypes';
import useSWR from 'swr';

const DATA_TYPES_ENDPOINT = '/api/v1/variables/data-types/';
const VARIABLES_ENDPOINT = '/api/v1/variables/';

export type VariableFormData = Omit<
  Variable,
  'variable_id' | 'created_at' | 'updated_at' | 'created_by' | 'dependency_count'
>;

export interface VariableDetails extends Variable {
  dependencies?: any[];
  dependent_variables?: any[];
}
type VariableCreateRequest = VariableFormData & {
  dependencies?: number[];
};
export const useVariableForm = () => {
  const {variableId} = useParams<{variableId: string}>();
  const isEditMode = !!variableId;
  const navigate = useNavigate();
  const {backendInstance} = useBackend();
  const [selectedType, setSelectedType] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {toast} = useToast();
  const {saveVariable, updateDependencies} = useVariables();
  const [dependencies, setDependencies] = useState<number[]>([]);

  const form = useForm<VariableFormData>({
    defaultValues: {
      name: '',
      label: '',
      description: '',
      data_type: '',
      is_active: true,
    },
  });

  const {
    data: dataTypes,
    error: typesError,
    isLoading: isLoadingTypes,
  } = useSWR<string[]>(DATA_TYPES_ENDPOINT, (url: string) => backendInstance.get(url).then((r) => r.data));

  const {
    data: variableDetails,
    error: variableError,
    isLoading: isLoadingVariable,
    mutate: refreshVariableDetails,
  } = useSWR<VariableDetails>(
    isEditMode ? `${VARIABLES_ENDPOINT}${variableId}/` : null,
    (url: string) => backendInstance.get(url).then((r) => r.data),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      dedupingInterval: 5000,
    }
  );

  useEffect(() => {
    if (isEditMode && variableId) {
      refreshVariableDetails();
    }
  }, [isEditMode, variableId, refreshVariableDetails]);

  useEffect(() => {
    if (!isEditMode) {
      form.reset({
        name: '',
        label: '',
        description: '',
        data_type: '',
        min_value: null,
        max_value: null,
        allowed_values: null,
        regex_pattern: null,
        default_value: null,
        is_active: true,
      });
      setSelectedType('');
    }
  }, [isEditMode, form]);

  useEffect(() => {
    if (variableDetails && isEditMode) {
      form.reset({
        name: variableDetails.name || '',
        label: variableDetails.label || '',
        description: variableDetails.description || '',
        data_type: variableDetails.data_type || '',
        min_value: variableDetails.min_value,
        max_value: variableDetails.max_value,
        allowed_values: variableDetails.allowed_values,
        regex_pattern: variableDetails.regex_pattern,
        default_value: variableDetails.default_value,
        is_active: variableDetails.is_active || false,
      });
      if (variableDetails.dependencies) {
        setDependencies(variableDetails.dependencies.map((d) => d.variable_id));
      }
      setSelectedType(variableDetails.data_type);
    }
  }, [variableDetails, isEditMode, form]);

  const onSubmit = async (data: VariableFormData) => {
    try {
      setIsSubmitting(true);

      const formattedData = {...data};

      if (data.data_type === 'number' || data.data_type === 'integer') {
        formattedData.min_value = data.min_value != null ? Number(data.min_value) : null;
        formattedData.max_value = data.max_value != null ? Number(data.max_value) : null;

        if (data.default_value) {
          formattedData.default_value = Number(data.default_value).toString();
        }
      } else if (data.data_type === 'date') {
        formattedData.min_value = null;
        formattedData.max_value = null;
      }

      if (data.data_type === 'boolean' && data.default_value) {
        formattedData.default_value = data.default_value.toLowerCase();
      }

      if (!isEditMode) {
        await saveVariable({
          ...formattedData,
          dependencies: dependencies,
        } as VariableCreateRequest);

        toast({
          title: 'Success',
          description: 'Variable created successfully.',
        });
      } else if (variableId) {
        await saveVariable(formattedData, Number(variableId));

        await updateDependencies(Number(variableId), dependencies);

        toast({
          title: 'Success',
          description: 'Variable updated successfully.',
        });
      }

      navigate('/orchestra/variables');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} variable`;
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
  };
  const handleDependenciesChange = (deps: number[]) => {
    setDependencies(deps);
  };
  const error = typesError || (isEditMode && variableError);
  const isLoading = isLoadingTypes || (isEditMode && isLoadingVariable);

  return {
    form,
    isEditMode,
    isSubmitting,
    selectedType,
    dataTypes,
    isLoadingTypes,
    variableDetails,
    isLoadingVariable,
    error,
    isLoading,
    onSubmit,
    handleTypeChange,
    navigate,
    dependencies,
    handleDependenciesChange,
  };
};

export default useVariableForm;
