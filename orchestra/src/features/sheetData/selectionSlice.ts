import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SelectionState {
  label: string | null;
  table: string | null;
}

const initialState: SelectionState = {
  label: null,
  table: null,
};

const selectionSlice = createSlice({
  name: 'selection',
  initialState,
  reducers: {
    setSelection: (
      state,
      action: PayloadAction<{ label: string; table: string | null }>,
    ) => {
      state.label = action.payload.label;
      state.table = action.payload.table;
    },
    clearSelection: (state) => {
      state.label = null;
      state.table = null;
    },
  },
});

export const { setSelection, clearSelection } = selectionSlice.actions;

export default selectionSlice.reducer;
