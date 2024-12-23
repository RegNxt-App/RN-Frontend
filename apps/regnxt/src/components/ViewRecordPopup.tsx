interface WorkbookData {
  id: number;
  name: string;
  template: string;
  templateId: number;
  reportSubsetId: number;
  module: string;
  entity: string;
  reportingCurrency: string;
  reportingDate: number;
  status: string;
}
interface ViewRecordPopupProps {
  onClose: () => void;
  record: WorkbookData;
}

const ViewRecordPopup = ({onClose, record}: ViewRecordPopupProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="rounded-sm border border-stroke bg-white shadow-default p-6 w-full max-w-md">
        <div className="border-b border-stroke py-4 px-6.5">
          <h3 className="text-2xl font-extrabold text-black">View Workbook</h3>
        </div>
        <div className="p-6.5">
          <p className="text-lg mb-4">
            <strong>Module:</strong> {record.module}
          </p>
          <p className="text-lg mb-4">
            <strong>Entity:</strong> {record.entity}
          </p>
          <p className="text-lg mb-4">
            <strong>Reporting Date:</strong> {record.reportingDate}
          </p>
          <p className="text-lg mb-4">
            <strong>Name:</strong> {record.name}
          </p>
          <p className="text-lg mb-4">
            <strong>Status:</strong> {record.status}
          </p>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray-300 rounded-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewRecordPopup;
