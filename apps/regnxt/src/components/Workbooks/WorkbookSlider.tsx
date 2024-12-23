import {useEffect, useRef, useState} from 'react';
import {useSelector} from 'react-redux';

import {ChevronLeft} from 'lucide-react';

import {selectDialogState} from '../../features/sheetData/sheetDataSlice';
import ActionsTab from './ActionsTab';
import LayersTab from './LayersTab';
import StructureTab from './StructureTab';

interface WorkbookData {
  id: number;
  name: string;
  module: string;
  entity: string;
  reportingDate: string;
  status: string;
}

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

interface WorkbookSliderProps {
  workbook: WorkbookData;
  onClose: () => void;
  changedRows: SheetRow[];
}

const WorkbookSlider: React.FC<WorkbookSliderProps> = ({workbook, onClose, changedRows}) => {
  const [activeTab, setActiveTab] = useState<'structure' | 'actions' | 'layers'>('structure');
  const [activeActionTab, setActiveActionTab] = useState<
    'save' | 'allocate' | 'validate' | 'import' | 'export' | 'transmission'
  >('save');

  const sidebarRef = useRef<HTMLDivElement>(null);
  const dialogState = useSelector(selectDialogState);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if dialog is open
      if (dialogState.isOpen) return;

      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose, dialogState.isOpen]);

  useEffect(() => {
    console.log('Changed Rows in WorkbookSlider:', changedRows);
  }, [changedRows]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex justify-end">
      <div
        ref={sidebarRef}
        className="w-4/6 bg-white h-full shadow-lg flex flex-col"
      >
        <div className="flex justify-between items-center p-4 border-b">
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-xl font-bold">{workbook.name}</h2>
        </div>
        <div className="flex-grow flex flex-col">
          <div className="flex p-2">
            {['structure', 'actions', 'layers'].map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 mr-2 border-b-2 ${
                  activeTab === tab ? 'border-purple-500	' : 'border-transparent'
                }`}
                onClick={() => setActiveTab(tab as 'structure' | 'actions' | 'layers')}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex-grow p-4 overflow-y-auto">
            {activeTab === 'structure' && <StructureTab workbookId={workbook.id} />}
            {activeTab === 'actions' && (
              <ActionsTab
                activeActionTab={activeActionTab}
                setActiveActionTab={setActiveActionTab}
                workbookId={workbook.id}
              />
            )}
            {activeTab === 'layers' && <LayersTab workbookId={workbook.id} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkbookSlider;
