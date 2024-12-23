import {useEffect, useState} from 'react';

import {Edit, Filter, Trash2} from 'lucide-react';
import Swal from 'sweetalert2';

import EditAccountingCat from '../EditAccountingCat';
import Pagination from '../Pagination';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '../ui/table';

interface AccountingCategory {
  id: string;
  name: string;
  description: string;
}

interface DataTableProps {
  data: AccountingCategory[];
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

const FdlAccountingConfig = ({data}: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [filteredData, setFilteredData] = useState<AccountingCategory[]>(data);
  const [filters, setFilters] = useState<FilterState>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<AccountingCategory | null>(null);
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
        const itemValue = String(item[key as keyof AccountingCategory]).toLowerCase();
        const filterValue = filter.value.toLowerCase();
        if (filter.type === 'matchAll') {
          return itemValue.includes(filterValue);
        } else {
          return itemValue.startsWith(filterValue);
        }
      });
    });
    setFilteredData(result);
    setCurrentPage(0);
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

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to Delete Accounting Category Record!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result: any) => {
      if (result.isConfirmed) {
        fetch(`/api/delete/${id}`, {
          method: 'DELETE',
        })
          .then((response) => response.json())
          .then(() => {
            Swal.fire('Deleted!', 'Your record has been deleted.', 'success');
            setFilteredData(filteredData.filter((item) => item.id !== id));
          })
          .catch(() => {
            Swal.fire('Error!', 'There was an error deleting the record.', 'error');
          });
      }
    });
  };

  const handleEdit = (record: AccountingCategory) => {
    setRecordToEdit(record);
    setIsEditPopupOpen(true);
  };

  const closeEditPopup = () => {
    setIsEditPopupOpen(false);
    setRecordToEdit(null);
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
          <option value="NotContains">Not Contains</option>
          <option value="EndsWith">Ends With</option>
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

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {['Name', 'Description', 'Actions'].map((header) => (
                <TableHead key={header}>
                  <div className="flex items-center">
                    {header}
                    {header !== 'Actions' && (
                      <button
                        className="ml-2"
                        onClick={() => setActiveFilter(activeFilter === header ? null : header)}
                      >
                        <Filter
                          size={16}
                          strokeWidth={1.5}
                        />
                      </button>
                    )}
                  </div>
                  {activeFilter === header &&
                    header !== 'Actions' &&
                    renderFilterDropdown(header.toLowerCase())}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </TableCell>
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
      {isEditPopupOpen && recordToEdit && (
        <EditAccountingCat
          onClose={closeEditPopup}
          record={recordToEdit}
        />
      )}
    </div>
  );
};

export default FdlAccountingConfig;
