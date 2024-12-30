import {Dataset, DatasetResponse} from '@/types/databaseTypes';
import {KeyedMutator} from 'swr';

export const updateCache = (key: string, newItem: Dataset, mutateFn: KeyedMutator<DatasetResponse>): void => {
  mutateFn((currentData: DatasetResponse | undefined) => {
    if (!currentData) return currentData;
    return {
      ...currentData,
      data: {
        ...currentData.data,
        results: [newItem, ...currentData.data.results],
        count: currentData.data.count + 1,
      },
    };
  }, false);
};
