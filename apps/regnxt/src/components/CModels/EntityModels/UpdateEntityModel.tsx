import React, {useEffect, useState} from 'react';

import Loader from '@/components/loader';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';

import Api from '../../../utils/Api';

interface UpdateRecordPopupProps {
  onClose: () => void;
  onUpdate: () => void;
  existingData: any;
}

interface CurrencyOption {
  name: string;
  code: string;
}

const UpdateEntityModel = ({onClose, existingData, onUpdate}: UpdateRecordPopupProps) => {
  const [formData, setFormData] = useState({
    entityCode: '',
    entityLabel: '',
    country: '',
    city: '',
    identificationType: '',
    vat: '',
    bicCode: '',
    kbo: '',
    lei: '',
    reportingCurrency: '',
    significantCurrencies: '',
    email: '',
    consolidationScope: '',
  });
  const [identificationTypes, setIdentificationTypes] = useState<{name: string; code: number}[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch identification types and currencies
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [identificationResponse, currencyResponse] = await Promise.all([
          Api.get('/RI/UIInput?type=IdentificationType'),
          Api.get<CurrencyOption[]>('RI/UIInput?type=Currency'),
        ]);
        setIdentificationTypes(identificationResponse.data);
        setCurrencies(currencyResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch required data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Set form data when existing data and dependencies are available
  useEffect(() => {
    if (existingData && identificationTypes.length > 0 && currencies.length > 0) {
      setFormData({
        entityCode: existingData.code || '',
        entityLabel: existingData.label || '',
        country: existingData.country || '',
        city: existingData.city || '',
        identificationType: existingData.identificationType || '',
        vat: existingData.vat || '',
        bicCode: existingData.bicCode || '',
        kbo: existingData.kbo || '',
        lei: existingData.lei || '',
        reportingCurrency: existingData.reportingCurrency || '',
        significantCurrencies: existingData.significantCurrencies || '',
        email: existingData.email || '',
        consolidationScope: existingData.consolidationScope || '',
      });
    }
  }, [existingData, identificationTypes, currencies]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const {name, value} = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
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
        kbo: formData.kbo,
        lei: formData.lei,
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

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
        <div className="bg-white p-6 rounded-sm">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
      <div className="rounded-sm border border-stroke bg-white shadow-default p-6 w-full max-w-4xl">
        <div className="border-b border-stroke py-4 px-6.5">
          <h3 className="text-2xl font-extrabold text-black">Update Entity</h3>
        </div>
        {error && (
          <div className="p-6.5">
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">{error}</div>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="p-6.5 grid grid-cols-3 gap-4">
            <Input
              type="text"
              name="entityCode"
              placeholder="Entity Code"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.entityCode}
              required
            />
            <Input
              type="text"
              name="entityLabel"
              placeholder="Entity Label"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.entityLabel}
              required
            />
            <Input
              type="text"
              name="country"
              placeholder="Country"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.country}
              required
            />
            <Input
              type="text"
              name="city"
              placeholder="City"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.city}
              required
            />
            <select
              name="identificationType"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.identificationType}
              required
            >
              <option
                value=""
                disabled
              >
                Select Identification Type
              </option>
              {identificationTypes.map((type) => (
                <option
                  key={type.code}
                  value={type.code}
                >
                  {type.name}
                </option>
              ))}
            </select>
            <Input
              type="text"
              name="vat"
              placeholder="VAT"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.vat}
              required
            />
            <Input
              type="text"
              name="bicCode"
              placeholder="BIC Code"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.bicCode}
              required
            />
            <Input
              type="text"
              name="kbo"
              placeholder="KBO Code"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.kbo}
              required
            />
            <Input
              type="text"
              name="lei"
              placeholder="LEI Code"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.lei}
              required
            />
            <select
              name="reportingCurrency"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.reportingCurrency}
              required
            >
              <option
                value=""
                disabled
              >
                Select Reporting Currency
              </option>
              {currencies.map((currency) => (
                <option
                  key={currency.code}
                  value={currency.code}
                >
                  {currency.name}
                </option>
              ))}
            </select>
            <Input
              type="text"
              name="significantCurrencies"
              placeholder="Significant Currencies"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.significantCurrencies}
              required
            />
            <Input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.email}
              required
            />
            <Input
              name="consolidationScope"
              placeholder="Consolidation Scope"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary"
              onChange={handleInputChange}
              value={formData.consolidationScope}
              required
            />
          </div>
          <div className="flex justify-end p-6.5">
            <Button
              type="button"
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray-300 hover:bg-gray-300 rounded-md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-purple-500 text-white"
            >
              Update
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateEntityModel;
