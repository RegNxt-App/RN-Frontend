import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import LayersTab from './LayersTab';
import ActionsTab from './ActionsTab';
import StructureTab from './StructureTab';

interface WorkbookData {
  id: number;
  name: string;
  module: string;
  entity: string;
  reportingDate: string;
  status: string;
}

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
      <div className="w-4/6 bg-white h-full shadow-lg flex flex-col">
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
            {activeTab === 'structure' && (
              <StructureTab workbookId={workbook.id} />
            )}
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

export default WorkbookSlider;
