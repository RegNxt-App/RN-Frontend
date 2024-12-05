import { useState, useEffect } from 'react';
import Select from 'react-select';
import Api from '../../utils/Api';
import ViewBalanceData from '../../components/Tables/ViewBalancesTable';
import { Button } from '@/components/ui/button';

interface Option {
  value: string;
  label: string;
}

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
  >([
    { value: 'AccountCode', label: 'Account Code' },
    { value: 'AmountClass', label: 'Amount Class' },
    { value: 'DomainId', label: 'Domain ID' },
    { value: 'Currency', label: 'Currency' },
  ]);

  const [selectedBalanceAmountFields, setSelectedBalanceAmountFields] =
    useState<Option[]>([
      { value: 'DtdLclAmount', label: 'DTD LCL Amount' },
      { value: 'YtdLclAmount', label: 'YTD LCL Amount' },
      { value: 'LtdLclAmount', label: 'LTD LCL Amount' },
    ]);

  const [analyticalKeys, setAnalyticalKeys] = useState<Option[]>([
    { value: 'AccountCode', label: 'Account Code' },
    { value: 'AmountClass', label: 'Amount Class' },
    { value: 'DomainId', label: 'Domain ID' },
    { value: 'Currency', label: 'Currency' },
    { value: 'FreeField1', label: 'Free Field 1' },
    { value: 'FreeField2', label: 'Free Field 2' },
    { value: 'FreeField3', label: 'Free Field 3' },
    { value: 'FreeField4', label: 'Free Field 4' },
    { value: 'FreeField5', label: 'Free Field 5' },
    { value: 'FreeField6', label: 'Free Field 6' },
    { value: 'FreeField7', label: 'Free Field 7' },
    { value: 'FreeField8', label: 'Free Field 8' },
    { value: 'FreeField9', label: 'Free Field 9' },
  ]);
  const [balancesData, setBalancesData] = useState<any[]>([]);
  const [showBalances, setShowBalances] = useState(false);

  useEffect(() => {
    const fetchAccountingLabels = async () => {
      try {
        const response = await Api.get('/FDL/AccountingLabel');
        const updatedKeys = analyticalKeys.map((key) => {
          const field = response.data.find(
            (item: any) =>
              item.column.toLowerCase() === key.value.toLowerCase(),
          );
          if (field) {
            return { value: field.column, label: field.label };
          }
          return key;
        });
        setAnalyticalKeys(updatedKeys);
      } catch (error) {
        console.error('Failed to fetch accounting labels:', error);
      }
    };

    fetchAccountingLabels();
  }, []);

  const handleShowBalances = async () => {
    const granularityFields = selectedAnalyticalKeys
      .map((key) => key.value)
      .join(',');
    const measureFields = selectedBalanceAmountFields
      .map((field) => field.value)
      .join(',');

    const lowerBoundary = '20240101';
    const upperBoundary = '20240331';
    const frequency = 'daily';
    const filter = 'f';

    const endpoint = `/FDL/AccountingBalance?lowerboundary=${lowerBoundary}&upperboundary=${upperBoundary}&frequency=${frequency}&granularityFields=${granularityFields}&measureFields=${measureFields}&filter=${filter}`;

    try {
      const response = await Api.get(endpoint);
      setBalancesData(response.data);
      setShowBalances(true);
    } catch (error) {
      console.error('Failed to fetch accounting balances:', error);
      alert('Failed to fetch balances. Please try again.');
    }
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
      <Button
        onClick={handleShowBalances}
        className="w-full bg-purple text-white hover:bg-purple-900"
      >
        Show Balances
      </Button>
      {showBalances && <ViewBalanceData data={balancesData} />}
    </div>
  );
};

export default ViewBalance;
