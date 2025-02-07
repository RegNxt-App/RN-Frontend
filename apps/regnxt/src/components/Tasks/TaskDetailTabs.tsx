import React, {useCallback, useEffect} from 'react';

import {orchestraBackendInstance} from '@/lib/axios';
import {TaskDetailTabsProps, TaskParameter} from '@/types/databaseTypes';
import {Calendar, Code, Tag, Trash2} from 'lucide-react';
import useSWR from 'swr';

import {Button} from '@rn/ui/components/ui/button';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@rn/ui/components/ui/tabs';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@rn/ui/components/ui/tooltip';

import {ConfigurationsTabContent} from './ConfigurationsTabContent';
import {PropertiesTabContent} from './PropertiesTabContent';
import {TransformationTab} from './TransformationTab';

export const TaskDetailTabs: React.FC<TaskDetailTabsProps> = ({
  selectedTask,
  currentTab,
  setCurrentTab,
  localTask,
  setLocalTask,
  isSaving,
  setIsSaving,
  designTimeParams,
  setDesignTimeParams,
  runtimeParams,
  onSave,
  inputOptionsResponse,
  outputOptionsResponse,
  variablesResponse,
  onDeleteClick,
  onInputChange,
  subtypeParamsResponse,
}) => {
  const inputVariableId = variablesResponse?.find(
    (v) => v.name.toLowerCase().includes('input') && v.name.toLowerCase().includes('dataset')
  )?.variable_id;

  const outputVariableId = variablesResponse?.find(
    (v) => v.name.toLowerCase().includes('output') && v.name.toLowerCase().includes('dataset')
  )?.variable_id;

  const updateDesignTimeParams = useCallback(() => {
    if (!selectedTask?.parameters || selectedTask.parameters.length === 0) {
      setDesignTimeParams({
        sourceId: null,
        sourceType: null,
        destinationId: null,
      });
      return;
    }
    if (selectedTask?.parameters) {
      const inputParam = selectedTask.parameters.find(
        (param: TaskParameter) => param.parameter_id === inputVariableId || param.id === inputVariableId
      );
      const outputParam = selectedTask.parameters.find(
        (param: TaskParameter) => param.parameter_id === outputVariableId || param.id === outputVariableId
      );

      if (inputParam || outputParam) {
        const inputOption = inputOptionsResponse?.data?.find(
          (opt) => String(opt.id) === (inputParam?.default_value || inputParam?.value)
        );

        const newDesignTimeParams = {
          sourceId: inputParam?.default_value || inputParam?.value || null,
          sourceType: inputParam?.source || inputOption?.source || null,
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
  }, [selectedTask?.parameters, inputVariableId, outputVariableId, inputOptionsResponse?.data]);

  useEffect(() => {
    updateDesignTimeParams();
  }, [updateDesignTimeParams]);

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-2">
        <h2 className="text-xl font-semibold">{localTask?.label}</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onDeleteClick}
                    disabled={selectedTask.is_predefined || isSaving}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </span>
              </TooltipTrigger>
              {localTask?.is_predefined && (
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
                    disabled={localTask?.is_predefined || isSaving}
                  >
                    Save Changes
                  </Button>
                </span>
              </TooltipTrigger>
              {localTask?.is_predefined && (
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
          <Code className="w-4 h-4 mr-1" /> {localTask?.code}
        </span>
        <span className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" /> 28/09/2024
        </span>
        <span className="flex items-center">
          <Tag className="w-4 h-4 mr-1" /> {localTask?.task_type_label}
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
          {selectedTask.task_type_code === 'transform' && (
            <TabsTrigger
              value="transformation"
              className="flex-1"
            >
              Transformation
            </TabsTrigger>
          )}
        </TabsList>

        <PropertiesTabContent
          selectedTask={selectedTask}
          localTask={localTask}
          handleInputChange={onInputChange}
        />
        <ConfigurationsTabContent
          selectedTask={selectedTask}
          localTask={localTask}
          handleInputChange={onInputChange}
          designTimeParams={designTimeParams}
          setDesignTimeParams={setDesignTimeParams}
          variablesResponse={variablesResponse}
          inputOptionsResponse={inputOptionsResponse}
          outputOptionsResponse={outputOptionsResponse}
          runtimeParams={runtimeParams}
          subtypeParamsResponse={subtypeParamsResponse}
        />

        {selectedTask.task_type_code === 'transform' && (
          <TabsContent value="transformation">
            <TransformationTab
              disabled={selectedTask.is_predefined}
              onSave={onSave}
              selectedTask={selectedTask}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};
