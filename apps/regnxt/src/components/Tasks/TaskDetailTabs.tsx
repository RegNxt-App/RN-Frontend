import React, {useCallback, useEffect} from 'react';

import {
  ApiResponse,
  DatasetOption,
  DataviewOption,
  DesignTimeParams,
  SubtypeParamsResponse,
  Task,
  TaskParameter,
  VariableResponse,
} from '@/types/databaseTypes';
import {Calendar, Code, Tag, Trash2} from 'lucide-react';

import {Button} from '@rn/ui/components/ui/button';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@rn/ui/components/ui/tabs';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@rn/ui/components/ui/tooltip';

import {ConfigurationsTabContent} from './ConfigurationsTabContent';
import {PropertiesTabContent} from './PropertiesTabContent';
import {TransformationTab} from './TransformationTab';

interface TaskDetailTabsProps {
  task: Task | null;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isSaving: boolean;
  designTimeParams: DesignTimeParams;
  setDesignTimeParams: React.Dispatch<React.SetStateAction<DesignTimeParams>>;
  onSave: () => Promise<void>;
  onDelete: () => void;
  onTaskChange: (field: keyof Task, value: string) => void;
  inputOptionsResponse?: ApiResponse<(DatasetOption | DataviewOption)[]>;
  outputOptionsResponse?: ApiResponse<DatasetOption[]>;
  variablesResponse?: VariableResponse[];
  subtypeParamsResponse?: SubtypeParamsResponse[];
}

export const TaskDetailTabs: React.FC<TaskDetailTabsProps> = ({
  task,
  currentTab,
  setCurrentTab,
  isSaving,
  designTimeParams,
  setDesignTimeParams,
  onSave,
  onDelete,
  onTaskChange,
  inputOptionsResponse,
  outputOptionsResponse,
  variablesResponse,
  subtypeParamsResponse,
}) => {
  const inputVariableId = variablesResponse?.find(
    (v) => v.name.toLowerCase().includes('input') && v.name.toLowerCase().includes('dataset')
  )?.variable_id;

  const outputVariableId = variablesResponse?.find(
    (v) => v.name.toLowerCase().includes('output') && v.name.toLowerCase().includes('dataset')
  )?.variable_id;

  const updateDesignTimeParams = useCallback(() => {
    if (!task?.parameters || task.parameters.length === 0) {
      return;
    }
    if (task?.parameters) {
      const inputParam = task.parameters.find(
        (param: TaskParameter) => param.parameter_id === inputVariableId || param.id === inputVariableId
      );
      const outputParam = task.parameters.find(
        (param: TaskParameter) => param.parameter_id === outputVariableId || param.id === outputVariableId
      );

      if (inputParam || outputParam) {
        const inputOption = inputOptionsResponse?.data?.find(
          (opt) => String(opt.id) === (inputParam?.default_value || inputParam?.value)
        );

        const newDesignTimeParams: DesignTimeParams = {
          sourceId: inputParam?.default_value || inputParam?.value || null,
          sourceType: (inputParam?.source || inputOption?.source || null) as 'dataset' | 'dataview' | null,
          destinationId: outputParam?.default_value || outputParam?.value || null,
        };

        setDesignTimeParams(newDesignTimeParams);
      } else {
        setDesignTimeParams({
          sourceId: null,
          sourceType: null,
          destinationId: null,
        });
      }
    }
  }, [task?.parameters, inputVariableId, outputVariableId, inputOptionsResponse?.data]);

  useEffect(() => {
    updateDesignTimeParams();
  }, [updateDesignTimeParams]);

  if (!task) {
    return null;
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-2">
        <h2 className="text-xl font-semibold">{task?.label}</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDelete}
                    disabled={task?.is_predefined || isSaving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </span>
              </TooltipTrigger>
              {task?.is_predefined && (
                <TooltipContent>
                  <p>You cannot delete a task that is system generated</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={onSave}
                    disabled={task?.is_predefined || isSaving}
                  >
                    Save Changes
                  </Button>
                </span>
              </TooltipTrigger>
              {task?.is_predefined && (
                <TooltipContent>
                  <p>You cannot edit a task that is system generated</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-500">
        <span className="flex items-center">
          <Code className="w-4 h-4 mr-1" /> {task?.code}
        </span>
        <span className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" /> 28/09/2024
        </span>
        <span className="flex items-center">
          <Tag className="w-4 h-4 mr-1" /> {task?.task_type_label}
        </span>
      </div>

      <Tabs
        value={currentTab}
        onValueChange={setCurrentTab}
      >
        <TabsList className="w-full border-b mb-4 lg:mb-6 flex flex-wrap">
          <TabsTrigger
            value="properties"
            className="flex-1"
          >
            Properties
          </TabsTrigger>
          <TabsTrigger
            value="configurations"
            className="flex-1"
          >
            Configurations
          </TabsTrigger>
          {task.task_type_code === 'transform' && (
            <TabsTrigger
              value="transformation"
              className="flex-1"
            >
              Transformation
            </TabsTrigger>
          )}
        </TabsList>

        <PropertiesTabContent
          task={task}
          onTaskChange={onTaskChange}
        />
        <ConfigurationsTabContent
          task={task}
          onTaskChange={onTaskChange}
          designTimeParams={designTimeParams}
          setDesignTimeParams={setDesignTimeParams}
          variablesResponse={variablesResponse}
          inputOptionsResponse={inputOptionsResponse}
          outputOptionsResponse={outputOptionsResponse}
          subtypeParamsResponse={subtypeParamsResponse}
        />

        {task.task_type_code === 'transform' && (
          <TabsContent value="transformation">
            <TransformationTab
              disabled={task.is_predefined}
              onSave={onSave}
              task={task}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
