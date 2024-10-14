import React, { useState } from 'react';
import { ChevronLeft, LayoutGrid, Undo2 } from 'lucide-react';

interface WorkbookData {
  id: number;
  name: string;
  module: string;
  entity: string;
  reportingDate: string;
  status: string;
}

const WorkbookView: React.FC<{ workbook: WorkbookData }> = ({ workbook }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [showSlider, setShowSlider] = useState(false);

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
          <div className="flex bg-gray-100 p-2">
            <button
              className={`px-4 py-2 rounded-md mr-2 ${activeTab === 'structure' ? 'bg-blue-500 text-white' : 'bg-white'}`}
              onClick={() => setActiveTab('structure')}
            >
              Structure
            </button>
            <button
              className={`px-4 py-2 rounded-md mr-2 ${activeTab === 'actions' ? 'bg-blue-500 text-white' : 'bg-white'}`}
              onClick={() => setActiveTab('actions')}
            >
              Actions
            </button>
            <button
              className={`px-4 py-2 rounded-md ${activeTab === 'layers' ? 'bg-blue-500 text-white' : 'bg-white'}`}
              onClick={() => setActiveTab('layers')}
            >
              Layers
            </button>
          </div>
          <div className="flex-grow p-4 overflow-y-auto">
            {activeTab === 'structure' && <StructureTab workbook={workbook} />}
            {activeTab === 'actions' && <ActionsTab />}
            {activeTab === 'layers' && <LayersTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

const StructureTab: React.FC<{ workbook: WorkbookData }> = ({ workbook }) => {
  return (
    <div>
      <p>Structure content goes here</p>
      {/* <h3 className="text-lg font-semibold mb-4">Workbook Details</h3>
      <p>
        <strong>Module:</strong> {workbook.module}
      </p>
      <p>
        <strong>Entity:</strong> {workbook.entity}
      </p>
      <p>
        <strong>Reporting Date:</strong> {workbook.reportingDate}
      </p>
      <p>
        <strong>Status:</strong> {workbook.status}
      </p> */}
    </div>
  );
};

const ActionsTab: React.FC = () => {
  return <div>Actions content goes here</div>;
};

const LayersTab: React.FC = () => {
  return <div>Layers content goes here</div>;
};

export default WorkbookView;
