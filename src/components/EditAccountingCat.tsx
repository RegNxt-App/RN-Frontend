import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

interface AccountingCategory {
  id: string;
  name: string;
  description: string;
}

interface EditRecordPopupProps {
  onClose: () => void;
  record: AccountingCategory;
}

const EditAccountingCat = ({ onClose, record }: EditRecordPopupProps) => {
  const [name, setName] = useState(record.name);
  const [description, setDescription] = useState(record.description);

  const handleSave = () => {
    fetch(`/api/update/${record.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, description }),
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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 	">
      <div className="border border-stroke bg-white shadow-default p-6 w-full max-w-md rounded-md">
        <h3 className="text-2xl font-extrabold text-black mb-4">
          Edit Accounting Category
        </h3>
        <div className="mb-4">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            // className="w-full rounded-md border border-gray-300 p-2"
          />
        </div>
        <div className="mb-4">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose} className="bg-gray-300 hover:bg-gray-300">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-purple text-white hover:bg-indigo-800"
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditAccountingCat;
