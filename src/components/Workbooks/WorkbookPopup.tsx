//Current Component
import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { LayoutGrid, Undo2 } from 'lucide-react';
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
      if (cellType === 'header') return '#e5e7eb'; // Gray background for headers
      if (cellType === 'shaded') return '#f3f4f6'; // Light gray for shaded cells
      return isAlternateRow(rownr) ? '#f8fafc' : '#fff'; // Alternate row colors
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
            if (cell && cell.type === 'number' && !cell.nonEditable) {
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
    return !localRows.some((row) => row.cells.length !== columns.length);
  }, [columns, localRows]);

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
            </div>
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
            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-white p-6 shadow-xl">
              <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Cell Information</h2>
                {cellInfo && (
                  <div>
                    <p>Cell ID: {cellInfo.cellId}</p>
                    <p>Datapoint VID: {cellInfo.datapointVID}</p>
                    <p>Data Type: {cellInfo.dataType}</p>
                    {/* Add more cell info display as needed */}
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