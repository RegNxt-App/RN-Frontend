import { useState } from 'react';

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
    // Make API call to save the updated record
    fetch(`/api/update/${record.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, description }),
    })
      .then((response) => response.json())
      .then(() => {
        // Handle success (e.g., close popup and refresh the list)
        onClose();
      })
      .catch(() => {
        // Handle error
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
          <label className="block text-sm font-medium mb-1" htmlFor="name">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditAccountingCat;
