import React, {createContext, useContext} from 'react';

import {TaskConfigurationContextType, TaskConfigurationResponse} from '@/types/databaseTypes';

const TaskConfigurationContext = createContext<TaskConfigurationContextType | undefined>(undefined);

export const TaskConfigurationProvider: React.FC<{
  children: React.ReactNode;
  taskConfigurations: TaskConfigurationResponse | undefined;
  isLoading: boolean;
}> = ({children, taskConfigurations, isLoading}) => {
  return (
    <TaskConfigurationContext.Provider value={{taskConfigurations, isLoading}}>
      {children}
    </TaskConfigurationContext.Provider>
  );
};

export const useTaskConfiguration = () => {
  const context = useContext(TaskConfigurationContext);
  if (context === undefined) {
    throw new Error('useTaskConfiguration must be used within a TaskConfigurationProvider');
  }
  return context;
};
