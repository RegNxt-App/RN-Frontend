import React, { useState, useEffect } from 'react';
import Api from '../../../utils/Api';

interface UpdateRecordPopupProps {
  onClose: () => void;
  onUpdate: () => void;

  existingData: any;
}

const UpdateEntityModel = ({
  onClose,
  existingData,
  onUpdate,
}: UpdateRecordPopupProps) => {
  const [formData, setFormData] = useState({
    entityCode: '',
    entityLabel: '',
    country: '',
    city: '',
    identificationType: '',
    vat: '',
    bicCode: '',
    kboCode: '',
    leiCode: '',
    reportingCurrency: '',
    significantCurrencies: '',
    email: '',
    consolidationScope: '',
  });

  useEffect(() => {
    if (existingData) {
      setFormData({
        entityCode: existingData.code || '',
        entityLabel: existingData.label || '',
        country: existingData.country || '',
        city: existingData.city || '',
        identificationType: existingData.identificationtype || '',
        vat: existingData.vat || '',
        bicCode: existingData.biccode || '',
        kboCode: existingData.kbo || '',
        leiCode: existingData.leiCode || '',
        reportingCurrency: existingData.reportingcurrency || '',
        significantCurrencies: existingData.significantcurrencies || '',
        email: existingData.email || '',
        consolidationScope: existingData.consolidationscope || '',
      });
    }
  }, [existingData]);

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
        entityid: existingData.id,
        code: formData.entityCode,
        label: formData.entityLabel,
        country: formData.country,
        city: formData.city,
        identificationtype: formData.identificationType,
        vat: formData.vat,
        biccode: formData.bicCode,
        kbo: formData.kboCode,
        lei: formData.leiCode,
        reportingcurrency: formData.reportingCurrency,
        significantcurrencies: formData.significantCurrencies,
        email: formData.email,
        consolidationscope: formData.consolidationScope,
      };

      const response = await Api.post(`/RI/Entity/`, payload);

      console.log('Entity updated successfully:', response.data);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating entity:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="rounded-sm border border-stroke bg-white shadow-default p-6 w-full max-w-4xl">
        <div className="border-b border-stroke py-4 px-6.5">
          <h3 className="text-2xl font-extrabold text-black">Update Entity</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6.5 grid grid-cols-3 gap-4">
            <input
              type="text"
              name="entityCode"
              placeholder="Entity Code"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.entityCode}
              required
            />
            <input
              type="text"
              name="entityLabel"
              placeholder="Entity Label"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.entityLabel}
              required
            />
            <input
              type="text"
              name="country"
              placeholder="Country"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.country}
              required
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.city}
              required
            />
            <input
              type="text"
              name="identificationType"
              placeholder="Identification Type"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.identificationType}
              required
            />
            <input
              type="text"
              name="vat"
              placeholder="VAT"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.vat}
              required
            />
            <input
              type="text"
              name="bicCode"
              placeholder="BIC Code"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.bicCode}
              required
            />
            <input
              type="text"
              name="kboCode"
              placeholder="KBO Code"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.kboCode}
              required
            />
            <input
              type="text"
              name="leiCode"
              placeholder="LEI Code"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.leiCode}
              required
            />
            <input
              type="text"
              name="reportingCurrency"
              placeholder="Reporting Currency"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.reportingCurrency}
              required
            />
            <input
              type="text"
              name="significantCurrencies"
              placeholder="Significant Currencies"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.significantCurrencies}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.email}
              required
            />
            <input
              type="text"
              name="consolidationScope"
              placeholder="Consolidation Scope"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.consolidationScope}
              required
            />
          </div>
          <div className="flex justify-end p-6.5">
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
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateEntityModel;
