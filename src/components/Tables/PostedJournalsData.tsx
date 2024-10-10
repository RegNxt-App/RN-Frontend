import React, { useState, useEffect } from 'react';
import Pagination from '../Pagination';
import { Filter } from 'lucide-react';
import FdlPostedJournalDetailsTable from './FdlPostedJournalDetailsTable';
import Api from '../../utils/Api';

interface PostedJournalData {
  id: string;
  journalCode: string;
  journalNr: string;
  status: string;
  entryDate: string;
  description: string;
  entityList: string;
  minEffectiveDate: string;
  maxEffectiveDate: string;
  reversalJournalCode: string;
  reversalJournalNr: string;
}

interface DataTableProps {
  data: PostedJournalData[];
  updateUnpostedJournals: (updatedData: PostedJournalData[]) => void;
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

const PostedJournalsData: React.FC<DataTableProps> = ({
  data,
  updateUnpostedJournals,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showWorkbookPopup, setShowWorkbookPopup] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<PostedJournalData | null>(null);
  const [filteredData, setFilteredData] = useState<PostedJournalData[]>(data);
  const [filters, setFilters] = useState<FilterState>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [journalDetails, setJournalDetails] = useState<any | null>(null);
  const [clickedjournalCode, setClickedjournalCode] = useState<string | null>(
    null,
  );
  const [clickedjournalNr, setClickedjournalNr] = useState<string | null>(null);

  useEffect(() => {
    applyFilters();
  }, [filters, data]);

  const applyFilters = () => {
    let result = data;
    Object.entries(filters).forEach(([key, filter]) => {
      result = result.filter((item) => {
        const itemValue = String(
          item[key as keyof PostedJournalData],
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

  const handleRowClick = async (journalCode: string, journalNr: string) => {
    setClickedjournalCode(journalCode);
    setClickedjournalNr(journalNr);

    try {
      const response = await Api.get(
        `/FDL/PostedJournal?JournalCode=${journalCode}&JournalNr=${journalNr}`,
      );
      setJournalDetails(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Failed to fetch journal details:', error);
    }
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

  const handleUpdateSuccess = async () => {
    if (clickedjournalCode && clickedjournalNr) {
      await handleRowClick(clickedjournalCode, clickedjournalNr);

      if (journalDetails) {
        const updatedData = data.map((journal) =>
          journal.journalCode === clickedjournalCode &&
          journal.journalNr === clickedjournalNr
            ? journalDetails
            : journal,
        );
        updateUnpostedJournals(updatedData);
      }
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              {[
                'Journal Code',
                'Journal Nr',
                'Status',
                'Entry Date',
                'Entity List',
                'Min Effective Date',
                'Max Effective Date',
                'Reversal Journal Code',
                'Reversal Journal Nr',
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
              <tr
                key={item.id}
                onClick={() => handleRowClick(item.journalCode, item.journalNr)}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {item.journalCode}
                  </h5>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {item.journalNr}
                  </h5>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p className="text-black dark:text-white">{item.status}</p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p className="text-black dark:text-white">{item.entryDate}</p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {item.entityList}
                  </p>
                </td>{' '}
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {item.minEffectiveDate}
                  </p>
                </td>{' '}
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {item.maxEffectiveDate}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {item.reversalJournalCode}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {item.reversalJournalNr}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
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
      {journalDetails &&
      clickedjournalNr &&
      clickedjournalCode &&
      journalDetails.length > 0 ? (
        <FdlPostedJournalDetailsTable
          data={journalDetails}
          clickedjournalNr={clickedjournalNr}
          clickedjournalCode={clickedjournalCode}
          onUpdateSuccess={handleUpdateSuccess}
        />
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default PostedJournalsData;
