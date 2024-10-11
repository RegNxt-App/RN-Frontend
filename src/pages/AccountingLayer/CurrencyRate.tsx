import React, { useState, useEffect } from 'react';
import Api from '../../utils/Api';
import CurrencyRateData from '../../components/Tables/CurrencyRateData';
import Loader from '../../components/loader';
interface AccountingRateType {
  id: string;
  name: string;
  code: string;
}

interface CurrencyRate {
  rateType: string;
  rateDate: number;
  fromCurrency: string;
  toCurrency: string;
  multiplicationfactor: number;
}

interface CurrencyRateProps {
  data: AccountingRateType[];
}

const CurrencyRate = ({ data }: CurrencyRateProps) => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSelectedType(selectedValue);
  };
  useEffect(() => {
    const fetchCurrencyRate = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await Api.get(
          `FDL/Currencyrate?ratingType=${selectedType}`,
        );
        setCurrencyRates(response.data);
        console.log(response.data);
      } catch (err: any) {
        setError('Failed to fetch Currency rate');
      } finally {
        setLoading(false);
      }
    };
    fetchCurrencyRate();
  }, [selectedType]);

  return (
    <div>
      <div className="block w-full pt-8 pb-8">
        <select
          id="rateType"
          onChange={handleTypeChange}
          value={selectedType}
          className="h-12 border border-gray-300 text-gray-600 text-base rounded-lg block w-full py-2.5 px-4 focus:outline-none"
        >
          <option value="" disabled>
            Select a Type
          </option>
          {data.length > 0 ? (
            data.map((rateType) => (
              <option key={rateType.id} value={rateType.code}>
                {rateType.name}
              </option>
            ))
          ) : (
            <option disabled>No data available</option>
          )}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <>{selectedType && <CurrencyRateData data={currencyRates} />}</>
      )}
    </div>
  );
};

export default CurrencyRate;
