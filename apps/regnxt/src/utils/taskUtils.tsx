import {TaskConfigurationResponse} from '@/types/databaseTypes';

export const getDefaultLanguage = (
  taskTypeCode: string,
  currentLanguage: string | null,
  configurations: TaskConfigurationResponse | undefined
) => {
  if (!configurations) return currentLanguage || 'python';
  return configurations.defaultLanguages[taskTypeCode] ?? currentLanguage ?? 'python';
};
