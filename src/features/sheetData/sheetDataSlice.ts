import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import Api from '../../utils/Api';

// Define the initial state
interface SheetDataState {
  data: any | null;
  loading: boolean;
  error: string | null;
  selectedSheet: {
    label: string;
    table: string;
  };
  selectedCell: {
    rowId: string;
    columnId: string;
    label: string;
    table: string;
  } | null;
}

const initialState: SheetDataState = {
  data: null,
  loading: false,
  error: null,
  selectedSheet: {
    label: '',
    table: '',
  },
  selectedCell: null,
};

// Thunk for fetching sheet data
export const fetchSheetData = createAsyncThunk(
  'sheetData/fetchSheetData',
  async (
    { workbookId, sheetId }: { workbookId: number; sheetId: string },
    { rejectWithValue },
  ) => {
    try {
      console.log('Fetching sheet data with:', { workbookId, sheetId }); // Debug log
      const response = await Api.get(
        `/RI/Workbook/SheetData?workbookId=${workbookId}&sheetId=${sheetId}`,
      );
      console.log('API response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('API call failed:', error); // Debug log
      return rejectWithValue('Failed to fetch sheet data');
    }
  },
);

const sheetDataSlice = createSlice({
  name: 'sheetData',
  initialState,
  reducers: {
    clearSheetData: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
      state.selectedSheet = { label: '', table: '' };
      state.selectedCell = null;
    },
    updateSelectedSheet: (
      state,
      action: PayloadAction<{ label: string; table: string }>,
    ) => {
      state.selectedSheet = action.payload;
    },
    updateSelectedCell: (
      state,
      action: PayloadAction<{
        rowId: string;
        columnId: string;
        label: string;
        table: string;
      }>,
    ) => {
      state.selectedCell = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSheetData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchSheetData.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.data = action.payload;
          state.loading = false;
        },
      )
      .addCase(fetchSheetData.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch sheet data';
        state.loading = false;
      });
  },
});

export const { clearSheetData, updateSelectedSheet, updateSelectedCell } =
  sheetDataSlice.actions;
export default sheetDataSlice.reducer;
