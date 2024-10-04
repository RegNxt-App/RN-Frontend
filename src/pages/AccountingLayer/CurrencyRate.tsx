import React, { useState } from 'react';

interface AccountingRateType {
  id: string;
  name: string;
  code: string;
}

interface CurrencyRateProps {
  data: AccountingRateType[];
}

const CurrencyRate: React.FC<CurrencyRateProps> = ({ data }) => {
  const [selectedType, setSelectedType] = useState<string>('');

  const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSelectedType(selectedValue);
  };
  return (
    <div>
      <div className="block w-full p-8">
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
    </div>
  );
};

export default CurrencyRate;
