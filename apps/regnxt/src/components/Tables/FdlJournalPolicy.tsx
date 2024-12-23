import React, {useEffect, useState} from 'react';

import {CheckCircle, Filter, XCircle} from 'lucide-react';

import Pagination from '../Pagination';
import {Table, TableBody, TableCell, TableHeader, TableRow} from '../ui/table';

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

const FdlJournalPolicy = ({data}: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filteredData, setFilteredData] = useState<JournalPolicyData[]>(data);
  const [filters, setFilters] = useState<FilterState>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const indexOfLastItem = (currentPage + 1) * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  useEffect(() => {
    applyFilters();
  }, [filters, data]);

  const applyFilters = () => {
    let result = data;
    Object.entries(filters).forEach(([key, filter]) => {
      result = result.filter((item) => {
        const itemValue = String(item[key as keyof JournalPolicyData]).toLowerCase();
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

  const handleFilterChange = (column: string, type: FilterType, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [column]: {type, value},
    }));
  };

  const clearFilter = (column: string) => {
    setFilters((prev) => {
      const newFilters = {...prev};
      delete newFilters[column];
      return newFilters;
    });
    setActiveFilter(null);
  };

  const renderFilterDropdown = (column: string) => (
    <div className="absolute z-10 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
      <div className="p-2">
        <select
          className="w-full rounded-md border-gray-300 shadow-sm"
          value={filters[column]?.type || 'matchAll'}
          onChange={(e) =>
            handleFilterChange(column, e.target.value as FilterType, filters[column]?.value || '')
          }
        >
          <option value="matchAll">Match All</option>
          <option value="matchAny">Match Any</option>
        </select>
        <select
          className="w-full rounded-md border-gray-300 shadow-sm"
          value={filters[column]?.type || 'startsWith'}
          onChange={(e) =>
            handleFilterChange(column, e.target.value as FilterType, filters[column]?.value || '')
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
          onChange={(e) => handleFilterChange(column, filters[column]?.type || 'matchAll', e.target.value)}
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
      <CheckCircle
        className="text-green-500"
        size={20}
      />
    ) : (
      <XCircle
        className="text-red-500"
        size={20}
      />
    );
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
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
                <TableCell key={header}>
                  <div className="flex items-center">
                    {header}
                    <button
                      className="ml-2"
                      onClick={() => setActiveFilter(activeFilter === header ? null : header)}
                    >
                      <Filter
                        size={16}
                        strokeWidth={1.5}
                      />
                    </button>
                  </div>
                  {activeFilter === header && renderFilterDropdown(header.toLowerCase())}
                </TableCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.code}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{renderBooleanIcon(item.allowManualEntries)}</TableCell>
                <TableCell>{renderBooleanIcon(item.allowAutomatedEntries)}</TableCell>
                <TableCell>{renderBooleanIcon(item.allowMultipleEntries)}</TableCell>
                <TableCell>{renderBooleanIcon(item.applyAutoApprove)}</TableCell>
                <TableCell>{item.inbalanceThreshold}</TableCell>
                <TableCell>{item.lastJournalNr}</TableCell>
                <TableCell>{renderBooleanIcon(item.mustBeReversed)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default FdlJournalPolicy;
