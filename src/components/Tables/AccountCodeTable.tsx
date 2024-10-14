import { useState } from 'react';
import Pagination from '../Pagination';
import { Edit, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';
import EditAccountCode from '../EditAccountCode';

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

const itemsPerPage = 10;

const AccountCodeTable = ({ data, onDelete, onUpdate }: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<LedgerData | null>(null);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
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
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                Ledger Code
              </th>
              <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                Account Code
              </th>
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Description
              </th>
              <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={index}>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {item.ledgerCode}
                  </h5>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  <h5 className="font-medium text-black dark:text-white">
                    {item.accountCode}
                  </h5>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <p className="text-black dark:text-white">
                    {item.description}
                  </p>
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.ledgerCode)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
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
