import React, { useState, useEffect } from 'react';
import Api from '../../../utils/Api';

interface UpdateTemplateModelProps {
  existingData: { id: number };
  onClose: () => void;
  onUpdate: () => void;
}

const UpdateTemplateModel = ({
  existingData,
  onClose,
  onUpdate,
}: UpdateTemplateModelProps) => {
  const [formData, setFormData] = useState({
    templateName: '',
    selectedItems: {} as Record<
      string,
      { checked: boolean; partialChecked: boolean }
    >,
  });

  useEffect(() => {
    const fetchTemplateDetails = async () => {
      try {
        const response = await Api.get(`/RI/Template/${existingData.id}`);
        const templateDetails = response.data;

        // Parse the selectedItems JSON string
        const parsedSelectedItems = JSON.parse(templateDetails.selectedItems);

        setFormData({
          templateName: templateDetails.name,
          selectedItems: parsedSelectedItems,
        });
      } catch (error) {
        console.error('Error fetching template details:', error);
      }
    };

    fetchTemplateDetails();
  }, [existingData.id]);

  // Handle input change for template name
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkbox changes for selected items
  const handleCheckboxChange = (key: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedItems: {
        ...prev.selectedItems,
        [key]: {
          ...prev.selectedItems[key],
          checked: !prev.selectedItems[key].checked,
        },
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.templateName,
      tables: JSON.stringify(formData.selectedItems),
      templateid: existingData.id,
      reportsubsetid: existingData.reportSubsetId,
    };

    try {
      const response = await Api.post(`/RI/Template/`, payload);
      console.log('Template updated successfully:', response.data);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating template:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
      <div className="rounded-sm border border-stroke bg-white shadow-default p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="border-b border-stroke py-4 px-6.5">
          <h3 className="text-2xl font-extrabold text-black">Edit Template</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6.5 grid grid-cols-1 gap-4">
            {/* Template Name */}
            <input
              type="text"
              name="templateName"
              value={formData.templateName}
              onChange={handleInputChange}
              placeholder="Template Name"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              required
            />
          </div>

          <div className="p-6.5">
            <h4 className="text-xl font-bold mb-4">Select Items</h4>
            {/* Render checkboxes from selectedItems */}
            <div>
              {Object.keys(formData.selectedItems).map((key) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={key}
                    checked={formData.selectedItems[key].checked}
                    onChange={() => handleCheckboxChange(key)}
                    className="ml-2"
                  />
                  <label htmlFor={key} className="ml-2">
                    {key}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-stroke bg-gray p-4 text-right">
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-success px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Save
            </button>
            <button
              type="button"
              className="ml-2 inline-flex justify-center rounded-md border border-transparent bg-danger px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateTemplateModel;
