import React, { useState, useEffect, useMemo } from 'react';
import Api from '../../../utils/Api';
import { AxiosResponse } from 'axios';
import Loader from '../../loader';

interface EntityOption {
  name: string;
  code: number;
}

interface TemplateOption {
  name: string;
  code: number;
}

interface WorkbookFormData {
  name: string;
  entityId: number | null;
  templateId: number | null;
  reportingCurrency: string;
  reportingDate: string;
}

interface AddWorkbookModelProps {
  onClose: () => void;
  onWorkbookAdded: () => void;
}

const AddWorkbookModel = ({
  onClose,
  onWorkbookAdded,
}: AddWorkbookModelProps) => {
  const [entities, setEntities] = useState<EntityOption[]>([]);
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<WorkbookFormData>({
    name: '',
    entityId: null,
    templateId: null,
    reportingCurrency: '',
    reportingDate: '',
  });

  const isFormValid = useMemo(() => {
    return (
      formData.name.trim() !== '' &&
      formData.entityId !== null &&
      formData.templateId !== null &&
      formData.reportingDate !== ''
    );
  }, [formData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [entityResponse, templateResponse] = await Promise.all([
          Api.get<EntityOption[]>('RI/UIInput?type=Entity'),
          Api.get<TemplateOption[]>('RI/UIInput?type=Template'),
        ]);

        setEntities(entityResponse.data);
        setTemplates(templateResponse.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'An error occurred while fetching data',
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'entityId' || name === 'templateId'
          ? parseInt(value, 10) || null
          : value,
    }));
  };

  const formatDate = (dateString: string): string => {
    return dateString.replace(/\D/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      return;
    }

    try {
      await Api.post('/RI/Workbook', {
        Name: formData.name.trim(),
        TemplateId: formData.templateId,
        EntityId: formData.entityId,
        ReportingCurrency: formData.reportingCurrency.trim(),
        ReportingDate: formatDate(formData.reportingDate),
      });
      onWorkbookAdded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit form');
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-sm">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="rounded-sm border border-stroke bg-white shadow-default p-6 w-full max-w-md">
        <div className="border-b border-stroke py-4 px-6.5">
          <h3 className="text-2xl font-extrabold text-black">
            Add New Workbook
          </h3>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="p-6.5">
            <div className="relative mb-4">
              <input
                type="text"
                name="name"
                placeholder="Report Name"
                value={formData.name}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
                onChange={handleInputChange}
                required
              />
              <span className="absolute text-red-500 text-lg font-bold -top-3 -right-3">
                {formData.name.trim() === '' && '*'}
              </span>
            </div>

            <div className="relative mb-4">
              <span className="absolute text-red-500 text-lg font-bold -top-3 -right-3">
                {!formData.entityId && '*'}
              </span>
              <select
                name="entityId"
                value={formData.entityId || ''}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
                onChange={handleInputChange}
                required
              >
                <option value="">Select Reporting Entity</option>
                {entities.map((entity) => (
                  <option key={entity.code} value={entity.code}>
                    {entity.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative mb-4">
              <span className="absolute text-red-500 text-lg font-bold -top-3 -right-3">
                {!formData.templateId && '*'}
              </span>
              <select
                name="templateId"
                value={formData.templateId || ''}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
                onChange={handleInputChange}
                required
              >
                <option value="">Select Template</option>
                {templates.map((template) => (
                  <option key={template.code} value={template.code}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <input
                type="text"
                name="reportingCurrency"
                placeholder="Reporting Currency (Optional)"
                value={formData.reportingCurrency}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
                onChange={handleInputChange}
              />
            </div>

            <div className="relative mb-4">
              <span className="absolute text-red-500 text-lg font-bold -top-3 -right-3">
                {!formData.reportingDate && '*'}
              </span>
              <input
                type="date"
                name="reportingDate"
                value={formData.reportingDate}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-2 px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`flex justify-center rounded p-3 font-medium text-white transition-colors ${
                  isFormValid
                    ? 'bg-primary hover:bg-primary/90'
                    : 'bg-blue-400 cursor-not-allowed'
                }`}
                disabled={!isFormValid}
              >
                Create Report
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWorkbookModel;
