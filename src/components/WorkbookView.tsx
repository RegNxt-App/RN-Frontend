import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  LayoutGrid,
  Undo2,
  Database,
  Save,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import LayersTable from './Tables/workbooks/layers/LayersData';
import ActionsAllocate from './Tables/workbooks/actions/ActionsAllocate';
import ActionsImport from './Tables/workbooks/actions/ActionsImport';
import ActionsValidate from './Tables/workbooks/actions/ActionsValidate';
import ActionsExport from './Tables/workbooks/actions/ActionsExport';
import ActionsTransmission from './Tables/workbooks/actions/ActionsTransmission';
import SaveTable from './Tables/workbooks/actions/SaveTable';
import Api from '../utils/Api';
import WorkbookPopup from './Workbooks/WorkbookPopup';
import WorkbookSlider from './Workbooks/WorkbookSlider';
interface StructureTabProps {
  workbookId: number;
}

interface ApiResponse {
  key: string;
  label: string;
  data: string;
  children?: ApiResponse[];
}

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

// WorkbookView Component
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
            // setShowPopup(false);
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

export default WorkbookView;
