import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import Api from '../../utils/Api';
import { RootState } from '../../app/store';
// Keep all existing interfaces
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

interface ApiResponse {
  key: string;
  label: string;
  data: string;
  table?: string;
  children?: ApiResponse[];
  cellcount?: number;
  invalidcount?: number;
}

interface SheetDataState {
  data: SheetData | null;
  loading: boolean;
  error: string | null;
  totalCounts: {
    totalCellCount: number;
    totalInvalidCount: number;
  };
  selectedSheet: {
    label: string;
    table: string;
    sheetId: string | null;
    cellcount: number;
    invalidcount: number;
  };
  selectedCell: {
    rowId: string;
    columnId: string;
    label: string;
    table: string;
  } | null;
  changedRows: ChangedRow[];
  lastChangeTimestamp: number | null;
  dialogState: {
    isOpen: boolean;
    dialogType: string | null;
  };
  tableStructure: ApiResponse[] | null;
  tableStructureLoading: boolean;
  structureError: string | null; // Added to handle structure fetch errors
}

const initialState: SheetDataState = {
  data: null,
  loading: false,
  error: null,
  selectedSheet: {
    label: '',
    table: '',
    sheetId: null,
    cellcount: 0,
    invalidcount: 0,
  },
  totalCounts: {
    totalCellCount: 0,
    totalInvalidCount: 0,
  },
  selectedCell: null,
  changedRows: [],
  lastChangeTimestamp: null,
  dialogState: {
    isOpen: false,
    dialogType: null,
  },
  tableStructure: null,
  tableStructureLoading: false,
  structureError: null,
};

// Updated Thunks with better error handling
export const fetchTableStructure = createAsyncThunk<
  ApiResponse[],
  number,
  { rejectValue: string }
>(
  'sheetData/fetchTableStructure',
  async (workbookId: number, { rejectWithValue }) => {
    try {
      const response = await Api.get<ApiResponse[]>(
        `/RI/Workbook/Tables?workbookId=${workbookId}&includeSheets=true`,
      );
      if (!response.data) {
        throw new Error('No data received');
      }
      return response.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch table structure';
      return rejectWithValue(errorMessage);
    }
  },
);

export const fetchSheetData = createAsyncThunk<
  SheetData,
  { workbookId: number; sheetId: string },
  { rejectValue: string }
>(
  'sheetData/fetchSheetData',
  async ({ workbookId, sheetId }, { rejectWithValue }) => {
    try {
      const response = await Api.get<SheetData>(
        `/RI/Workbook/SheetData?workbookId=${workbookId}&sheetId=${sheetId}`,
      );
      if (!response.data) {
        throw new Error('No data received');
      }
      return response.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch sheet data';
      return rejectWithValue(errorMessage);
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
      action: PayloadAction<{
        label: string;
        table: string;
        sheetId: string;
        cellcount: number;
        invalidcount: number;
      }>,
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
      } | null>, // Allow null for clearing selection
    ) => {
      state.selectedCell = action.payload;
    },
    updateSheetData: (state, action: PayloadAction<SheetRow[]>) => {
      if (state.data) {
        const headerRowsCount = state.data.headerRows.length;
        state.data = {
          ...state.data,
          headerRows: action.payload.slice(0, headerRowsCount),
          valueRows: action.payload.slice(headerRowsCount),
        };
      }
    },
    updateTotalCounts: (
      state,
      action: PayloadAction<{
        totalCellCount: number;
        totalInvalidCount: number;
      }>,
    ) => {
      state.totalCounts = action.payload;
    },
    addChangedRows: (state, action: PayloadAction<ChangedRow[]>) => {
      action.payload.forEach((newRow) => {
        const existingRowIndex = state.changedRows.findIndex(
          (row) => row.rowId === newRow.rowId,
        );

        if (existingRowIndex !== -1) {
          state.changedRows[existingRowIndex] = {
            ...state.changedRows[existingRowIndex],
            updatedRow: newRow.updatedRow,
            changedCells: [
              ...state.changedRows[existingRowIndex].changedCells,
              ...newRow.changedCells,
            ],
            timestamp: Date.now(),
          };
        } else {
          state.changedRows.push({
            ...newRow,
            timestamp: Date.now(),
          });
        }
      });
      state.lastChangeTimestamp = Date.now();
    },
    clearChangedRows: (state) => {
      state.changedRows = [];
      state.lastChangeTimestamp = null;
      state.selectedCell = null;
    },
    updateChangedRow: (state, action: PayloadAction<ChangedRow>) => {
      const index = state.changedRows.findIndex(
        (row) => row.rowId === action.payload.rowId,
      );
      if (index !== -1) {
        state.changedRows[index] = {
          ...action.payload,
          timestamp: Date.now(),
        };
        state.lastChangeTimestamp = Date.now();
      }
    },
    setDialogState: (
      state,
      action: PayloadAction<{ isOpen: boolean; dialogType: string | null }>,
    ) => {
      state.dialogState = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSheetData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSheetData.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchSheetData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch sheet data';
      });

    builder
      .addCase(fetchTableStructure.pending, (state) => {
        state.tableStructureLoading = true;
        state.structureError = null;
      })
      .addCase(fetchTableStructure.fulfilled, (state, action) => {
        state.tableStructure = action.payload;
        state.tableStructureLoading = false;
        state.structureError = null;
      })
      .addCase(fetchTableStructure.rejected, (state, action) => {
        state.tableStructureLoading = false;
        state.structureError = action.payload || 'Failed to fetch structure';
      });
  },
});

// Export actions
export const {
  clearSheetData,
  updateSelectedSheet,
  updateSelectedCell,
  updateSheetData,
  addChangedRows,
  clearChangedRows,
  updateChangedRow,
  updateTotalCounts,
  setDialogState,
} = sheetDataSlice.actions;

// Export selectors
export const selectChangedRows = (state: { sheetData: SheetDataState }) =>
  state.sheetData.changedRows;
export const selectLastChangeTimestamp = (state: {
  sheetData: SheetDataState;
}) => state.sheetData.lastChangeTimestamp;
export const selectTotalCounts = (state: { sheetData: SheetDataState }) =>
  state.sheetData.totalCounts;
export const selectDialogState = (state: { sheetData: SheetDataState }) =>
  state.sheetData.dialogState;
export const selectTableStructure = (state: { sheetData: SheetDataState }) =>
  state.sheetData.tableStructure;
export const selectTableStructureLoading = (state: {
  sheetData: SheetDataState;
}) => state.sheetData.tableStructureLoading;
export const selectStructureError = (state: { sheetData: SheetDataState }) =>
  state.sheetData.structureError;
export const selectSelectedSheet = (state: RootState) =>
  state.sheetData.selectedSheet;
export default sheetDataSlice.reducer;
