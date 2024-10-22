import React, { useMemo } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectChangedRows } from '../../features/sheetData/sheetDataSlice';
import SaveTable from '../Tables/workbooks/actions/SaveTable';
import ActionsAllocate from '../Tables/workbooks/actions/ActionsAllocate';
import ActionsExport from '../Tables/workbooks/actions/ActionsExport';
import ActionsValidate from '../Tables/workbooks/actions/ActionsValidate';
import ActionsImport from '../Tables/workbooks/actions/ActionsImport';
import ActionsTransmission from '../Tables/workbooks/actions/ActionsTransmission';

interface SaveTableData {
  cellId: number;
  cellCode: string;
  sheetId: number;
  rowNr: number;
  colNr: number;
  previousValue: string;
  newValue: string;
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
}> = ({ activeActionTab, setActiveActionTab }) => {
  // Get changed rows from Redux store
  const changedRows = useAppSelector(selectChangedRows);

  // Transform changed rows into SaveTableData format
  const saveData: SaveTableData[] = useMemo(() => {
    const transformedData: SaveTableData[] = [];

    changedRows.forEach((row) => {
      row.changedCells.forEach((cell) => {
        transformedData.push({
          cellId: cell.cellid || 0,
          cellCode: cell.cellCode || `R${cell.rowNr}C${cell.colNr}`,
          sheetId: cell.sheetid,
          rowNr: cell.rowNr,
          colNr: cell.colNr,
          previousValue: cell.prevvalue,
          newValue: cell.newvalue,
          comment: cell.comment || '',
        });
      });
    });

    return transformedData;
  }, [changedRows]);

  // Debug log
  console.log('Changed Rows from Redux:', changedRows);
  console.log('Transformed Save Data:', saveData);

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
            <p className="mb-4 text-sm text-gray-600">
              {saveData.length} changes pending
            </p>
            <SaveTable data={saveData} />
          </div>
        )}
        {activeActionTab === 'allocate' && <ActionsAllocate />}
        {activeActionTab === 'validate' && <ActionsValidate />}
        {activeActionTab === 'import' && <ActionsImport />}
        {activeActionTab === 'export' && <ActionsExport />}
        {activeActionTab === 'transmission' && <ActionsTransmission />}
      </div>
    </div>
  );
};

export default ActionsTab;
