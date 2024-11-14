//Current Component
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { Expand, LayoutGrid, Minimize, Plus, Undo2 } from 'lucide-react';
import {
  ReactGrid,
  Column,
  Row,
  CellChange,
  Id,
  CellStyle,
  MenuOption,
  GridSelection,
  Cell,
  CellLocation,
} from '@silevis/reactgrid';
import '@silevis/reactgrid/styles.css';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { RootState } from '../../app/store';
import WorkbookSlider from './WorkbookSlider';
import {
  clearSheetData,
  updateSelectedCell,
  updateSheetData,
} from '../../features/sheetData/sheetDataSlice';
import { addChangedRows } from '../../features/sheetData/sheetDataSlice';
import Api from '../../utils/Api';
import { ShadedCellTemplate } from '../ReactGrid/ShadedCellTemplate';
import { HeaderCellTemplate } from '../ReactGrid/HeaderCellTemplate';
import { EmptyCellTemplate } from '../ReactGrid/EmptyCellTemplate';
import { FormulaCellTemplate } from '../ReactGrid/FormulaCellTemplate';
import { InvalidTextCellTemplate } from '../ReactGrid/InvalidTextCellTemplate';
import { InvalidNumberCellTemplate } from '../ReactGrid/InvalidNumberCellTemplate';
import { Dialog } from '@headlessui/react';

interface WorkbookData {
  id: number;
  name: string;
  module: string;
  entity: string;
  reportingDate: string;
  status: string;
}

interface SheetColumn {
  columnId: string | number;
  width: number;
}

interface SheetCell {
  cellid: number;
  columnId: string;
  colspan: number;
  format: string;
  nonEditable: boolean;
  rownr: number;
  rowspan: number;
  text: string;
  type: 'header' | 'number' | 'empty' | 'text' | 'shaded' | 'formula';
  value: number | null;
  // style?: CellStyle;
}

interface SheetRow {
  rowId: string;
  cells: SheetCell[];
}

interface CellInfoParams {
  workbookid: number;
  sheetid: number;
  rowid: string | number;
  colid: string | number;
}

interface CellInfoResponse {
  cellId: number;
  datapointVID: number;
  dataType: string;
  isKey: boolean;
  keyType: string;
  isInvalid: boolean;
  members: any[];
  metric: {
    regulatorId: number;
    metricId: number;
    memberId: number;
    dataType: string;
    domainId: number;
    subdomainId: number;
    unit: string;
    decimals: number;
    origMeasureField: string;
  };
  rowDimensions: any[];
  columnDimensions: any[];
  sheetDimensions: any[];
  validationRules: any[];
}

interface ChangedCell {
  sheetid: number;
  cellid: number;
  prevvalue: string;
  newvalue: string;
  comment: string;
  cellCode: string;
  rowNr: number;
  colNr: number;
}

interface ChangedRow {
  rowId: string;
  originalRow: SheetRow;
  updatedRow: SheetRow;
  changedCells: ChangedCell[];
  timestamp: number;
}

interface WorkbookPopupProps {
  workbook: WorkbookData;
  onClose: () => void;
  onShowSlider: () => void;
  onRowChange?: (changedRows: ChangedRow[]) => void;
}
interface HistoryColumn {
  field: string;
  header: string;
}
interface SheetData {
  headerRows: SheetRow[];
  valueRows: SheetRow[];
  columns: SheetColumn[];
  hasOpenRows: boolean;
}

const historyColumns: HistoryColumn[] = [
  { field: 'versionId', header: 'Version Id' },
  { field: 'cellValue', header: 'Cell Value' },
  { field: 'isInvalid', header: 'Is Invalid' },
  { field: 'invalidReason', header: 'Invalid Reason' },
  { field: 'modifierId', header: 'Modifier' },
  { field: 'modificationTime', header: 'Modification Time' },
];

const STORAGE_KEY = 'workbookData';

const decodeHtmlEntities = (text: string): string => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};
const createEmptyCell = (props = {}): Cell => ({
  type: 'empty',
  text: '',
  nonEditable: true,
  style: {
    background: 'transparent',
    border: 'none',
    padding: '4px 8px',
  },
  ...props,
});

