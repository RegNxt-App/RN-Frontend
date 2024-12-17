import { useState } from 'react';
import Pagination from '../Pagination';
import { Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import EditAccountCode from '../EditAccountCode';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';

interface LedgerData {
  ledgerCode: string;
  accountCode: string;
  description: string;
}

interface DataTableProps {
  data: LedgerData[];
  onDelete: (id: string) => void;
  onUpdate: (updatedRecord: LedgerData) => void;
}

const AccountCodeTable = ({ data, onDelete, onUpdate }: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<LedgerData | null>(null);

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

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to Delete this Record!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result: any) => {
      if (result.isConfirmed) {
        onDelete(id);
        Swal.fire('Deleted!', 'Your record has been deleted.', 'success');
      }
    });
  };

  const handleEdit = (record: LedgerData) => {
    setRecordToEdit(record);
    setIsEditPopupOpen(true);
  };

  const closeEditPopup = () => {
    setIsEditPopupOpen(false);
    setRecordToEdit(null);
  };

  const handleUpdate = (updatedRecord: LedgerData) => {
    onUpdate(updatedRecord);
    closeEditPopup();
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ledger Code</TableHead>
              <TableHead>Account Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.ledgerCode}</TableCell>
                <TableCell>{item.accountCode}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit size={18} />
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-red-500"
                      onClick={() => handleDelete(item.ledgerCode)}
                    >
                      <Trash2 size={18} />
                    </Button>
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
        <EditAccountCode
          record={recordToEdit}
          onClose={closeEditPopup}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
};

export default AccountCodeTable;
