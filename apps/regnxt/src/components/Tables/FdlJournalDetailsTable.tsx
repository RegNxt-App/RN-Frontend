import React, { useState, useEffect } from 'react';
import Pagination from '../Pagination';
import { Filter } from 'lucide-react';
import Api from '../../utils/Api';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

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

const FdlJournalDetailsTable = ({
  data,
  clickedjournalCode,
  clickedjournalNr,
  onUpdateSuccess,
}: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filteredData, setFilteredData] = useState<JournalEntry[]>(data);
  const [filters, setFilters] = useState<FilterState>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [fieldLabels, setFieldLabels] = useState<{ [key: string]: string }>({});

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

  useEffect(() => {
    const fetchFieldLabels = async () => {
      try {
        const response = await Api.get('/FDL/AccountingLabel');
        const labelData = response.data;
        const labelsMap: { [key: string]: string } = {};
        labelData.forEach((item: { column: string; label: string }) => {
          labelsMap[item.column] = item.label;
        });
        setFieldLabels(labelsMap);
      } catch (error) {
        console.error('Error fetching field labels:', error);
      }
    };

    fetchFieldLabels();
  }, []);
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
      onUpdateSuccess();
    } catch (error) {
      console.error('Error posting to balances:', error);
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1 mt-8">
      <div className="max-w-full overflow-x-auto">
        <p className="font-semibold text-black mb-3">
          Journal details for {clickedjournalCode} - {clickedjournalNr}
        </p>
        <Button
          className="bg-purple-500 text-white"
          onClick={handlePostToBalances}
        >
          Post into Balances
        </Button>

        <Table>
          <TableHeader>
            <TableRow>
              {[
                { key: 'journalLineNr', label: 'Line Nr' },
                { key: 'domainId', label: 'Domain Id' },
                { key: 'amountClass', label: 'Amount Class' },
                { key: 'entity', label: 'Entity' },
                { key: 'accountCode', label: 'Account Code' },
                { key: 'counterparty', label: 'Counterparty' },
                { key: 'currency', label: 'Currency' },
                { key: 'dealId', label: 'Deal Id' },
                { key: 'effectiveDate', label: 'Effective Date' },
                { key: 'amountInOrigCCy', label: 'Amount In Orig CCy' },
                {
                  key: 'freeField1',
                  label: fieldLabels.freefield1 || 'Free Field 1',
                },
                {
                  key: 'freeField2',
                  label: fieldLabels.freefield2 || 'Free Field 2',
                },
                {
                  key: 'freeField3',
                  label: fieldLabels.freefield3 || 'Free Field 3',
                },
                {
                  key: 'freeField4',
                  label: fieldLabels.freefield4 || 'Free Field 4',
                },
                {
                  key: 'freeField5',
                  label: fieldLabels.freefield5 || 'Free Field 5',
                },
                {
                  key: 'freeField6',
                  label: fieldLabels.freefield6 || 'Free Field 6',
                },
                {
                  key: 'freeField7',
                  label: fieldLabels.freefield7 || 'Free Field 7',
                },
                {
                  key: 'freeField8',
                  label: fieldLabels.freefield8 || 'Free Field 8',
                },
                {
                  key: 'freeField9',
                  label: fieldLabels.freefield9 || 'Free Field 9',
                },
                {
                  key: 'freeField10',
                  label: fieldLabels.freefield10 || 'Free Field 10',
                },
                { key: 'journalCode', label: 'Source' },
                { key: 'description', label: 'Description' },
              ].map(({ key, label }) => (
                <TableHead key={key}>
                  <div className="flex items-center gap-2">
                    <span>{label}</span>
                    <Filter
                      className="w-4 h-4"
                      onClick={() => setActiveFilter(key)}
                    />
                  </div>
                  {activeFilter === key && renderFilterDropdown(key)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentItems.map((item) => (
              <TableRow key={`${item.journalCode}-${item.journalLineNr}`}>
                {[
                  'journalLineNr',
                  'domainId',
                  'amountClass',
                  'entity',
                  'accountCode',
                  'counterparty',
                  'currency',
                  'dealId',
                  'effectiveDate',
                  'amountInOrigCCy',
                  'freeField1',
                  'freeField2',
                  'freeField3',
                  'freeField4',
                  'freeField5',
                  'freeField6',
                  'freeField7',
                  'freeField8',
                  'freeField9',
                  'freeField10',
                  'journalCode',
                  'description',
                ].map((key) => (
                  <TableCell key={key}>
                    <p className="text-black dark:text-white">{item[key]}</p>
                  </TableCell>
                ))}
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

export default FdlJournalDetailsTable;
