import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import WorkbookView from '../WorkbookView';
import ViewRecordPopup from '../ViewRecordPopup';
import { cn } from '@/lib/utils';

interface WorkbookData {
  id: number;
  name: string;
  template: string;
  templateId: number;
  reportSubsetId: number;
  module: string;
  entity: string;
  reportingCurrency: string;
  reportingDate: number;
  status: string;
}

interface DataTableProps {
  data: WorkbookData[];
}

const DataTable = ({ data }: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showWorkbookPopup, setShowWorkbookPopup] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<WorkbookData | null>(
    null,
  );

  const pageCount = Math.ceil(data.length / pageSize);
  const start = currentPage * pageSize;
  const end = start + pageSize;
  const currentItems = data.slice(start, end);

  const handleViewClick = (record: WorkbookData) => {
    setSelectedRecord(record);
    setShowWorkbookPopup(true);
  };

  return (
    <div className="space-y-4 rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-2 dark:bg-meta-4">
              <TableHead className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                Module
              </TableHead>
              <TableHead className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                Entity
              </TableHead>
              <TableHead className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Reporting Date
              </TableHead>
              <TableHead className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                Name
              </TableHead>
              <TableHead className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Status
              </TableHead>
              <TableHead className="py-4 px-4 font-medium text-black dark:text-white">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {item.module}
                  </h5>
                </TableCell>
                <TableCell className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {item.entity}
                  </h5>
                </TableCell>
                <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {item.reportingDate}
                  </p>
                </TableCell>
                <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p className="text-black dark:text-white">{item.name}</p>
                </TableCell>
                <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p
                    className={cn(
                      'inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium',
                      item.status === 'Initial'
                        ? 'bg-warning text-warning'
                        : 'bg-success text-success',
                    )}
                  >
                    {item.status}
                  </p>
                </TableCell>
                <TableCell className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <div className="flex items-center space-x-3.5">
                    <WorkbookView workbook={item} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-center px-2 pb-2">
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={`${pageSize}`}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(0);
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 50, 100].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {currentPage + 1} of {pageCount}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setCurrentPage(0)}
              disabled={currentPage === 0}
            >
              {'<<'}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() =>
                setCurrentPage((current) => Math.max(0, current - 1))
              }
              disabled={currentPage === 0}
            >
              {'<'}
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() =>
                setCurrentPage((current) =>
                  Math.min(pageCount - 1, current + 1),
                )
              }
              disabled={currentPage === pageCount - 1}
            >
              {'>'}
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setCurrentPage(pageCount - 1)}
              disabled={currentPage === pageCount - 1}
            >
              {'>>'}
            </Button>
          </div>
        </div>
      </div>

      {showWorkbookPopup && selectedRecord && (
        <ViewRecordPopup
          onClose={() => setShowWorkbookPopup(false)}
          record={selectedRecord}
        />
      )}
    </div>
  );
};

export default DataTable;
