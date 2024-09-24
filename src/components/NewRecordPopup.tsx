import React, { useState } from 'react';
import { Package } from '../types/package';

interface NewRecordPopupProps {
  onClose: () => void;
}

const NewRecordPopup: React.FC<NewRecordPopupProps> = ({ onClose }) => {
  const [formData, setFormData] = useState<Partial<Package>>({
    module: '',
    entity: '',
    name: '',
    invoiceDate: '',
    status: 'Pending',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="rounded-sm border border-stroke bg-white shadow-default p-6 w-full max-w-md">
        <div className="border-b border-stroke py-4 px-6.5">
          <h3 className="text-2xl font-extrabold text-black">Add New Record</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6.5">
            <input
              type="text"
              name=""
              placeholder="Module Name"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary mb-4" // Added margin-bottom here
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name=""
              placeholder="Entity Name"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary mb-4" // Added margin-bottom here
              onChange={handleInputChange}
              required
            />
            <input
              type="date"
              name="Date"
              placeholder="Reporting Date"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary mb-4" // Added margin-bottom here
              onChange={handleInputChange}
              required
            />

            <div className="mb-4">
              <select
                name="status"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
                onChange={handleInputChange}
                value={formData.status}
              >
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
                <option value="Pending">Pending</option>
              </select>
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
                type="submit"
                className="flex justify-center rounded bg-primary p-3 font-medium text-white"
              >
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRecordPopup;
