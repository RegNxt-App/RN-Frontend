import {useState} from 'react';

import AccountCodeTable from '../../components/Tables/AccountCodeTable';
import Loader from '../../components/loader';
import Api from '../../utils/Api';

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

const AccountCode = ({accountingCategories}: AccountCodeProps) => {
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
  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = event.target.value;
    setSelectedCategory(selectedValue);

    if (selectedValue) {
      fetchAccountCodes(selectedValue);
    }
  };

  const handleDelete = (id: string) => {
    setTableData((prevData) => prevData.filter((item) => item.ledgerCode !== id));
  };

  const handleUpdate = (updatedRecord: LedgerData) => {
    setTableData((prevData) =>
      prevData.map((item) => (item.ledgerCode === updatedRecord.ledgerCode ? updatedRecord : item))
    );
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
          <option
            value=""
            disabled
          >
            Select a Category
          </option>
          {accountingCategories.map((category) => (
            <option
              key={category.id}
              value={category.name}
            >
              {category.name}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <Loader />
      ) : (
        tableData.length > 0 && (
          <AccountCodeTable
            data={tableData}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        )
      )}
    </div>
  );
};

export default AccountCode;
