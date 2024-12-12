import { useState, useEffect } from 'react';
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

const FdlPostedJournalDetailsTable = ({
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
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [fieldLabels, setFieldLabels] = useState<{ [key: string]: string }>({});

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
        <p className="font-semibold text-black mb-3">
          Journal details for {clickedjournalCode} - {clickedjournalNr}
        </p>
        <Button
          className=" bg-purple-500 text-white"
          onClick={() => setShowConfirmDialog(true)}
        >
          Unpost from Balances
        </Button>
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
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md"
                  onClick={handleConfirmUnpost}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Journal Code</TableHead>
              <TableHead>Journal Nr</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Amount Class</TableHead>
              <TableHead>Domain ID</TableHead>
              <TableHead>Counterparty</TableHead>
              <TableHead>Account Code</TableHead>
              <TableHead>Deal ID</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.journalCode}</TableCell>
                <TableCell>{item.journalNr}</TableCell>
                <TableCell>{item.entity}</TableCell>
                <TableCell>{item.amountClass}</TableCell>
                <TableCell>{item.domainId}</TableCell>
                <TableCell>{item.counterparty}</TableCell>
                <TableCell>{item.accountCode}</TableCell>
                <TableCell>{item.dealId}</TableCell>
                <TableCell>{item.currency}</TableCell>
                <TableCell>{item.description}</TableCell>
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

export default FdlPostedJournalDetailsTable;
