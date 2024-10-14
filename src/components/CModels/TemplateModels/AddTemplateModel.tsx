import React, { useState } from 'react';
import Api from '../../../utils/Api';

interface AddTemplateModelProps {
  onClose: () => void;
}

const AddTemplateModel = ({ onClose }: AddTemplateModelProps) => {
  const [formData, setFormData] = useState({
    templateName: '',
    regulatoryField: '',
    reportGroup: '',
    reportSet: '',
    reportSubset: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        templateName: formData.templateName,
        regulatoryField: formData.regulatoryField,
        reportGroup: formData.reportGroup,
        reportSet: formData.reportSet,
        reportSubset: formData.reportSubset,
      };

      const response = await Api.post('/template', payload);

      console.log('Template created successfully:', response.data);

      onClose();
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="rounded-sm border border-stroke bg-white shadow-default p-6 w-full max-w-4xl">
        <div className="border-b border-stroke py-4 px-6.5">
          <h3 className="text-2xl font-extrabold text-black">
            Add New Template
          </h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6.5 grid grid-cols-2 gap-4">
            <input
              type="text"
              name="templateName"
              placeholder="Template Name"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.templateName}
              required
            />

            <select
              name="regulatoryField"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.regulatoryField}
              required
            >
              <option value="">Select Regulatory Field</option>
              <option value="COREP">COREP</option>
              <option value="FINREP">FINREP</option>
            </select>

            <select
              name="reportGroup"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.reportGroup}
              required
            >
              <option value="">Select Report Group</option>
              <option value="Group 1">Group 1</option>
              <option value="Group 2">Group 2</option>
            </select>

            <select
              name="reportSet"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.reportSet}
              required
            >
              <option value="">Select Report Set</option>
              <option value="Set 1">Set 1</option>
              <option value="Set 2">Set 2</option>
            </select>

            <select
              name="reportSubset"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.reportSubset}
              required
            >
              <option value="">Select Report Subset</option>
              <option value="Subset 1">Subset 1</option>
              <option value="Subset 2">Subset 2</option>
            </select>
          </div>
          <div className="flex justify-end p-6.5">
            <button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray-300 rounded-md"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex justify-center rounded bg-primary p-3 font-medium text-white"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTemplateModel;
