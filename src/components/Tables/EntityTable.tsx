import { useState, useEffect } from 'react';

import Pagination from '../Pagination';
import UpdateEntityModel from '../CModels/EntityModels/UpdateEntityModel';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface WorkbookData {
  id: number;
  code: string;
  label: string;
  country: string;
  city: string;
  identificationType: string;
  vat: string;
  bicCode: string;
  kboCode: string;
  lei: string;
  reportingCurrency: string;
  significantCurrencies?: string[];
  email: string;
}

interface DataTableProps {
  data: WorkbookData[];
  onDataChange: () => void;
}

const EntityTable = ({ data, onDataChange }: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<WorkbookData | null>(
    null,
  );
  const [tableData, setTableData] = useState<WorkbookData[]>(data);
  useEffect(() => {
    setTableData(data);
  }, [data]);
  const indexOfLastItem = (currentPage + 1) * pageSize;
  const indexOfFirstItem = indexOfLastItem - pageSize;
  const currentItems = tableData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(tableData.length / pageSize);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
  };

  const handleEditClick = (record: WorkbookData) => {
    setSelectedRecord(record);
    setShowUpdatePopup(true);
  };

  const handleCloseUpdatePopup = () => {
    setShowUpdatePopup(false);
    setSelectedRecord(null);
  };
  const handleUpdateRecord = () => {
    onDataChange();
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Label</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Identification Type</TableHead>
              <TableHead>VAT</TableHead>
              <TableHead>BIC Code</TableHead>
              <TableHead>KBO Code</TableHead>
              <TableHead>LEI Code</TableHead>
              <TableHead>Reporting Currency</TableHead>
              <TableHead>Significant Currencies</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell>{item.code}</TableCell>
                <TableCell>{item.label}</TableCell>
                <TableCell>{item.country}</TableCell>
                <TableCell>{item.city}</TableCell>
                <TableCell>{item.identificationType}</TableCell>
                <TableCell>{item.vat}</TableCell>
                <TableCell>{item.bicCode}</TableCell>
                <TableCell>{item.kboCode}</TableCell>
                <TableCell>{item.lei}</TableCell>
                <TableCell>{item.reportingCurrency}</TableCell>
                <TableCell>
                  {item.significantCurrencies &&
                  Array.isArray(item.significantCurrencies)
                    ? item.significantCurrencies.join(', ')
                    : 'N/A'}
                </TableCell>
                <TableCell>{item.email}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3.5">
                    <button
                      className="hover:text-primary"
                      onClick={() => handleEditClick(item)}
                    >
                      Edit
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

      {showUpdatePopup && selectedRecord && (
        <UpdateEntityModel
          existingData={selectedRecord}
          onClose={handleCloseUpdatePopup}
          onUpdate={handleUpdateRecord}
        />
      )}
    </div>
  );
};

export default EntityTable;
