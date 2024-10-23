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
interface WorkbookData {
  id: number;
  name: string;
  module: string;
  entity: string;
  reportingDate: string;
  status: string;
}

interface SheetColumn {
  columnId: string;
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
  type: 'header' | 'number' | 'empty' | 'text';
  value: number | null;
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

  const [localRows, setLocalRows] = useState<SheetRow[]>([]);
  const [cellChanges, setCellChanges] = useState<ChangedCell[]>([]);
  const [changedRows, setChangedRows] = useState<ChangedRow[]>([]);
  const columns: Column[] = useMemo(
    () =>
      sheetData?.columns
        ? sheetData.columns.map((col: SheetColumn) => ({
            columnId: col.columnId.toString(),
            width: col.width,
          }))
        : [],
    [sheetData],
  );

  useEffect(() => {
    if (sheetData) {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        setLocalRows(JSON.parse(storedData));
      } else {
        const allRows = [
          ...(sheetData.headerRows || []),
          ...(sheetData.valueRows || []),
        ];
        const mappedRows = allRows.map((row) => ({
          rowId: row.rowId.toString(),
          cells: row.cells.map(mapCell),
        }));
        setLocalRows(mappedRows);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mappedRows));
      }
    }
    return () => {
      localStorage.removeItem(STORAGE_KEY);
    };
  }, [sheetData]);

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
      };
    },
    [isValueCell],
  );

  const mapCell = useCallback(
    (cell: SheetCell): Cell => ({
      type: cell.type === 'number' ? 'number' : 'text',
      text: decodeHtmlEntities(cell.text),
      value: cell.value,
      nonEditable: cell.nonEditable,
      style: getCellStyle(cell),
    }),
    [getCellStyle],
  );

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

  const getCell = useCallback(
    async (location: {
      rowid: Id;
      colid: Id;
      sheetid: Id;
      workbookid: Id;
    }): Promise<(SheetCell & { cellid?: number }) | null> => {
      console.log('Location in getCell:', location);

      try {
        const cell_id = await getCellId({
          workbookid: location.workbookid,
          sheetid: location.sheetid,
          rowid: location.rowid,
          colid: location.colid,
        });

        console.log('Cell ID is:', cell_id);

        const row = localRows.find(
          (row) => row.rowId.toString() === location.rowid.toString(),
        );
        console.log('Row found in getCell:', row);

        if (row) {
          const colidx = columns.findIndex(
            (col) => col.columnId.toString() === location.colid.toString(),
          );
          console.log('Column index:', colidx);

          if (colidx !== -1) {
            const baseCell = row.cells[colidx];
            if (baseCell) {
              const mappedCell = {
                ...baseCell,
                cellid: cell_id,
                type: baseCell.type === 'number' ? 'number' : 'text',
                text: decodeHtmlEntities(baseCell.text),
                value: baseCell.value,
                nonEditable: baseCell.nonEditable,
                style: getCellStyle(baseCell),
              };

              return mappedCell;
            }
          } else {
            console.warn('Column not found for colid:', location.colid);
          }
        } else {
          console.warn('Row not found for rowid:', location.rowid);
        }
      } catch (error) {
        console.error('Error fetching cell ID:', error);
      }

      return null;
    },
    [localRows, columns],
  );

  const handleChanges = async (changes: CellChange[]) => {
    console.log('Changes received:', changes);

    const newChanges: ChangedCell[] = [];
    const newRowChanges: Map<string, ChangedRow> = new Map();
    const sheetid = Number(selectedSheet.sheetId);

    setLocalRows((prevRows) => {
      const newRows = prevRows.map((row) => ({
        ...row,
        cells: [...row.cells],
      }));

      const processChanges = async () => {
        for (const change of changes) {
          const rowIndex = newRows.findIndex(
            (row) => row.rowId.toString() === change.rowId.toString(),
          );

          if (rowIndex !== -1) {
            const row = { ...newRows[rowIndex] };
            const originalRow = { ...prevRows[rowIndex] };
            const colidx = columns.findIndex(
              (col) => col.columnId.toString() === change.columnId.toString(),
            );

            if (colidx !== -1 && colidx < row.cells.length) {
              const oldCell = { ...row.cells[colidx] };
              const newValue = (change.newCell as any).value;

              try {
                const cell_id = await getCellId({
                  workbookid: workbook.id,
                  sheetid: sheetid,
                  rowid: change.rowId,
                  colid: change.columnId,
                });

                const newCell: SheetCell = {
                  ...oldCell,
                  value: newValue,
                  text: newValue !== null ? newValue.toString() : '',
                  cellid: cell_id,
                };

                const newRowCells = [...row.cells];
                newRowCells[colidx] = newCell;
                row.cells = newRowCells;
                newRows[rowIndex] = row;

                const changedCell: ChangedCell = {
                  sheetid,
                  cellid: cell_id,
                  prevvalue: getCellValue(oldCell),
                  newvalue: getCellValue(newCell),
                  comment: '',
                  cellCode: '',
                  rowNr: getRowNumber(change.rowId),
                  colNr: colidx + 1,
                };

                newChanges.push(changedCell);

                if (newRowChanges.has(row.rowId)) {
                  const existingChange = newRowChanges.get(row.rowId)!;
                  newRowChanges.set(row.rowId, {
                    ...existingChange,
                    changedCells: [...existingChange.changedCells, changedCell],
                    updatedRow: { ...row },
                    timestamp: Date.now(),
                  });
                } else {
                  newRowChanges.set(row.rowId, {
                    rowId: row.rowId,
                    originalRow: { ...originalRow },
                    updatedRow: { ...row },
                    changedCells: [changedCell],
                    timestamp: Date.now(),
                  });
                }
              } catch (error) {
                console.error('Error fetching cell ID:', error);
              }
            }
          }
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(newRows));

        const changedRowsArray = Array.from(newRowChanges.values());

        setTimeout(() => {
          setChangedRows((prev) => {
            const combined = [...prev];
            changedRowsArray.forEach((newRow) => {
              const existingIndex = combined.findIndex(
                (row) => row.rowId === newRow.rowId,
              );
              if (existingIndex !== -1) {
                combined[existingIndex] = {
                  ...combined[existingIndex],
                  updatedRow: newRow.updatedRow,
                  changedCells: [
                    ...combined[existingIndex].changedCells,
                    ...newRow.changedCells,
                  ],
                };
              } else {
                combined.push({ ...newRow });
              }
            });
            return combined;
          });

          setCellChanges((prevCellChanges) => [
            ...prevCellChanges,
            ...newChanges,
          ]);

          dispatch(addChangedRows(changedRowsArray));
          dispatch(updateSheetData(newRows));

          if (onRowChange) {
            onRowChange(changedRowsArray);
          }

          changes.forEach((change) => {
            dispatch(
              updateSelectedCell({
                rowId: change.rowId,
                columnId: change.columnId,
                label: selectedSheet.label,
                table: selectedSheet.table,
              }),
            );
          });

          console.log('Changed Rows:', changedRowsArray);
        }, 0);
      };

      processChanges();

      return newRows;
    });
  };

  const getCellValue = (cell: SheetCell): string => {
    return cell.type === 'text' ? String(cell.text) : String(cell.value);
  };

  const getRowNumber = (rowId: Id): number => {
    const idx = rowId.toString().indexOf('-');
    return idx === -1 ? 1 : parseInt(rowId.substring(idx + 1), 10);
  };

  const handleContextMenu = (
    selectedRowIds: Id[],
    selectedColIds: Id[],
    selectionMode: 'row' | 'column' | 'cell',
    menuOptions: MenuOption[],
    selectedRanges: GridSelection,
  ) => {
    return menuOptions;
  };

  const handleFocusChange = async (cell: CellLocation) => {
    console.log('Cell in Focus:', cell);
    const newLocation = {
      workbookid: workbook.id,
      sheetid: Number(selectedSheet.sheetId),
      rowid: Number(cell.rowId),
      colid: Number(cell.columnId),
    };
    setCurLocation(newLocation);
    try {
      const cellDetails = await getCell(newLocation);
      console.log('Cell Details:', cellDetails);
    } catch (error) {
      console.error('Error getting cell details:', error);
    }
  };

  const handleUndo = () => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch(clearSheetData());
    onClose();
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
            />
          </div>
        ) : (
          <></>
        )}
      </div>
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
