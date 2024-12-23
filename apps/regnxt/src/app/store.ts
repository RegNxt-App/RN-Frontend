import {configureStore} from '@reduxjs/toolkit';

import selectionReducer from '../features/sheetData/selectionSlice';
import sheetDataReducer from '../features/sheetData/sheetDataSlice';

export const store = configureStore({
  reducer: {
    sheetData: sheetDataReducer,
    selection: selectionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
