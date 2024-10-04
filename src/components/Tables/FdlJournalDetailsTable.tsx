import React, { useState, useEffect } from 'react';
import Pagination from '../Pagination';
import ViewRecordPopup from '../ViewRecordPopup';
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
}

interface DataTableProps {
  data: JournalEntry[];
  clickedjournalCode: string;
  clickedjournalNr: string;
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

const FdlJournalDetailsTable: React.FC<DataTableProps> = ({
  data,
  clickedjournalCode,
  clickedjournalNr,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showWorkbookPopup, setShowWorkbookPopup] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<JournalEntry | null>(
    null,
  );
  const [filteredData, setFilteredData] = useState<JournalEntry[]>(data);
  const [filters, setFilters] = useState<FilterState>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

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

  const handleViewClick = (record: JournalEntry) => {
    setSelectedRecord(record);
    setShowWorkbookPopup(true);
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

  const handlePostToBalances = async () => {
    try {
      const url = `/FDL/AccountingBalance?JournalCode=${clickedjournalCode.toString()}&JournalNr=${clickedjournalNr.toString()}`;

      const response = await Api.post(url, {});

      const isJsonBlob = (data: any) =>
        data instanceof Blob && data.type === 'application/json';
      const responseData = isJsonBlob(response?.data)
        ? await response?.data?.text()
        : response?.data || {};
      const responseJson =
        typeof responseData === 'string'
          ? JSON.parse(responseData)
          : responseData;

      console.log('Success:', responseJson);
    } catch (error) {
      console.error('Error posting to balances:', error);
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1 mt-8">
      <div className="max-w-full overflow-x-auto">
        <p className="font-semibold text-gray-700 mb-3">
          Journal details for {clickedjournalCode} - {clickedjournalNr}
        </p>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded-md mb-4"
          onClick={handlePostToBalances}
        >
          Post into Balances
        </button>

        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              {[
                'Line Nr',
                'Domain Id',
                'Amount Class',
                'Journal Code',
                'Entity',
                'Account Code',
                'Amount',
                'Currency',
                'Effective Date',
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
                  <p className="text-black dark:text-white">
                    {item.journalCode}
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
                    {item.amountInOrigCCy}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-black dark:text-white">{item.currency}</p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <p className="text-black dark:text-white">
                    {item.effectiveDate}
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
      {showWorkbookPopup && selectedRecord && (
        <ViewRecordPopup
          onClose={() => setShowWorkbookPopup(false)}
          record={selectedRecord}
        />
      )}
    </div>
  );
};

export default FdlJournalDetailsTable;
