import { useState } from 'react';

interface LedgerData {
  ledgerCode: string;
  accountCode: string;
  description: string;
}

interface EditRecordPopupProps {
  onClose: () => void;
  record: LedgerData;
}

const EditAccountCode = ({ onClose, record }: EditRecordPopupProps) => {
  const [ledgerCode, setLedgerCode] = useState(record.ledgerCode);
  const [accountCode, setAccountCode] = useState(record.accountCode);
  const [description, setDescription] = useState(record.description);

  const handleSave = () => {
    fetch(`/api/update/${record.ledgerCode}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ledgerCode, accountCode, description }),
    })
      .then((response) => response.json())
      .then(() => {
        onClose();
      })
      .catch(() => {
        console.error('Error updating record');
      });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="border border-stroke bg-white shadow-default p-6 w-full max-w-md rounded-md">
        <h3 className="text-2xl font-extrabold text-black mb-4">
          Edit Account Code
        </h3>
        <div className="mb-4">
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="ledgerCode"
          >
            Ledger Code
          </label>
          <input
            type="text"
            id="ledgerCode"
            value={ledgerCode}
            onChange={(e) => setLedgerCode(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="accountCode"
          >
            Account Code
          </label>
          <input
            type="text"
            id="accountCode"
            value={accountCode}
            onChange={(e) => setAccountCode(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="description"
          >
            Description
          </label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="mr-2 px-4 py-2 bg-gray-300 rounded-md"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAccountCode;