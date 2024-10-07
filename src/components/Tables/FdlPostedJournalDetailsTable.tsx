import React, { useState, useEffect } from 'react';
import Pagination from '../Pagination';
import { Filter } from 'lucide-react';
import Api from '../Api';
interface JournalEntry {
  journalCode: string;
  journalNr: number;
  journalLineNr: number;
  entity: string;
  amountClass: string;
  domainId: string;
  counterparty: string;
  accountCode: string;
  dealId: string;
  currency: string;
  effectiveDate: number;
  description: string;
  amountInOrigCCy: number;
  freeField1: string;
  freeField2: string;
  freeField3: string;
  freeField4: string;
  freeField5: string;
  freeField6: string;
  freeField7: string;
  freeField8: string;
  freeField9: string;
  freeField10: string;
}

interface DataTableProps {
  data: JournalEntry[];
  clickedjournalCode: string;
  clickedjournalNr: string;
  onUpdateSuccess: () => void;
}

interface FilterState {
  [key: string]: {
    type: FilterType;
    value: string;
  };
}

type FilterType =
  | 'matchAll'
  | 'matchAny'
  | 'startsWith'
  | 'Contains'
  | 'NotContains'
  | 'EndsWith'
  | 'Equals'
  | 'NotEquals';

const itemsPerPage = 10;

