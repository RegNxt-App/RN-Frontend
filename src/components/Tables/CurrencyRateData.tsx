import { useState, useEffect } from 'react';
import Pagination from '../Pagination';
import { Select, SelectItem } from '../ui/select';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Filter } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface CurrencyRateData {
  rateType: string;
  rateDate: number;
  fromCurrency: string;
  toCurrency: string;
  multiplicationfactor: number;
}

interface DataTableProps {
  data: CurrencyRateData[];
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

const CurrencyRateData = ({ data }: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState<CurrencyRateData[]>(data);
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
          item[key as keyof CurrencyRateData],
        ).toLowerCase();
        const filterValue = filter.value.toLowerCase();

        switch (filter.type) {
          case 'matchAll':
            return itemValue.includes(filterValue);
          case 'startsWith':
            return itemValue.startsWith(filterValue);
          case 'Contains':
            return itemValue.includes(filterValue);
          case 'NotContains':
            return !itemValue.includes(filterValue);
          case 'EndsWith':
            return itemValue.endsWith(filterValue);
          case 'Equals':
            return itemValue === filterValue;
          case 'NotEquals':
            return itemValue !== filterValue;
          default:
            return true;
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center">
                  Rate Date
                  <button
                    className="ml-2"
                    onClick={() =>
                      setActiveFilter(
                        activeFilter === 'rateDate' ? null : 'rateDate',
                      )
                    }
                  >
                    <Filter size={16} strokeWidth={1.5} />
                  </button>
                </div>
                {activeFilter === 'rateDate' &&
                  renderFilterDropdown('rateDate')}
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  From Currency
                  <button
                    className="ml-2"
                    onClick={() =>
                      setActiveFilter(
                        activeFilter === 'fromCurrency' ? null : 'fromCurrency',
                      )
                    }
                  >
                    <Filter size={16} strokeWidth={1.5} />
                  </button>
                </div>
                {activeFilter === 'fromCurrency' &&
                  renderFilterDropdown('fromCurrency')}
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  To Currency
                  <button
                    className="ml-2"
                    onClick={() =>
                      setActiveFilter(
                        activeFilter === 'toCurrency' ? null : 'toCurrency',
                      )
                    }
                  >
                    <Filter size={16} strokeWidth={1.5} />
                  </button>
                </div>
                {activeFilter === 'toCurrency' &&
                  renderFilterDropdown('toCurrency')}
              </TableHead>
              <TableHead>Multiplication Factor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.rateDate}</TableCell>
                <TableCell>{item.fromCurrency}</TableCell>
                <TableCell>{item.toCurrency}</TableCell>
                <TableCell>{item.multiplicationfactor}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default CurrencyRateData;
