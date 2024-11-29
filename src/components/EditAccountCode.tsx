import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';

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
          <Input
            id="ledgerCode"
            value={ledgerCode}
            onChange={(e) => setLedgerCode(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="accountCode"
          >
            Account Code
          </label>
          <Input
            type="text"
            id="accountCode"
            value={accountCode}
            onChange={(e) => setAccountCode(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="description"
          >
            Description
          </label>
          <Input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-300"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-purple text-white bg-indigo-800"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditAccountCode;