const FdlPostedJournalDetailsTable: React.FC<DataTableProps> = ({
  data,
  clickedjournalCode,
  clickedjournalNr,
  onUpdateSuccess,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showWorkbookPopup, setShowWorkbookPopup] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<JournalEntry | null>(
    null,
  );
  const [filteredData, setFilteredData] = useState<JournalEntry[]>(data);
  const [filters, setFilters] = useState<FilterState>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    applyFilters();
  }, [filters, data]);

  const applyFilters = () => {
    let result = data;
    Object.entries(filters).forEach(([key, filter]) => {
      result = result.filter((item) => {
        const itemValue = String(item[key as keyof JournalEntry]).toLowerCase();
        const filterValue = filter.value.toLowerCase();
        if (filter.type === 'matchAll') {
          return itemValue.includes(filterValue);
        } else {
          return itemValue.startsWith(filterValue);
        }
      });
    });
    setFilteredData(result);
    setCurrentPage(1);
  };

  const handleFilterChange = (
    column: string,
    type: FilterType,
    value: string,
  ) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [column]: { type, value },
    }));
  };

  const clearFilter = (column: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[column];
      return newFilters;
    });
    setActiveFilter(null);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const renderFilterDropdown = (column: string) => (
    <div className="absolute z-10 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
      <div className="p-2">
        <select
          className="w-full rounded-md border-gray-300 shadow-sm"
          value={filters[column]?.type || 'matchAll'}
          onChange={(e) =>
            handleFilterChange(
              column,
              e.target.value as FilterType,
              filters[column]?.value || '',
            )
          }
        >
          <option value="matchAll">Match All</option>
          <option value="matchAny">Match Any</option>
        </select>
        <select
          className="w-full rounded-md border-gray-300 shadow-sm"
          value={filters[column]?.type || 'startsWith'}
          onChange={(e) =>
            handleFilterChange(
              column,
              e.target.value as FilterType,
              filters[column]?.value || '',
            )
          }
        >
          <option value="startsWith">Starts With</option>
          <option value="Contains">Contains</option>
          <option value="NotContains">Not Contains</option>
          <option value="EndsWith">Ends With</option>
          <option value="Equals">Equals</option>
          <option value="NotEquals">Not Equals</option>
        </select>
        <input
          type="text"
          className="mt-2 w-full rounded-md border-gray-300 shadow-sm"
          value={filters[column]?.value || ''}
          onChange={(e) =>
            handleFilterChange(
              column,
              filters[column]?.type || 'matchAll',
              e.target.value,
            )
          }
          placeholder="Search..."
        />
        <div className="mt-2 flex justify-between">
          <button
            className="rounded bg-gray-200 px-2 py-1 text-sm"
            onClick={() => clearFilter(column)}
          >
            Clear
          </button>
          <button
            className="rounded bg-blue-500 px-2 py-1 text-sm text-white"
            onClick={() => setActiveFilter(null)}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );

  const handleUnpostFromBalances = async () => {
    try {
      const url = `/FDL/AccountingBalance?JournalCode=${clickedjournalCode}&JournalNr=${clickedjournalNr}`;
      const response = await Api.delete(url);

      const responseData = response.data || {};
      const responseJson =
        typeof responseData === 'string'
          ? JSON.parse(responseData)
          : responseData;

      console.log('Success:', responseJson);
      onUpdateSuccess();
    } catch (error) {
      console.error('Error posting to balances:', error);
    }
  };

  const handleConfirmUnpost = () => {
    setShowConfirmDialog(false);
    handleUnpostFromBalances();
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1 mt-8">
      <div className="max-w-full overflow-x-auto">
        <p className="font-semibold text-gray-700 mb-3">
          Journal details for {clickedjournalCode} - {clickedjournalNr}
        </p>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-md mb-4"
          onClick={() => setShowConfirmDialog(true)} // Open confirmation dialog
        >
          Unpost from Balances
        </button>
        {showConfirmDialog && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg">
              <p className="mb-4">
                Are you sure to remove the journal with code{' '}
                <strong>{clickedjournalCode}</strong> and nr{' '}
                <strong>{clickedjournalNr}</strong> from the balances?
              </p>
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded-md mr-2"
                  onClick={() => setShowConfirmDialog(false)} // Close without action
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md"
                  onClick={handleConfirmUnpost} // Confirm and call the API
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              {[
                'Line Nr',
                'Domain Id',
                'Amount Class',
                'Entity',
                'Account Code',
                'Counterparty',
                'Currency',
                'Deal Id',
                'Effective Date',
                'Amount In Orig CCy',
                'Free Field1',
                'Free Field2',
                'Free Field3',
                'Free Field4',
                'Free Field5',
                'Free Field6',
                'Free Field7',
                'Free Field8',
                'Free Field9',
                'Free Field10',
                'Source',
                'Description',
              ].map((header) => (
                <th
                  key={header}
                  className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11"
                >
                  <div className="flex items-center">
                    {header}
                    <button
                      className="ml-2"
                      onClick={() =>
                        setActiveFilter(activeFilter === header ? null : header)
                      }
                    >
                      <Filter size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                  {activeFilter === header &&
                    renderFilterDropdown(header.toLowerCase())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item) => (
              <tr key={`${item.journalCode}-${item.journalLineNr}`}>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-black dark:text-white">
                    {item.journalLineNr}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-black dark:text-white">{item.domainId}</p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-black dark:text-white">
                    {item.amountClass}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-black dark:text-white">{item.entity}</p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-black dark:text-white">
                    {item.accountCode}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-black dark:text-white">
                    {item.counterparty}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-black dark:text-white">{item.currency}</p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-black dark:text-white">{item.dealId}</p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-black dark:text-white">
                    {item.effectiveDate}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-black dark:text-white">
                    {item.amountInOrigCCy}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-black dark:text-white">
                    {item.freeField1}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-black dark:text-white">
                    {item.freeField2}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-black dark:text-white">
                    {item.freeField3}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-black dark:text-white">
                    {item.freeField4}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-black dark:text-white">
                    {item.freeField5}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-black dark:text-white">
                    {item.freeField6}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-black dark:text-white">
                    {item.freeField7}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-black dark:text-white">
                    {item.freeField8}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-black dark:text-white">
                    {item.freeField9}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-black dark:text-white">
                    {item.freeField10}
                  </p>
                </td>

                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-black dark:text-white">
                    {item.journalCode}
                  </p>
                </td>

                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-black dark:text-white">
                    {item.description}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default FdlPostedJournalDetailsTable;
