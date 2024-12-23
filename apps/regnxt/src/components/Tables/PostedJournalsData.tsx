import {useEffect, useState} from 'react';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Filter} from 'lucide-react';

import Api from '../../utils/Api';
import {Popover, PopoverContent, PopoverTrigger} from '../ui/popover';
import FdlPostedJournalDetailsTable from './FdlPostedJournalDetailsTable';

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

const PostedJournalsData = ({data, updateUnpostedJournals}: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState<PostedJournalData[]>(data);
  const [filters, setFilters] = useState<FilterState>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [journalDetails, setJournalDetails] = useState<any | null>(null);
  const [clickedjournalCode, setClickedjournalCode] = useState<string | null>(null);
  const [clickedjournalNr, setClickedjournalNr] = useState<string | null>(null);

  useEffect(() => {
    applyFilters();
  }, [filters, data]);

  const applyFilters = () => {
    let result = data;
    Object.entries(filters).forEach(([key, filter]) => {
      result = result.filter((item) => {
        const itemValue = String(item[key as keyof PostedJournalData]).toLowerCase();
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
      const response = await Api.get(`/FDL/PostedJournal?JournalCode=${journalCode}&JournalNr=${journalNr}`);
      setJournalDetails(response.data);
    } catch (error) {
      console.error('Failed to fetch journal details:', error);
    }
  };

  const handleUpdateSuccess = async () => {
    if (clickedjournalCode && clickedjournalNr) {
      await handleRowClick(clickedjournalCode, clickedjournalNr);

      if (journalDetails) {
        const updatedData = data.map((journal) =>
          journal.journalCode === clickedjournalCode && journal.journalNr === clickedjournalNr
            ? journalDetails
            : journal
        );
        updateUnpostedJournals(updatedData);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md mt-6">
        <Table>
          <TableHeader>
            <TableRow>
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
                <TableHead key={header}>
                  <div className="flex items-center gap-2">
                    {header}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 p-0"
                        >
                          <Filter className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <Select
                            value={filters[header.toLowerCase()]?.type || 'matchAll'}
                            onValueChange={(value) =>
                              handleFilterChange(
                                header.toLowerCase(),
                                value as FilterType,
                                filters[header.toLowerCase()]?.value || ''
                              )
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select match type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="matchAll">Match All</SelectItem>
                              <SelectItem value="matchAny">Match Any</SelectItem>
                              <SelectItem value="startsWith">Starts With</SelectItem>
                              <SelectItem value="Contains">Contains</SelectItem>
                              <SelectItem value="NotContains">Not Contains</SelectItem>
                              <SelectItem value="EndsWith">Ends With</SelectItem>
                              <SelectItem value="Equals">Equals</SelectItem>
                              <SelectItem value="NotEquals">Not Equals</SelectItem>
                            </SelectContent>
                          </Select>

                          <Input
                            placeholder="Search..."
                            value={filters[header.toLowerCase()]?.value || ''}
                            onChange={(e) =>
                              handleFilterChange(
                                header.toLowerCase(),
                                filters[header.toLowerCase()]?.type || 'matchAll',
                                e.target.value
                              )
                            }
                          />

                          <div className="flex justify-between">
                            <Button
                              variant="outline"
                              onClick={() => clearFilter(header.toLowerCase())}
                            >
                              Clear
                            </Button>
                            <Button onClick={() => setActiveFilter(null)}>Apply</Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((item) => (
              <TableRow
                key={item.id}
                onClick={() => handleRowClick(item.journalCode, item.journalNr)}
                className="cursor-pointer"
              >
                <TableCell>{item.journalCode}</TableCell>
                <TableCell>{item.journalNr}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>{item.entryDate}</TableCell>
                <TableCell>{item.entityList}</TableCell>
                <TableCell>{item.minEffectiveDate}</TableCell>
                <TableCell>{item.maxEffectiveDate}</TableCell>
                <TableCell>{item.reversalJournalCode}</TableCell>
                <TableCell>{item.reversalJournalNr}</TableCell>
                <TableCell>{item.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          {`${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, filteredData.length)} of ${
            filteredData.length
          } entries`}
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${itemsPerPage}`}
              onValueChange={(value) => {
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={itemsPerPage} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 50].map((size) => (
                  <SelectItem
                    key={size}
                    value={size.toString()}
                  >
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              {'<<'}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {'<'}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              {'>'}
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              {'>>'}
            </Button>
          </div>
        </div>
      </div>

      {journalDetails && clickedjournalNr && clickedjournalCode && journalDetails.length > 0 && (
        <FdlPostedJournalDetailsTable
          data={journalDetails}
          clickedjournalNr={clickedjournalNr}
          clickedjournalCode={clickedjournalCode}
          onUpdateSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
};

export default PostedJournalsData;
