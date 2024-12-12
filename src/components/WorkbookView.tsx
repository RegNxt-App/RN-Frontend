import React, { useState } from 'react';

import WorkbookPopup from './Workbooks/WorkbookPopup';
import WorkbookSlider from './Workbooks/WorkbookSlider';

interface WorkbookData {
  id: number;
  name: string;
  module: string;
  entity: string;
  reportingDate: string;
  status: string;
}

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
