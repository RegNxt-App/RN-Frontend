import { useState } from 'react';

import AccountCodeTable from '../../components/Tables/AccountCodeTable';
import Api from '../../components/Api';
import Loader from '../../components/loader';
interface AccountingCategory {
  id: string;
  name: string;
}
interface LedgerData {
  ledgerCode: string;
  accountCode: string;
  description: string;
}

interface AccountCodeProps {
  accountingCategories: AccountingCategory[];
}

const AccountCode: React.FC<AccountCodeProps> = ({ accountingCategories }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [tableData, setTableData] = useState<LedgerData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const fetchAccountCodes = async (ledger: string) => {
    setLoading(true);
    try {
      const response = await Api.get(`/FDL/AccountCode?Ledger=${ledger}`);

      const data = await response.data;
      setTableData(data);
    } catch (error) {
      console.error('Error fetching account codes:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedValue = event.target.value;
    setSelectedCategory(selectedValue);

    if (selectedValue) {
      fetchAccountCodes(selectedValue);
    }
  };
  return (
    <div>
      <div className="block w-full py-8">
        <select
          id="categories"
          className="h-12 border border-gray-300 text-gray-600 text-base rounded-lg block w-full py-2.5 px-4 focus:outline-none"
          onChange={handleCategoryChange}
          value={selectedCategory}
        >
          <option value="" disabled>
            Select a Category
          </option>
          {accountingCategories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <Loader />
      ) : (
        tableData.length > 0 && <AccountCodeTable data={tableData} />
      )}
    </div>
  );
};

export default AccountCode;
