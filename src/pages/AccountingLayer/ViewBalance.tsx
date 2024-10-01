import { useState } from 'react';
import Select from 'react-select';

interface Option {
  value: string;
  label: string;
}

const analyticalKeys: Option[] = [
  { value: 'AccountCode', label: 'Account Code' },
  { value: 'AmountClass', label: 'Amount Class' },
  { value: 'DomainId', label: 'Domain ID' },
  { value: 'Currency', label: 'Currency' },
  { value: 'Countryparty', label: 'Countryparty' },
  { value: 'DealId', label: 'Deal ID' },
  { value: 'FreeField1', label: 'Free Field 1' },
  { value: 'FreeField2', label: 'Free Field 2' },
  { value: 'FreeField3', label: 'Free Field 3' },
  { value: 'FreeField4', label: 'Free Field 4' },
  { value: 'FreeField5', label: 'Free Field 5' },
  { value: 'FreeField6', label: 'Free Field 6' },
  { value: 'FreeField7', label: 'Free Field 7' },
  { value: 'FreeField8', label: 'Free Field 8' },
  { value: 'FreeField9', label: 'Free Field 9' },
  { value: 'FreeField10', label: 'Free Field 10' },
];

const balanceAmountFields: Option[] = [
  { value: 'DtdCcyAmount', label: 'DTD CCY Amount' },
  { value: 'DtdLclAmount', label: 'DTD LCL Amount' },
  { value: 'MtdccyAmount', label: 'MTD CCY Amount' },
  { value: 'YtdCcyAmount', label: 'YTD CCY Amount' },
  { value: 'YtdLclAmount', label: 'YTD LCL Amount' },
  { value: 'LtdCcyAmount', label: 'LTD CCY Amount' },
  { value: 'LtdLclAmount', label: 'LTD LCL Amount' },
];

const ViewBalance = () => {
  const [selectedAnalyticalKeys, setSelectedAnalyticalKeys] = useState<
    Option[]
  >([]);
  const [selectedBalanceAmountFields, setSelectedBalanceAmountFields] =
    useState<Option[]>([]);
  const handleShowBalances = () => {
    alert('Show Balances clicked');
  };
  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Analytical Keys
        </label>
        <Select
          isMulti
          name="analyticalKeys"
          options={analyticalKeys}
          className="basic-multi-select"
          classNamePrefix="select"
          value={selectedAnalyticalKeys}
          onChange={(selected) =>
            setSelectedAnalyticalKeys(selected as Option[])
          }
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Balance Amount Fields
        </label>
        <Select
          isMulti
          name="balanceAmountFields"
          options={balanceAmountFields}
          className="basic-multi-select"
          classNamePrefix="select"
          value={selectedBalanceAmountFields}
          onChange={(selected) =>
            setSelectedBalanceAmountFields(selected as Option[])
          }
        />
      </div>
      <button
        onClick={handleShowBalances}
        className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Show Balances
      </button>
    </div>
  );
};

export default ViewBalance;
