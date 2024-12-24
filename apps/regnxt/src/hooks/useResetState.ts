import {useEffect} from 'react';

interface UseResetStateProps {
  resetStates: () => void;
  dependencies: any[];
}

export const useResetState = ({resetStates, dependencies}: UseResetStateProps) => {
  useEffect(() => {
    resetStates();
  }, dependencies);
};
