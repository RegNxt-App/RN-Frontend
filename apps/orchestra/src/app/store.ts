import { configureStore } from '@reduxjs/toolkit';
import sheetDataReducer from '../features/sheetData/sheetDataSlice';
import selectionReducer from '../features/sheetData/selectionSlice';

export const store = configureStore({
  reducer: {
    sheetData: sheetDataReducer,
    selection: selectionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
