import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import Api from '../../utils/Api';

interface SheetCell {
  cellid: number;
  colspan: number;
  format: string;
  nonEditable: boolean;
  rownr: number;
  rowspan: number;
  text: string;
  type: 'header' | 'number' | 'empty';
  value: number | null;
}

interface SheetRow {
  rowId: string | number;
  cells: SheetCell[];
}

interface SheetColumn {
  columnId: string | number;
  width: number;
}

interface SheetData {
  headerRows: SheetRow[];
  valueRows: SheetRow[];
  columns: SheetColumn[];
}

// New interfaces for changed rows
interface ChangedCell {
  sheetid: number;
  cellid: number | undefined;
  prevvalue: string;
  newvalue: string;
  comment: string;
  cellCode: string;
  rowNr: number;
  colNr: number;
}

interface ChangedRow {
  rowId: string;
  originalRow: {
    rowId: string;
    cells: SheetCell[];
  };
  updatedRow: {
    rowId: string;
    cells: SheetCell[];
  };
  changedCells: ChangedCell[];
  timestamp: number;
}

interface SheetDataState {
  data: SheetData | null;
  loading: boolean;
  error: string | null;
  selectedSheet: {
    label: string;
    table: string;
    sheetId: string | null;
  };
  selectedCell: {
    rowId: string;
    columnId: string;
    label: string;
    table: string;
  } | null;
  // New state for changed rows
  changedRows: ChangedRow[];
  lastChangeTimestamp: number | null;
}

const initialState: SheetDataState = {
  data: null,
  loading: false,
  error: null,
  selectedSheet: {
    label: '',
    table: '',
    sheetId: null,
  },
  selectedCell: null,
  // Initialize new state properties
  changedRows: [],
  lastChangeTimestamp: null,
};

export const fetchSheetData = createAsyncThunk<
  SheetData,
  { workbookId: number; sheetId: string },
  { rejectValue: string }
>(
  'sheetData/fetchSheetData',
  async ({ workbookId, sheetId }, { rejectWithValue }) => {
    try {
      console.log('Fetching sheet data with:', { workbookId, sheetId });
      const response = await Api.get<SheetData>(
        `/RI/Workbook/SheetData?workbookId=${workbookId}&sheetId=${sheetId}`,
      );
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API call failed:', error);
      return rejectWithValue('Failed to fetch sheet data');
    }
  },
);

const sheetDataSlice = createSlice({
  name: 'sheetData',
  initialState,
  reducers: {
    clearSheetData: (state) => {
      return { ...initialState };
    },
    updateSelectedSheet: (
      state,
      action: PayloadAction<{ label: string; table: string; sheetId: string }>,
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
    updateSheetData: (state, action: PayloadAction<SheetRow[]>) => {
      if (state.data) {
        const headerRowsCount = state.data.headerRows.length;
        return {
          ...state,
          data: {
            ...state.data,
            headerRows: action.payload.slice(0, headerRowsCount),
            valueRows: action.payload.slice(headerRowsCount),
          },
        };
      }
      return state;
    },
    // New reducers for changed rows
    addChangedRows: (state, action: PayloadAction<ChangedRow[]>) => {
      action.payload.forEach((newRow) => {
        const existingRowIndex = state.changedRows.findIndex(
          (row) => row.rowId === newRow.rowId,
        );

        if (existingRowIndex !== -1) {
          // Update existing row
          state.changedRows[existingRowIndex] = {
            ...state.changedRows[existingRowIndex],
            updatedRow: newRow.updatedRow,
            changedCells: [
              ...state.changedRows[existingRowIndex].changedCells,
              ...newRow.changedCells,
            ],
            timestamp: newRow.timestamp,
          };
        } else {
          // Add new row
          state.changedRows.push(newRow);
        }
      });
      state.lastChangeTimestamp = Date.now();
    },
    clearChangedRows: (state) => {
      state.changedRows = [];
      state.lastChangeTimestamp = null;
    },
    // Optional: Add a reducer to update a single changed row
    updateChangedRow: (state, action: PayloadAction<ChangedRow>) => {
      const index = state.changedRows.findIndex(
        (row) => row.rowId === action.payload.rowId,
      );
      if (index !== -1) {
        state.changedRows[index] = action.payload;
        state.lastChangeTimestamp = Date.now();
      }
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
        (state, action: PayloadAction<SheetData>) => {
          state.data = action.payload;
          state.loading = false;
        },
      )
      .addCase(fetchSheetData.rejected, (state, action) => {
        state.error = action.payload || 'Failed to fetch sheet data';
        state.loading = false;
      });
  },
});

// Export all actions
export const {
  clearSheetData,
  updateSelectedSheet,
  updateSelectedCell,
  updateSheetData,
  addChangedRows,
  clearChangedRows,
  updateChangedRow,
} = sheetDataSlice.actions;

// Export selectors
export const selectChangedRows = (state: { sheetData: SheetDataState }) =>
  state.sheetData.changedRows;
export const selectLastChangeTimestamp = (state: {
  sheetData: SheetDataState;
}) => state.sheetData.lastChangeTimestamp;

export default sheetDataSlice.reducer;
