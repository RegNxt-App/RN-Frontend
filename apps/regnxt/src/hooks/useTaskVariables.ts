import {useCallback} from 'react';

import {useBackend} from '@/contexts/BackendContext';
import {
  ApiResponse,
  DatasetOption,
  DataviewOption,
  DesignTimeParams,
  SubtypeParamsResponse,
  Task,
  VariableResponse,
} from '@/types/databaseTypes';
import useSWR from 'swr';

export const useTaskVariables = (
  selectedTask: Task | null,
  subtypeParamsResponse?: SubtypeParamsResponse[]
) => {
  const {backendInstance} = useBackend();

  const variablesUrl = subtypeParamsResponse?.[0]?.parameters
    ? `/api/v1/tasks/variables/?ids=${subtypeParamsResponse[0].parameters.map((p) => p.id).join(',')}`
    : null;

  const {data: variablesResponse} = useSWR<VariableResponse[]>(
    selectedTask && variablesUrl ? variablesUrl : null,
    (url: string) => backendInstance.get(url).then((r) => r.data)
  );

  const inputStatement = variablesResponse?.find(
    (v) => v.name.toLowerCase().includes('input') && v.name.toLowerCase().includes('dataset')
  )?.statement;

  const outputStatement = variablesResponse?.find(
    (v) => v.name.toLowerCase().includes('output') && v.name.toLowerCase().includes('dataset')
  )?.statement;

  const {data: inputOptionsResponse} = useSWR<ApiResponse<(DatasetOption | DataviewOption)[]>>(
    inputStatement ? `/api/v1/tasks/execute-sql/?statement=${encodeURIComponent(inputStatement)}` : null,
    (url: string) => backendInstance.get(url).then((r) => ({data: r.data}))
  );

  const {data: outputOptionsResponse} = useSWR<ApiResponse<DatasetOption[]>>(
    outputStatement ? `/api/v1/tasks/execute-sql/?statement=${encodeURIComponent(outputStatement)}` : null,
    (url: string) => backendInstance.get(url).then((r) => ({data: r.data}))
  );

  const getParametersPayload = useCallback(
    (designTimeParams: DesignTimeParams) => {
      const parameters = [];
      let parameterCount = 1;

      const inputVariableId = variablesResponse?.find(
        (v) => v.name.toLowerCase().includes('input') && v.name.toLowerCase().includes('dataset')
      )?.variable_id;

      const outputVariableId = variablesResponse?.find(
        (v) => v.name.toLowerCase().includes('output') && v.name.toLowerCase().includes('dataset')
      )?.variable_id;

      if (inputVariableId) {
        parameters.push({
          id: parameterCount++,
          parameter_id: inputVariableId,
          source: designTimeParams.sourceType || 'dataset',
          default_value: designTimeParams.sourceId,
        });
      }

      if (outputVariableId) {
        parameters.push({
          id: parameterCount++,
          parameter_id: outputVariableId,
          source: 'dataset',
          default_value: designTimeParams.destinationId,
        });
      }

      return parameters;
    },
    [variablesResponse]
  );

  return {
    variablesResponse,
    inputOptionsResponse,
    outputOptionsResponse,
    getParametersPayload,
  };
};
