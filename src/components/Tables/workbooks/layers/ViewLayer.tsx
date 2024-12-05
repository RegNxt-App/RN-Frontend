import { useState } from 'react';

import Pagination from '../../../Pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface LayersTableData {
  workbookId: number;
  sheetId: number;
  versionId: number;
  cellId: number;
  rowNr: number;
  colNr: number;
  cellValue: string;
  isInvalid: boolean;
  invalidReason: string;
  modifierId: number;
  modificationTime: string;
}

interface DataTableProps {
  data: LayersTableData[];
  onView?: (version: LayersTableData) => void;
  onRemove?: (versionId: number) => void;
}

const ViewLayer = ({ data, onView, onRemove }: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const indexOfLastItem = (currentPage + 1) * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(data.length / pageSize); // Use filteredData for totalPages

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0); // Reset to first page when page size changes
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString();
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full">
        <div className="overflow-x-auto">
          <div className="max-h-[580px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sheet ID</TableHead>
                  <TableHead>Cell ID</TableHead>
                  <TableHead>Row Nr</TableHead>
                  <TableHead>Col Nr</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Invalid Reason</TableHead>
                  <TableHead>Modifier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((item) => (
                  <TableRow
                    key={`${item.workbookId}-${item.sheetId}-${item.cellId}`}
                  >
                    <TableCell>{item.sheetId}</TableCell>
                    <TableCell>{item.cellId}</TableCell>
                    <TableCell>{item.rowNr}</TableCell>
                    <TableCell>{item.colNr}</TableCell>
                    <TableCell>{item.cellValue}</TableCell>
                    <TableCell>{item.invalidReason || '-'}</TableCell>
                    <TableCell>{item.modifierId}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
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

export default ViewLayer;
