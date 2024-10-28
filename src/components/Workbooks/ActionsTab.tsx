import React, { useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectChangedRows } from '../../features/sheetData/sheetDataSlice';
import SaveTable from '../Tables/workbooks/actions/SaveTable';
import ActionsAllocate from '../Tables/workbooks/actions/ActionsAllocate';
import ActionsExport from '../Tables/workbooks/actions/ActionsExport';
import ActionsValidate from '../Tables/workbooks/actions/ActionsValidate';
import ActionsImport from '../Tables/workbooks/actions/ActionsImport';
import ActionsTransmission from '../Tables/workbooks/actions/ActionsTransmission';
import { clearChangedRows } from '../../features/sheetData/sheetDataSlice';

interface SaveTableData {
  cellid: number;
  cellcode: string;
  sheetid: number;
  rowNr: number;
  colNr: number;
  prevvalue: string;
  newvalue: string;
  comment: string;
}

const ActionsTab: React.FC<{
  activeActionTab: string;
  setActiveActionTab: (
    tab:
      | 'save'
      | 'allocate'
      | 'validate'
      | 'import'
      | 'export'
      | 'transmission',
  ) => void;
  workbookId: number;
}> = ({ activeActionTab, setActiveActionTab, workbookId }) => {
  const dispatch = useAppDispatch();
  const changedRows = useAppSelector(selectChangedRows);

  const handleSaveSuccess = () => {
    // Clear the changed rows from Redux store
    dispatch(clearChangedRows());
  };

  const saveData: SaveTableData[] = useMemo(() => {
    // Create a Set to track unique cell IDs
    const processedCells = new Set<number>();
    const transformedData: SaveTableData[] = [];

    changedRows.forEach((row) => {
      row.changedCells.forEach((cell) => {
        // Only add the cell if we haven't processed it yet
        if (!processedCells.has(cell.cellid)) {
          processedCells.add(cell.cellid);
          transformedData.push({
            sheetid: cell.sheetid,
            cellid: cell.cellid || 0,
            prevvalue: cell.prevvalue || 'null',
            newvalue: cell.newvalue || '',
            comment: cell.comment || '',
            cellcode: cell.cellCode || '',
            rowNr: cell.rowNr,
            colNr: cell.colNr,
          });
        }
      });
    });

    // Optional: Sort the data by rowNr and colNr for consistent display
    return transformedData.sort((a, b) => {
      if (a.rowNr === b.rowNr) {
        return a.colNr - b.colNr;
      }
      return a.rowNr - b.rowNr;
    });
  }, [changedRows]);

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('Changed Rows from Redux:', changedRows);
    console.log('Transformed Save Data:', saveData);
  }

  return (
    <div>
      <div className="flex">
        {[
          'save',
          'allocate',
          'validate',
          'import',
          'export',
          'transmission',
        ].map((action) => (
          <button
            key={action}
            className={`px-4 py-2 mr-2 border-b-2 ${
              activeActionTab === action
                ? 'border-blue-500'
                : 'border-transparent'
            }`}
            onClick={() =>
              setActiveActionTab(
                action as
                  | 'save'
                  | 'allocate'
                  | 'validate'
                  | 'import'
                  | 'export'
                  | 'transmission',
              )
            }
          >
            {action.charAt(0).toUpperCase() + action.slice(1)}
          </button>
        ))}
      </div>
      <div className="p-4">
        {activeActionTab === 'save' && (
          <div>
            <SaveTable
              data={saveData}
              workbookId={workbookId}
              onSuccess={handleSaveSuccess}
            />
          </div>
        )}
        {activeActionTab === 'allocate' && <ActionsAllocate />}
        {activeActionTab === 'validate' && (
          <ActionsValidate workbookId={workbookId} />
        )}
        {activeActionTab === 'import' && <ActionsImport />}
        {activeActionTab === 'export' && <ActionsExport />}
        {activeActionTab === 'transmission' && (
          <ActionsTransmission workbookId={workbookId} />
        )}
      </div>
    </div>
  );
};

export default ActionsTab;
