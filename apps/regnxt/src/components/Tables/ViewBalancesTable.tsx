import {useState} from 'react';

import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';

import Pagination from '../Pagination';

interface ViewBalanceData {
  id: number;
  accountcode: string;
  amountclass: string;
  domainid: number;
  currency: string;
  dtdlclamount: number;
  ytdlclamount: number;
  ltdlclamount: number;
}

interface DataTableProps {
  data: ViewBalanceData[];
}

const ViewBalanceData = ({data}: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const indexOfLastItem = (currentPage + 1) * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(data.length / pageSize);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Code</TableHead>
              <TableHead>Amount Class</TableHead>
              <TableHead>Domain Id</TableHead>
              <TableHead>Currency</TableHead>
              <TableHead>Dtdlcl Amount</TableHead>
              <TableHead>Ytdlcl Amount</TableHead>
              <TableHead>Ltdlcl Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.accountcode}</TableCell>
                <TableCell>{item.amountclass}</TableCell>
                <TableCell>{item.domainid}</TableCell>
                <TableCell>{item.currency}</TableCell>
                <TableCell>{item.dtdlclamount}</TableCell>
                <TableCell>{item.ytdlclamount}</TableCell>
                <TableCell>{item.ltdlclamount}</TableCell>
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

export default ViewBalanceData;
