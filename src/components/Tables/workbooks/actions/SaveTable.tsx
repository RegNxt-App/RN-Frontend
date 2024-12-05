import { useState } from 'react';
import Pagination from '../../../Pagination';
import Api from '../../../../utils/Api';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface SaveTableData {
  cellid: number;
  cellcode: string;
  sheetid: number;
  rowNr: number;
  colNr: number;
  prevvalue: string;
  newvalue: string;
  comment: string;
}

interface DataTableProps {
  data: SaveTableData[];
  workbookId: number;
  onSuccess?: () => void;
}

const itemsPerPage = 10;

const SaveTable = ({ data, workbookId, onSuccess }: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [pageSize, setPageSize] = useState(1);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
  };
  const handleSaveToDb = async () => {
    if (!data.length) return;

    setIsLoading(true);

    Swal.fire({
      title: 'Saving Data',
      text: 'Please wait...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const payload = {
        cells: data,
        workbookId: workbookId,
        reason: 'User update',
      };

      console.log('Sending payload:', JSON.stringify(payload, null, 2));

      const response = await Api.post('RI/Workbook/Data', payload);
      console.log('API Response:', response);

      if (response.status === 200) {
        // Close loading dialog
        Swal.close();

        // Show success message
        // Swal.fire({
        //   icon: 'success',
        //   title: 'Success!',
        //   text: 'Data has been saved successfully',
        //   confirmButtonColor: '#22C55E',
        //   allowOutsideClick: false,
        //   customClass: {
        //     popup: 'z-999999',
        //     backdrop: 'swal2-backdrop-show z-99999',
        //     container: 'z-999999',
        //   },
        // });

        // Call success callback
        onSuccess?.();
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error: any) {
      // Close loading dialog
      Swal.close();

      console.error('Save Error:', error);

      // Show error message
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:
          error.response?.data?.message ||
          'Failed to save data. Please try again.',
        confirmButtonColor: '#EF4444',
        allowOutsideClick: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = isLoading || data.length === 0;
  const buttonText = isLoading
    ? 'Saving...'
    : data.length === 0
      ? 'No Data to Save'
      : 'Save to DB';

  return (
    <div className="flex flex-col h-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="px-5 py-4 sm:px-7.5">
        <Button
          className={`
            ${
              isButtonDisabled
                ? 'bg-purple-500 cursor-not-allowed opacity-60'
                : 'bg-purple-500 hover:bg-indigo-800	'
            } text-white
          `}
          onClick={handleSaveToDb}
          disabled={isButtonDisabled}
          title={
            data.length === 0
              ? 'No data available to save'
              : 'Save data to database'
          }
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>{buttonText}</span>
            </div>
          ) : (
            buttonText
          )}
        </Button>
      </div>

      {/* <div className="flex-1 overflow-hidden px-5 sm:px-7.5"> */}
      {/* <div className="relative max-h-full"> */}
      {/* <div className="absolute inset-0 overflow-auto"> */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cell Id</TableHead>
            <TableHead>Cell Code</TableHead>
            <TableHead>Sheet Id</TableHead>
            <TableHead>Row Nr</TableHead>
            <TableHead>Col Nr</TableHead>
            <TableHead>Previous Value</TableHead>
            <TableHead>New Value</TableHead>
            <TableHead>Comment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((item) => (
            <TableRow key={item.cellid}>
              <TableCell>{item.cellid}</TableCell>
              <TableCell>{item.cellcode}</TableCell>
              <TableCell>{item.sheetid}</TableCell>
              <TableCell>{item.rowNr}</TableCell>
              <TableCell>{item.colNr}</TableCell>
              <TableCell>{item.prevvalue}</TableCell>
              <TableCell>{item.newvalue}</TableCell>
              <TableCell>{item.comment}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* </div> */}
      {/* </div> */}
      {/* </div> */}

      <div className="px-5 py-4 sm:px-7.5">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageSizeChange={handlePageSizeChange}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default SaveTable;
