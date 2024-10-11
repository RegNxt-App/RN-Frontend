import React, { useState, useEffect } from 'react';
import Pagination from '../Pagination';
import { Filter, CheckCircle, XCircle } from 'lucide-react';

interface JournalPolicyData {
  id: string;
  code: string;
  name: string;
  description: string;
  allowManualEntries: boolean;
  allowAutomatedEntries: boolean;
  allowMultipleEntries: boolean;
  applyAutoApprove: boolean;
  inbalanceThreshold: number;
  lastJournalNr: number;
  mustBeReversed: boolean;
}

interface DataTableProps {
  data: JournalPolicyData[];
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

const FdlJournalPolicy = ({ data }: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const [filteredData, setFilteredData] = useState<JournalPolicyData[]>(data);
  const [filters, setFilters] = useState<FilterState>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    applyFilters();
  }, [filters, data]);

  const applyFilters = () => {
    let result = data;
    Object.entries(filters).forEach(([key, filter]) => {
      result = result.filter((item) => {
        const itemValue = String(
          item[key as keyof JournalPolicyData],
        ).toLowerCase();
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
          <option value="NotContains">Not contains</option>
          <option value="EndsWith">Ends with</option>
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

  const renderBooleanIcon = (value: boolean) => {
    return value ? (
      <CheckCircle className="text-green-500" size={20} />
    ) : (
      <XCircle className="text-red-500" size={20} />
    );
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              {[
                'Policy Code',
                'Name',
                'Description',
                'allowManualEntries',
                'allowAutomatedEntries',
                'allowMultipleEntries',
                'applyAutoApprove',
                'inbalanceThreshold',
                'lastJournalNr',
                'mustBeReversed',
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
              <tr key={item.id}>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {item.code}
                  </h5>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {item.name}
                  </h5>
                </td>
                <td className="border-b border-[#eee] py-5 px-4  dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {item.description}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {renderBooleanIcon(item.allowManualEntries)}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {renderBooleanIcon(item.allowAutomatedEntries)}
                  </p>
                </td>{' '}
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {renderBooleanIcon(item.allowMultipleEntries)}
                  </p>
                </td>{' '}
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {renderBooleanIcon(item.applyAutoApprove)}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {item.inbalanceThreshold}
                  </p>
                </td>{' '}
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {item.lastJournalNr}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {renderBooleanIcon(item.mustBeReversed)}
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

export default FdlJournalPolicy;
