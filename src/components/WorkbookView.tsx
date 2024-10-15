import React, { useState } from 'react';
import {
  ChevronLeft,
  LayoutGrid,
  Undo2,
  Database,
  Save,
  AlertTriangle,
} from 'lucide-react';
import LayersTable from './Tables/workbooks/layers/LayersData';
import ActionsAllocate from './Tables/workbooks/actions/ActionsAllocate';
import ActionsImport from './Tables/workbooks/actions/ActionsImport';
import ActionsValidate from './Tables/workbooks/actions/ActionsValidate';
import ActionsExport from './Tables/workbooks/actions/ActionsExport';
import ActionsTransmission from './Tables/workbooks/actions/ActionsTransmission';
import SaveTable from './Tables/workbooks/actions/SaveTable';

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
interface LayersTableData {
  versionId: number;
  from: string;
  to: string;
  reason: string;
  modifier: string;
}
interface WorkbookData {
  id: number;
  name: string;
  module: string;
  entity: string;
  reportingDate: string;
  status: string;
}
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
const layersData: LayersTableData[] = [
  {
    versionId: 123,
    from: '123',
    to: '123',
    reason: 'Test',
    modifier: 'Test',
  },
];

const WorkbookView: React.FC<{ workbook: WorkbookData }> = ({ workbook }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [showSlider, setShowSlider] = useState(false);
  // const [saveData, setSaveData] = useState<WorkbookData[]>([]);

  return (
    <>
      <button
        onClick={() => setShowPopup(true)}
        className="text-blue-600 hover:text-blue-800"
      >
        View
      </button>
      {showPopup && (
        <WorkbookPopup
          workbook={workbook}
          onClose={() => setShowPopup(false)}
          onShowSlider={() => {
            setShowPopup(false);
            setShowSlider(true);
          }}
        />
      )}
      {showSlider && (
        <WorkbookSlider
          workbook={workbook}
          onClose={() => setShowSlider(false)}
        />
      )}
    </>
  );
};

const WorkbookPopup: React.FC<{
  workbook: WorkbookData;
  onClose: () => void;
  onShowSlider: () => void;
}> = ({ workbook, onClose, onShowSlider }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-1/2 max-w-2xl">
        <div className="flex justify-between items-center p-4 border-b">
          <button
            onClick={onClose}
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
            <strong>Table:</strong>
          </p>
          <p>
            <strong>Sheet:</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

const WorkbookSlider: React.FC<{
  workbook: WorkbookData;
  onClose: () => void;
}> = ({ workbook, onClose }) => {
  const [activeTab, setActiveTab] = useState<
    'structure' | 'actions' | 'layers'
  >('structure');
  const [activeActionTab, setActiveActionTab] = useState<
    'save' | 'allocate' | 'validate' | 'import' | 'export' | 'transmission'
  >('save');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex justify-end">
      <div className="w-4/5 bg-white h-full shadow-lg flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-xl font-bold">{workbook.name}</h2>
          <div className="w-6"></div>
        </div>
        <div className="flex flex-col flex-grow">
          <div className="flex p-2">
            {['structure', 'actions', 'layers'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 mr-2 border-b-2 ${
                  activeTab === tab ? 'border-blue-500' : 'border-transparent'
                }`}
                onClick={() =>
                  setActiveTab(tab as 'structure' | 'actions' | 'layers')
                }
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex-grow p-4 overflow-y-auto">
            {activeTab === 'structure' && <StructureTab />}
            {activeTab === 'actions' && (
              <ActionsTab
                activeActionTab={activeActionTab}
                setActiveActionTab={setActiveActionTab}
              />
            )}
            {activeTab === 'layers' && <LayersTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

const StructureTab: React.FC = () => {
  return (
    <div>
      <div className="flex mb-4">
        <Database className="mr-2 text-blue-500 cursor-pointer" size={32} />
        <Save className="mr-2 text-orange-500 cursor-pointer" size={32} />
        <AlertTriangle className="mr-2 text-red-500 cursor-pointer" size={32} />
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="filter..."
          className="w-full p-2 border rounded"
        />
      </div>
      <div>No available options</div>
    </div>
  );
};

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
  const actionTabs = [
    'save',
    'allocate',
    'validate',
    'import',
    'export',
    'transmission',
  ];

  return (
    <div>
      <div className="flex mb-4">
        {actionTabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 mr-2 border-b-2 ${
              activeActionTab === tab ? 'border-blue-500' : 'border-transparent'
            }`}
            onClick={() =>
              setActiveActionTab(
                tab as
                  | 'save'
                  | 'allocate'
                  | 'validate'
                  | 'import'
                  | 'export'
                  | 'transmission',
              )
            }
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeActionTab === 'save' && <SaveTable data={saveData} />}
      {activeActionTab === 'allocate' && <ActionsAllocate />}
      {activeActionTab === 'import' && <ActionsImport />}
      {activeActionTab === 'validate' && <ActionsValidate />}
      {activeActionTab === 'export' && <ActionsExport />}
      {activeActionTab === 'transmission' && <ActionsTransmission />}

      {/* Add content for other action tabs as needed */}
    </div>
  );
};

const LayersTab: React.FC = () => {
  return <LayersTable data={layersData} />;
};

export default WorkbookView;
