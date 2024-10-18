import React, { useState } from 'react';
import { LayoutGrid, Undo2 } from 'lucide-react';
import { ReactGrid, Column, Row, CellChange, Id } from '@silevis/reactgrid';
import '@silevis/reactgrid/styles.css';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { RootState } from '../../app/store';
import WorkbookSlider from './WorkbookSlider';
import {
  clearSheetData,
  updateSelectedCell,
} from '../../features/sheetData/sheetDataSlice';

interface WorkbookData {
  id: number;
  name: string;
  module: string;
  entity: string;
  reportingDate: string;
  status: string;
}

interface SheetColumn {
  columnId: number | string;
  width: number;
}

interface SheetCell {
  type: 'header' | 'number' | 'empty';
  text: string;
  value?: number | null;
}

interface SheetRow {
  rowId: string | number;
  cells: SheetCell[];
}

const decodeHtmlEntities = (text: string): string => {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
};

const WorkbookPopup: React.FC<{
  workbook: WorkbookData;
  onClose: () => void;
  onShowSlider: () => void;
}> = ({ workbook, onClose, onShowSlider }) => {
  const [showSlider, setShowSlider] = useState(false);
  const dispatch = useAppDispatch();

  const sheetData = useAppSelector((state: RootState) => state.sheetData.data);
  const loading = useAppSelector((state: RootState) => state.sheetData.loading);
  const error = useAppSelector((state: RootState) => state.sheetData.error);

  const selectedSheet = useAppSelector(
    (state: RootState) => state.sheetData.selectedSheet,
  );

  const columns: Column[] = sheetData?.columns
    ? sheetData.columns.map((col: SheetColumn) => ({
        columnId: col.columnId.toString(),
        width: col.width,
      }))
    : [];

  const mapCellType = (type: string) => {
    switch (type) {
      case 'header':
      case 'empty':
        return 'text';
      case 'number':
        return 'number';
      default:
        return 'text';
    }
  };

  const mapCell = (cell: SheetCell) => ({
    type: mapCellType(cell.type),
    text: decodeHtmlEntities(cell.text),
    value: cell.type === 'number' ? cell.value : undefined,
  });

  const headerRows: Row[] = sheetData?.headerRows
    ? sheetData.headerRows.map((row: SheetRow) => ({
        rowId: row.rowId.toString(),
        cells: row.cells.map(mapCell),
      }))
    : [];

  const valueRows: Row[] = sheetData?.valueRows
    ? sheetData.valueRows.map((row: SheetRow) => ({
        rowId: row.rowId.toString(),
        cells: row.cells.map(mapCell),
      }))
    : [];

  const rows = [...headerRows, ...valueRows];

  const handleChanges = (changes: CellChange[]) => {
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
  };

  const handleUndo = () => {
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
          {/* <p>
            <strong>Table:</strong>
          </p> */}

          <p>
            <strong>Table:</strong> {selectedSheet.table}
          </p>

          <p>
            <strong>Sheet:</strong> {selectedSheet.label}
          </p>

          {/* <p>
            <strong>Sheet:</strong>
          </p> */}
        </div>
        {sheetData &&
        sheetData.columns &&
        sheetData.headerRows &&
        sheetData.valueRows ? (
          <div className="p-4" style={{ height: '80%', overflowY: 'auto' }}>
            <ReactGrid
              columns={columns}
              rows={rows}
              onCellsChanged={handleChanges}
              enableFillHandle
              enableRangeSelection
            />
          </div>
        ) : (
          <p>No data available</p>
        )}
      </div>
      {showSlider && (
        <WorkbookSlider
          workbook={workbook}
          onClose={() => setShowSlider(false)}
        />
      )}
    </div>
  );
};

export default WorkbookPopup;
