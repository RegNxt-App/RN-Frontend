import SaveTable from '../Tables/workbooks/actions/SaveTable';
import ActionsAllocate from '../Tables/workbooks/actions/ActionsAllocate';
import ActionsExport from '../Tables/workbooks/actions/ActionsExport';
import ActionsValidate from '../Tables/workbooks/actions/ActionsValidate';
import ActionsImport from '../Tables/workbooks/actions/ActionsImport';
import ActionsTransmission from '../Tables/workbooks/actions/ActionsTransmission';

const saveData: SaveTableData[] = [
  {
    cellId: 1,
    cellCode: 'A1',
    sheetId: 101,
    rowNr: 1,
    colNr: 1,
    previousValue: '100',
    newValue: '200',
    comment: 'Updated value for Q1',
  },
];
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
        {activeActionTab === 'save' && <SaveTable data={saveData} />}
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
