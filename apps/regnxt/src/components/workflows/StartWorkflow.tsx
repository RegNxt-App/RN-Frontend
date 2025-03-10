import {useEffect, useRef, useState} from 'react';

import {useBackend} from '@/contexts/BackendContext';
import {useDebounce} from '@/hooks/use-debounce';
import {toast} from '@/hooks/use-toast';
import {DependencyParameter, Workflow, WorkflowParameter} from '@/types/databaseTypes';
import {Loader2} from 'lucide-react';
import {mutate} from 'swr';

import {Button} from '@rn/ui/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '@rn/ui/components/ui/card';
import {Input} from '@rn/ui/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';

const WORKFLOWS_ENDPOINT = '/api/v1/workflows/';

interface StartWorkflowProps {
  selectedWorkflow: Workflow | null;
  workflowParameters: WorkflowParameter[];
  isLoadingParameters: boolean;
  onClose?: () => void;
}

const StartWorkflow: React.FC<StartWorkflowProps> = ({
  selectedWorkflow,
  workflowParameters,
  isLoadingParameters,
  onClose,
}) => {
  const {backendInstance} = useBackend();
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debouncedParameters = useDebounce(parameters, 300);
  const previousParametersRef = useRef({});

  useEffect(() => {
    if (selectedWorkflow && workflowParameters) {
      const initialParameters = workflowParameters.reduce<Record<string, string>>(
        (acc, param: WorkflowParameter) => {
          acc[param.name] = param.default_value || '';
          return acc;
        },
        {}
      );

      setParameters((prevParams) => {
        if (Object.keys(prevParams).length > 0 && selectedWorkflow) {
          return prevParams;
        }
        return initialParameters;
      });
    }
  }, [selectedWorkflow, workflowParameters]);

  useEffect(() => {
    if (!selectedWorkflow || !Object.keys(debouncedParameters).length) return;

    const hasParametersWithDependencies = workflowParameters.some(
      (param) => param.dependencies && param.dependencies.length > 0
    );

    const hasChanged = JSON.stringify(previousParametersRef.current) !== JSON.stringify(debouncedParameters);

    if (!hasParametersWithDependencies || !hasChanged) return;

    previousParametersRef.current = {...debouncedParameters};

    const fetchDependentOptions = async () => {
      try {
        const response = await backendInstance.post(
          `${WORKFLOWS_ENDPOINT}${selectedWorkflow.workflow_id}/dependent-options/`,
          {parameters: debouncedParameters}
        );

        if (!response.data) return;

        const updatedParameters = [...workflowParameters];
        let hasUpdates = false;
        let parameterUpdates: Record<string, string> = {};

        for (const param of updatedParameters) {
          const newOptions = response.data[param.name];

          if (!newOptions || !Array.isArray(newOptions)) continue;

          const oldOptionsJson = JSON.stringify(param.options || []);
          const newOptionsJson = JSON.stringify(newOptions);

          if (oldOptionsJson === newOptionsJson) continue;

          param.options = newOptions;
          hasUpdates = true;

          const currentValue = parameters[param.name];
          const valueExists =
            currentValue && newOptions.some((opt) => String(opt.value) === String(currentValue));

          if (currentValue && !valueExists) {
            parameterUpdates[param.name] = newOptions.length ? String(newOptions[0].value) : '';
          } else if (!currentValue && newOptions.length) {
            parameterUpdates[param.name] = String(newOptions[0].value);
          }
        }

        if (Object.keys(parameterUpdates).length) {
          setParameters((prev) => ({...prev, ...parameterUpdates}));
        }

        if (hasUpdates) {
          mutate(
            `${WORKFLOWS_ENDPOINT}${selectedWorkflow.workflow_id}/parameters/`,
            updatedParameters,
            false
          );
        }
      } catch (error) {
        console.error('Error fetching dependent options:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch parameter options',
          variant: 'destructive',
        });
      }
    };

    fetchDependentOptions();
  }, [debouncedParameters, selectedWorkflow, workflowParameters]);
  const handleStartWorkflow = async () => {
    if (!selectedWorkflow) return;

    setIsSubmitting(true);
    try {
      await backendInstance.post(`${WORKFLOWS_ENDPOINT}${selectedWorkflow.workflow_id}/start/`, parameters);
      toast({
        title: 'Success',
        description: 'Workflow started successfully',
      });
      setParameters({});
      if (onClose) {
        onClose();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start workflow',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderParameterInput = (param: WorkflowParameter) => {
    if (param.data_type === 'enum') {
      return (
        <Select
          value={parameters[param.name] || param.default_value || ''}
          onValueChange={(value) => setParameters((prev) => ({...prev, [param.name]: value}))}
        >
          <SelectTrigger>
            <SelectValue placeholder={`Select ${param.label}`} />
          </SelectTrigger>
          <SelectContent>
            {param.options?.length > 0 ? (
              param.options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={String(option.value)}
                >
                  {option.label}
                </SelectItem>
              ))
            ) : (
              <SelectItem
                disabled
                value="none"
              >
                No options available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      );
    } else if (param.data_type === 'date') {
      return (
        <Input
          type="date"
          value={parameters[param.name] || param.default_value || ''}
          onChange={(e) => setParameters((prev) => ({...prev, [param.name]: e.target.value}))}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
        />
      );
    } else {
      return (
        <Input
          value={parameters[param.name] || param.default_value || ''}
          onChange={(e) => setParameters((prev) => ({...prev, [param.name]: e.target.value}))}
          placeholder={`Enter ${param.label}`}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
        />
      );
    }
  };

  const renderDependencyInput = (dep: DependencyParameter) => {
    if (dep.data_type === 'enum') {
      return (
        <Select
          value={parameters[dep.name] || ''}
          onValueChange={(value) => setParameters((prev) => ({...prev, [dep.name]: value}))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select value" />
          </SelectTrigger>
          <SelectContent>
            {dep.options && dep.options.length > 0 ? (
              dep.options.map((option: {value: number | string; label: string}) => (
                <SelectItem
                  key={option.value}
                  value={String(option.value)}
                >
                  {option.label}
                </SelectItem>
              ))
            ) : (
              <SelectItem
                disabled
                value="none"
              >
                No options available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      );
    } else if (dep.data_type === 'date') {
      return (
        <Input
          type="date"
          value={parameters[dep.name] || ''}
          onChange={(e) => setParameters((prev) => ({...prev, [dep.name]: e.target.value}))}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
        />
      );
    } else {
      return (
        <Input
          value={parameters[dep.name] || ''}
          onChange={(e) => setParameters((prev) => ({...prev, [dep.name]: e.target.value}))}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
        />
      );
    }
  };

  return (
    <Card className="w-full lg:w-96">
      <CardHeader>
        <CardTitle>Start Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        {selectedWorkflow ? (
          <div className="space-y-4">
            <div className="text-sm font-medium">{selectedWorkflow.label}</div>
            {isLoadingParameters ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <>
                {workflowParameters.map((param) => (
                  <div
                    key={param.name}
                    className="space-y-2"
                  >
                    <label className="text-sm font-medium">
                      {param.label}
                      <span className="text-xs text-gray-500 ml-1">({param.name})</span>
                    </label>

                    {param.dependencies ? (
                      <div className="space-y-3 border p-3 rounded-md">
                        <div className="text-xs text-gray-500">This parameter depends on:</div>

                        {param.dependencies.map((dep: DependencyParameter) => (
                          <div
                            key={dep.name}
                            className="ml-2 space-y-1"
                          >
                            <label className="text-xs font-medium">
                              {dep.label}
                              <span className="text-xs text-gray-500 ml-1">({dep.name})</span>
                            </label>
                            {renderDependencyInput(dep)}
                          </div>
                        ))}

                        <div className="mt-3 pt-3 border-t">
                          <label className="text-xs font-medium">
                            {param.label}
                            <span className="text-xs text-gray-500 ml-1">({param.name})</span>
                          </label>
                          {renderParameterInput(param)}
                        </div>
                      </div>
                    ) : (
                      renderParameterInput(param)
                    )}
                  </div>
                ))}
                <Button
                  className="w-full"
                  onClick={handleStartWorkflow}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    'Start Workflow'
                  )}
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">Select a workflow to start</div>
        )}
      </CardContent>
    </Card>
  );
};

export default StartWorkflow;