const WorkbookPopup: React.FC<WorkbookPopupProps> = ({
  workbook,
  onClose,
  onShowSlider,
  onRowChange,
}) => {
  const [showSlider, setShowSlider] = useState(false);
  const [curLocation, setCurLocation] = useState<{
    workbookid: number;
    sheetid: number;
    rowid: Id;
    colid: Id;
  } | null>(null);

  const dispatch = useAppDispatch();
  const gridRef = useRef<ReactGrid>(null);

  const sheetData = useAppSelector((state: RootState) => state.sheetData.data);
  const selectedSheet = useAppSelector(
    (state: RootState) => state.sheetData.selectedSheet,
  );

  const [localRows, setLocalRows] = useState<Row[]>([]);
  const [cellChanges, setCellChanges] = useState<ChangedCell[]>([]);
  const [changedRows, setChangedRows] = useState<ChangedRow[]>([]);
  const [cellInfo, setCellInfo] = useState<CellInfoResponse | null>(null);
  const [showCellInfo, setShowCellInfo] = useState(false);
  const [cellHistory, setCellHistory] = useState<any[] | null>(null);
  const [cellHistoryHeader, setCellHistoryHeader] = useState<string | null>(
    null,
  );
  const [showCellHistory, setShowCellHistory] = useState(false);
  const [cellAudit, setCellAudit] = useState<any | null>(null);
  const [cellAuditHeader, setCellAuditHeader] = useState<string | null>(null);
  const [showCellAudit, setShowCellAudit] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<{
    name: string;
    value: any;
  } | null>(null);
  const [hasOpenRows, setHasOpenRows] = useState(false);
  const [nrOfInserts, setNrOfInserts] = useState<{
    name: string;
    code: number;
  }>({
    name: '1',
    code: 1,
  });

  const insertOptions = [
    { name: '1', code: 1 },
    { name: '10', code: 10 },
    { name: '100', code: 100 },
    { name: '1000', code: 1000 },
  ];

  const columns: Column[] = useMemo(
    () =>
      sheetData?.columns
        ? sheetData.columns.map((col: SheetColumn) => ({
            columnId: col.columnId,
            width: col.width,
          }))
        : [],
    [sheetData],
  );
  const handleAddRows = () => {
    if (!sheetData) return;

    const clonedValues = [...localRows];
    const headerRowsCount = sheetData.headerRows.length;
    const lastDataRowIndex = clonedValues.length - 1;

    // Get the template row (last row) to copy its cell structure
    const templateRow = clonedValues[lastDataRowIndex];

    for (let i = 0; i < nrOfInserts.code; i++) {
      // Create new row by properly cloning the template row's structure
      const newRow = {
        rowId: `999-${clonedValues.length - headerRowsCount + 1}`,
        cells: templateRow.cells.map((cell, cellIndex) => {
          // For the first two columns (heading and code), keep the original values
          if (cellIndex === 0) {
            return {
              ...cell,
              text: templateRow.cells[0].text, // Keep the heading text
              value: templateRow.cells[0].value,
              type: templateRow.cells[0].type,
              nonEditable: templateRow.cells[0].nonEditable,
            };
          } else if (cellIndex === 1) {
            return {
              ...cell,
              text: '999', // Keep the code
              value: 999,
              type: templateRow.cells[1].type,
              nonEditable: templateRow.cells[1].nonEditable,
            };
          } else {
            // For other cells, reset the values
            return {
              ...cell,
              text: '',
              value: null,
              type: cell.type,
              nonEditable: cell.nonEditable,
              style: {
                ...cell.style,
                borderRight: undefined,
                borderRightColor: '#e2e8f0',
                borderRightWidth: '1px',
                borderRightStyle: 'solid',
              },
            };
          }
        }),
      };

      clonedValues.push(newRow);
    }

    setLocalRows(clonedValues);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clonedValues));
  };

  const isValueCell = useCallback((cell: SheetCell): boolean => {
    return cell.type === 'number' && !cell.nonEditable;
  }, []);

  const getCellStyle = useCallback(
    (cell: SheetCell): CellStyle => {
      const editable = isValueCell(cell);
      return {
        background: cell.type === 'header' ? '#e0e0e0' : 'white',
        color: editable ? 'black' : '#666',
        cursor: editable ? 'default' : 'not-allowed',
        padding: '4px 8px',
        textAlign: cell.type === 'number' ? 'right' : 'left',
      };
    },
    [isValueCell],
  );

  const createCellContent = useCallback((cell: SheetCell): Cell => {
    // Base style for all cells - include grid styling
    const baseStyle = {
      background: '#fff',
      padding: '4px 8px',
      borderRight: '1px solid #e2e8f0',
      borderBottom: '1px solid #e2e8f0',
    };

    // Function to determine if it's an alternate row
    const isAlternateRow = (rownr: number) => rownr % 2 === 0;

    // Set background color based on cell type and row number
    const getBackground = (cellType: string, rownr: number) => {
      if (cellType === 'header') return '#e5e7eb';
      if (cellType === 'shaded') return '#969696';
      return isAlternateRow(rownr) ? '#f8fafc' : '#fff';
    };

    const cellStyle = {
      ...baseStyle,
      background: getBackground(cell.type, cell.rownr),
    };

    switch (cell.type) {
      case 'header':
        return {
          type: 'header',
          text: decodeHtmlEntities(cell.text || ''),
          nonEditable: true,
          style: cellStyle,
        };
      case 'shaded':
        return {
          type: 'shaded',
          text: decodeHtmlEntities(cell.text || ''),
          nonEditable: true,
          style: cellStyle,
        };
      case 'empty':
        return {
          type: 'empty',
          text: decodeHtmlEntities(cell.text || ''),
          nonEditable: true,
          style: cellStyle,
        };
      case 'formula':
        return {
          type: 'formula',
          text: decodeHtmlEntities(cell.text || ''),
          nonEditable: true,
          style: { ...cellStyle, color: '#2563eb' }, // Blue color for formulas
        };
      case 'number':
        return {
          type: cell.nonEditable ? 'invalidnumber' : 'number',
          text: decodeHtmlEntities(cell.text || ''),
          value: cell.value,
          nonEditable: cell.nonEditable,
          style: cellStyle,
        };
      default:
        return {
          type: cell.nonEditable ? 'invalidtext' : 'text',
          text: decodeHtmlEntities(cell.text || ''),
          nonEditable: cell.nonEditable,
          style: cellStyle,
        };
    }
  }, []);

  const processRow = useCallback(
    (row: any): Row => {
      return {
        rowId: row.rowId.toString(),
        cells: row.cells.map((cell: SheetCell) => createCellContent(cell)),
      };
    },
    [createCellContent],
  );
  const normalizeRow = useCallback(
    (row: any, expectedColumns: number): Row => {
      try {
        if (!row || !row.rowId || !Array.isArray(row.cells)) {
          throw new Error(`Invalid row structure for row ${row?.rowId}`);
        }

        let normalizedCells: Cell[] = [];
        let currentColumnIndex = 0;

        for (const cell of row.cells) {
          if (currentColumnIndex >= expectedColumns) break;
          if (!cell) continue;

          const colspan = Math.min(
            cell.colspan || 1,
            expectedColumns - currentColumnIndex,
          );

          const processedCell = createCellContent(cell);
          if (colspan > 1) {
            processedCell.colspan = colspan;
          }

          normalizedCells.push(processedCell);
          currentColumnIndex++;

          // Handle colspan by adding empty cells
          for (let i = 1; i < colspan; i++) {
            if (currentColumnIndex < expectedColumns) {
              normalizedCells.push(createEmptyCell());
              currentColumnIndex++;
            }
          }
        }

        // Fill remaining columns with empty cells
        while (currentColumnIndex < expectedColumns) {
          normalizedCells.push(createEmptyCell());
          currentColumnIndex++;
        }

        return {
          rowId: row.rowId.toString(),
          cells: normalizedCells,
        };
      } catch (error) {
        console.error('Row normalization error:', error);
        return {
          rowId: row?.rowId?.toString() || 'error',
          cells: Array(expectedColumns).fill(createEmptyCell()),
        };
      }
    },
    [createCellContent],
  );

  const showCellDetails = async () => {
    if (!curLocation) return;

    try {
      const response = await Api.get<CellInfoResponse>(
        `/RI/Workbook/CellInfo?workbookId=${curLocation.workbookid}&sheetId=${curLocation.sheetid}&rowId=${curLocation.rowid}&colId=${curLocation.colid}`,
      );
      setCellInfo(response.data);
      setShowCellInfo(true);
    } catch (error) {
      console.error('Error fetching cell info:', error);
    }
  };
  const showCellHistoryVersions = async () => {
    if (!curLocation) return;

    try {
      const response = await Api.get(
        `/RI/Workbook/CellHistory?workbookId=${curLocation.workbookid}&sheetId=${curLocation.sheetid}&rowId=${curLocation.rowid}&colId=${curLocation.colid}`,
      );
      setCellHistory(response.data);
      setCellHistoryHeader(
        `Cell history for col ${curLocation.colid} and row ${curLocation.rowid}`,
      );
      setShowCellHistory(true);
    } catch (error) {
      console.error('Error fetching cell history:', error);
    }
  };

  const showCellAuditWindow = () => {
    if (!curLocation) return;

    setCellAudit({}); // Replace with actual audit data fetch
    setCellAuditHeader(
      `Cell Audit for col ${curLocation.colid} and row ${curLocation.rowid}`,
    );
    setShowCellAudit(true);
  };
  const handleContextMenu = useCallback(
    (
      selectedRowIds: Id[],
      selectedColIds: Id[],
      selectionMode: 'row' | 'column' | 'cell',
      menuOptions: MenuOption[],
      selectedRanges: GridSelection,
    ): MenuOption[] => {
      console.log('Context Menu Location:', curLocation);
      const newMenuOptions: MenuOption[] = [];

      if (curLocation) {
        // Find the row
        const row = localRows.find(
          (row) => row.rowId.toString() === curLocation.rowid.toString(),
        );

        if (row) {
          // Find the cell by matching columnId with the curLocation.colid
          const cellIndex = columns.findIndex(
            (col) => col.columnId.toString() === curLocation.colid.toString(),
          );

          console.log('Found Row:', row);
          console.log('Cell Index:', cellIndex);

          if (cellIndex !== -1) {
            const cell = row.cells[cellIndex];
            console.log('Found Cell:', cell);

            // Check if it's a value cell that can be edited
            if (cell && !cell.nonEditable) {
              newMenuOptions.push(
                {
                  id: 'cellDetails',
                  label: 'Show Details',
                  handler: () => {
                    showCellDetails();
                  },
                },
                {
                  id: 'cellHistory',
                  label: 'Show Historical values',
                  handler: () => {
                    showCellHistoryVersions();
                  },
                },
                {
                  id: 'cellAudit',
                  label: 'Show Audit',
                  handler: () => {
                    showCellAuditWindow();
                  },
                },
              );
            }
          }
        }
      }

      console.log('Menu Options:', newMenuOptions);
      return newMenuOptions;
    },
    [
      curLocation,
      localRows,
      columns,
      showCellDetails,
      showCellHistoryVersions,
      showCellAuditWindow,
    ],
  );

  useEffect(() => {
    if (!sheetData) return;

    const processData = () => {
      const allRows = [
        ...(sheetData.headerRows || []),
        ...(sheetData.valueRows || []),
      ];
      const processedRows = allRows.map(processRow);
      setLocalRows(processedRows);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(processedRows));
    };

    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setLocalRows(parsedData.map(processRow));
      } catch (error) {
        console.error('Error parsing stored data:', error);
        processData();
      }
    } else {
      processData();
    }

    return () => {
      localStorage.removeItem(STORAGE_KEY);
    };
  }, [sheetData, processRow]);

  const getCellId = async (params: CellInfoParams): Promise<number> => {
    try {
      const response = await Api.get<CellInfoResponse>(
        `/RI/Workbook/CellInfo?workbookId=${params.workbookid}&sheetId=${params.sheetid}&rowId=${params.rowid}&colId=${params.colid}`,
      );
      return response.data.cellId;
    } catch (error) {
      console.error('Failed to fetch cell info:', error);
      throw new Error('Failed to fetch cell ID');
    }
  };

  const handleChanges = async (changes: CellChange[]) => {
    if (!changes.length) return;

    const sheetid = Number(selectedSheet.sheetId);
    const newChanges: ChangedCell[] = [];
    const updatedRows = new Map<string, ChangedRow>();

    setLocalRows((prevRows) => {
      const newRows = [...prevRows];

      const processChange = async (change: CellChange) => {
        const rowIndex = newRows.findIndex(
          (row) => row.rowId.toString() === change.rowId.toString(),
        );
        if (rowIndex === -1) return;

        const currentRow = { ...newRows[rowIndex] };
        const colIndex = columns.findIndex(
          (col) => col.columnId.toString() === change.columnId.toString(),
        );
        if (colIndex === -1) return;

        try {
          const cell_id = await getCellId({
            workbookid: workbook.id,
            sheetid,
            rowid: change.rowId,
            colid: change.columnId,
          });

          const originalCell = currentRow.cells[colIndex];
          const newCell = {
            ...originalCell,
            value: (change.newCell as any).value,
            text: (change.newCell as any).value?.toString() || '',
            style: getCellStyle({
              ...originalCell,
              value: (change.newCell as any).value,
            } as SheetCell),
          };

          const updatedCells = [...currentRow.cells];
          updatedCells[colIndex] = newCell;
          currentRow.cells = updatedCells;
          newRows[rowIndex] = currentRow;

          const changedCell: ChangedCell = {
            sheetid,
            cellid: cell_id,
            prevvalue: originalCell.text,
            newvalue: newCell.text,
            comment: '',
            cellCode: '',
            rowNr: rowIndex + 1,
            colNr: colIndex + 1,
          };

          newChanges.push(changedCell);

          if (updatedRows.has(currentRow.rowId)) {
            const existing = updatedRows.get(currentRow.rowId)!;
            existing.changedCells.push(changedCell);
            existing.updatedRow = currentRow;
          } else {
            updatedRows.set(currentRow.rowId, {
              rowId: currentRow.rowId,
              originalRow: newRows[rowIndex],
              updatedRow: currentRow,
              changedCells: [changedCell],
              timestamp: Date.now(),
            });
          }
        } catch (error) {
          console.error('Error processing cell change:', error);
        }
      };

      Promise.all(changes.map(processChange)).then(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newRows));
        const changedRowsArray = Array.from(updatedRows.values());

        setChangedRows((prev) => [...prev, ...changedRowsArray]);
        setCellChanges((prev) => [...prev, ...newChanges]);
        dispatch(addChangedRows(changedRowsArray));

        if (onRowChange) {
          onRowChange(changedRowsArray);
        }
      });

      return newRows;
    });
  };

  const handleFocusChange = async (cell: CellLocation) => {
    const newLocation = {
      workbookid: workbook.id,
      sheetid: Number(selectedSheet.sheetId),
      rowid: cell.rowId,
      colid: cell.columnId,
    };
    setCurLocation(newLocation);
  };

  const handleUndo = () => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch(clearSheetData());
    onClose();
  };

  const isGridDataValid = useCallback(() => {
    if (!columns?.length || !localRows?.length) return false;

    // With normalization, all rows should have exactly the same number of cells as columns
    return localRows.every((row) => row.cells.length === columns.length);
  }, [columns, localRows]);
  useEffect(() => {
    if (!sheetData) return;

    const processData = () => {
      const expectedColumns = (sheetData.columns || []).length;
      const allRows = [
        ...(sheetData.headerRows || []),
        ...(sheetData.valueRows || []),
      ];

      // Use normalizeRow for each row
      const processedRows = allRows.map((row) =>
        normalizeRow(row, expectedColumns),
      );
      setLocalRows(processedRows);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(processedRows));
    };

    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        const expectedColumns = (sheetData.columns || []).length;
        // Normalize stored data as well
        setLocalRows(
          parsedData.map((row) => normalizeRow(row, expectedColumns)),
        );
      } catch (error) {
        console.error('Error parsing stored data:', error);
        processData();
      }
    } else {
      processData();
    }

    return () => {
      localStorage.removeItem(STORAGE_KEY);
    };
  }, [sheetData, normalizeRow]);

  const onSselectedOptionChange = (event: { value: { name: string } }) => {
    setSelectedOption(event.value);
  };

  const _grabCellValue = async () => {
    console.log('_grabCellValue called:', curLocation, selectedOption);
    if (!curLocation || !selectedOption) return;

    const sheetid = Number(selectedSheet.sheetId);

    try {
      const cell_id = await getCellId({
        workbookid: workbook.id,
        sheetid,
        rowid: curLocation.rowid,
        colid: curLocation.colid,
      });

      // Find current row and cell indices
      const rowIndex = localRows.findIndex(
        (row) => row.rowId.toString() === curLocation.rowid.toString(),
      );
      const colIndex = columns.findIndex(
        (col) => col.columnId.toString() === curLocation.colid.toString(),
      );

      if (rowIndex === -1 || colIndex === -1) {
        console.error('Invalid row or column index');
        return;
      }

      // Create new cell and row data
      const currentRow = { ...localRows[rowIndex] };
      const originalCell = currentRow.cells[colIndex];

      // Create new cell with updated value
      const newCell = {
        ...originalCell,
        value: Number(selectedOption.name),
        text: selectedOption.name,
        style: {
          ...originalCell.style,
          // Remove conflicting border styles
          borderRight: undefined,
          borderRightColor: '#e2e8f0',
          borderRightWidth: '1px',
          borderRightStyle: 'solid',
        },
      };

      // Update cells array
      const updatedCells = [...currentRow.cells];
      updatedCells[colIndex] = newCell;

      // Create updated row
      const updatedRow = {
        ...currentRow,
        cells: updatedCells,
      };

      // Create changed cell record
      const changedCell: ChangedCell = {
        sheetid,
        cellid: cell_id,
        prevvalue: originalCell.text,
        newvalue: selectedOption.name,
        comment: '',
        cellCode: '',
        rowNr: rowIndex + 1,
        colNr: colIndex + 1,
      };

      // Create changed row record
      const changedRowRecord: ChangedRow = {
        rowId: currentRow.rowId,
        originalRow: localRows[rowIndex] as SheetRow,
        updatedRow: updatedRow as SheetRow,
        changedCells: [changedCell],
        timestamp: Date.now(),
      };

      // Update all states
      const newRows = [...localRows];
      newRows[rowIndex] = updatedRow;

      // Update state in order
      setLocalRows(newRows);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRows));
      dispatch(addChangedRows([changedRowRecord]));
      setCellChanges((prev) => [...prev, changedCell]);
      setChangedRows((prev) => [...prev, changedRowRecord]);

      if (onRowChange) {
        onRowChange([changedRowRecord]);
      }

      // Close dialog and reset selection
      // setShowCellInfo(false);
      // setSelectedOption(null);
    } catch (error) {
      console.error('Error in _grabCellValue:', error);
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-end">
      <div className="bg-white rounded-lg shadow-lg w-[80%] h-full">
        <div className="flex justify-between items-center p-4 border-b">
          <button
            onClick={handleUndo}
            className="text-gray-600 hover:text-gray-800"
          >
            <Undo2 size={24} />
          </button>
          <h2 className="text-xl font-bold">{workbook.name}</h2>
          <button
            onClick={onShowSlider}
            className="text-gray-600 hover:text-gray-800"
          >
            <LayoutGrid size={24} />
          </button>
        </div>

        <div className="p-4">
          <p>
            <strong>Table:</strong> {selectedSheet.table}
          </p>
          <p>
            <strong>Sheet:</strong> {selectedSheet.label}
          </p>
        </div>

        {localRows.length > 0 ? (
          isGridDataValid() ? (
            <>
              <div className="p-4" style={{ height: '80%', overflowY: 'auto' }}>
                <ReactGrid
                  ref={gridRef}
                  rows={localRows}
                  columns={columns}
                  onCellsChanged={handleChanges}
                  onContextMenu={handleContextMenu}
                  onFocusLocationChanged={handleFocusChange}
                  enableFillHandle
                  enableRangeSelection
                  stickyLeftColumns={2}
                  stickyTopRows={sheetData?.headerRows?.length || 0}
                  customCellTemplates={{
                    header: new HeaderCellTemplate(),
                    shaded: new ShadedCellTemplate(),
                    empty: new EmptyCellTemplate(),
                    formula: new FormulaCellTemplate(),
                    invalidtext: new InvalidTextCellTemplate(),
                    invalidnumber: new InvalidNumberCellTemplate(),
                  }}
                />
              </div>{' '}
              <div className="fixed bottom-0 left-84 p-4 max-w-sm">
                {sheetData?.hasOpenRows && (
                  <div className="flex items-center gap-4 px-4 mb-4">
                    <button
                      onClick={handleAddRows}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 rounded-full p-2 hover:bg-blue-50"
                      title="Add rows"
                    >
                      <Plus size={22} />
                    </button>
                    <select
                      value={nrOfInserts.code}
                      onChange={(e) =>
                        setNrOfInserts({
                          name: e.target.value,
                          code: parseInt(e.target.value),
                        })
                      }
                      className="rounded-md border border-gray-300 px-3 py-2"
                    >
                      {insertOptions.map((option) => (
                        <option key={option.code} value={option.code}>
                          Add {option.name} row{option.code > 1 ? 's' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-4">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline">
                  {' '}
                  Unable to display grid due to data validation errors.
                </span>
              </div>
            </div>
          )
        ) : null}
      </div>

      <Dialog open={showCellInfo} onClose={() => setShowCellInfo(false)}>
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel
              className={`transform overflow-hidden rounded-lg bg-white shadow-xl transition-all duration-200 ${
                isFullScreen
                  ? 'fixed inset-0 m-0 rounded-none'
                  : 'w-full max-w-4xl'
              }`}
            >
              <div className="absolute right-4 top-4 flex items-center space-x-2">
                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  {isFullScreen ? <Minimize size={20} /> : <Expand size={20} />}
                </button>
                <button
                  onClick={() => setShowCellInfo(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div
                className={`${
                  isFullScreen
                    ? 'p-8 h-[calc(100vh-60px)] overflow-y-auto'
                    : 'p-6'
                }`}
              >
                {cellInfo && (
                  <div className="space-y-4">
                    <div>
                      <div className="border-b border-gray-200 pb-2 mb-4 flex justify-center">
                        <span className="p-tag">General Information</span>
                      </div>
                      <div className="space-y-2">
                        <p className="m-0">
                          Current location:
                          {curLocation && (
                            <>
                              Row {curLocation.rowid} - Col {curLocation.colid}
                            </>
                          )}
                        </p>
                        <p className="m-0">CellId: {cellInfo.cellId}</p>
                        <p className="m-0">
                          Datapoint VID: {cellInfo.datapointVID}
                        </p>
                        <p className="m-0">Datatype: {cellInfo.dataType}</p>
                        <p className="m-0">
                          Is key ?: {cellInfo.isKey ? 'Yes' : 'No'} (
                          {cellInfo.keyType})
                        </p>
                      </div>
                    </div>

                    {cellInfo.members?.length > 0 && (
                      <div>
                        <div className="border-b border-gray-200 pb-2 mb-4 flex justify-center">
                          <span className="p-tag">Possible values</span>
                        </div>
                        <button
                          onClick={_grabCellValue}
                          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-2"
                        >
                          Copy value into cell
                        </button>
                        <select
                          value={selectedOption?.name}
                          onChange={(e) =>
                            onSselectedOptionChange({
                              value: { name: e.target.value },
                            })
                          }
                          className="w-full border border-gray-300 rounded-md p-2"
                        >
                          {cellInfo.members.map((member: any) => (
                            <option key={member.name} value={member.name}>
                              {member.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <div className="border-b border-gray-200 pb-2 mb-4 flex justify-center">
                        <span className="p-tag">Metric/Dimensions</span>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="font-medium mb-2">Metric</div>
                          <div className="font-bold">
                            {cellInfo.metric?.origMeasureField}
                          </div>
                        </div>

                        <div>
                          <div className="font-medium mb-2">Sheet ordinate</div>
                          {cellInfo.sheetDimensions?.map((dimension: any) => (
                            <div key={dimension.memberId} className="mb-1">
                              <span className="font-bold">
                                {dimension.origLeftOperand}
                              </span>
                              &nbsp;{dimension.origOperand}&nbsp;
                              {dimension.origRightOperand}
                            </div>
                          ))}
                        </div>

                        <div>
                          <div className="font-medium mb-2">
                            Column ordinate
                          </div>
                          {cellInfo.columnDimensions?.map((dimension: any) => (
                            <div key={dimension.memberId} className="mb-1">
                              <span className="font-bold">
                                {dimension.origLeftOperand}
                              </span>
                              &nbsp;{dimension.origOperand}&nbsp;
                              {dimension.origRightOperand}
                            </div>
                          ))}
                        </div>

                        <div>
                          <div className="font-medium mb-2">Row ordinate</div>
                          {cellInfo.rowDimensions?.map((dimension: any) => (
                            <div key={dimension.memberId} className="mb-1">
                              <span className="font-bold">
                                {dimension.origLeftOperand}
                              </span>
                              &nbsp;{dimension.origOperand}&nbsp;
                              {dimension.origRightOperand}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="border-b border-gray-200 pb-2 mb-4 flex justify-center">
                        <span className="p-tag">Validation rules</span>
                      </div>
                      {cellInfo.validationRules?.length > 0 ? (
                        <div className="space-y-6">
                          {cellInfo.validationRules.map((rule: any) => (
                            <div key={rule.validationId}>
                              <div className="border-b border-gray-200 pb-2 mb-2">
                                <div className="font-bold">
                                  Rule Id: {rule.validationId} - Rule Code:{' '}
                                  {rule.validationCode}
                                </div>
                              </div>
                              <div className="space-y-2 pl-4">
                                <div>Explanation: {rule.explanation}</div>
                                <div>Expression: {rule.logicalExpression}</div>
                                <div>Formula: {rule.tableFormula}</div>
                                <div className="font-medium">Status: </div>
                                <div
                                  className={
                                    rule.isInvalid ? 'invalidrule' : 'validrule'
                                  }
                                >
                                  {rule.isInvalid
                                    ? 'Invalid'
                                    : 'Valid / Not executed'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div>No validation rules for this cell</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>

      <Dialog open={showCellHistory} onClose={() => setShowCellHistory(false)}>
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-lg bg-white p-6 shadow-xl">
              <div className="p-4">
                <h2 className="text-xl font-bold mb-4">{cellHistoryHeader}</h2>
                {cellHistory && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          {historyColumns.map((column) => (
                            <th
                              key={column.field}
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {column.header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {cellHistory.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {historyColumns.map((column) => (
                              <td
                                key={column.field}
                                className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                              >
                                {row[column.field]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
      <Dialog open={showCellAudit} onClose={() => setShowCellAudit(false)}>
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-white p-6 shadow-xl">
              <div className="p-4">
                <h2 className="text-xl font-bold mb-4">{cellAuditHeader}</h2>
                {cellAudit && <div>{/* Add audit information display */}</div>}
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
      {showSlider && (
        <WorkbookSlider
          workbook={workbook}
          onClose={() => setShowSlider(false)}
          changedRows={cellChanges}
        />
      )}
    </div>
  );
};

export default WorkbookPopup;
