import { useState } from 'react';
import Pagination from '../Pagination';
import UpdateTemplateModel from '../CModels/TemplateModels/UpdateTemplateModel';

interface TemplateData {
  id: number;
  name: string;
  reportGroupId: number;
  reportGroupCode: string;
  reportSetId: number;
  reportSetCode: string;
  reportSubsetId: number;
  reportSubsetCode: string;
}

interface DataTableProps {
  data: TemplateData[];
}

const itemsPerPage = 10;

const TemplateTable = ({ data }: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TemplateData | null>(
    null,
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleEditClick = (record: TemplateData) => {
    setSelectedRecord(record);
    setShowUpdatePopup(true);
  };

  const handleCloseUpdatePopup = () => {
    setShowUpdatePopup(false);
    setSelectedRecord(null);
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                Id
              </th>
              <th className="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white">
                Name
              </th>
              <th className="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white">
                Report Group
              </th>
              <th className="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white">
                Report Set
              </th>
              <th className="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white">
                Report Subset
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {currentItems.map((item) => (
              <tr key={item.id}>
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  {item.id}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  {item.name || 'N/A'}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  {item.reportGroupCode}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  {item.reportSetCode}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  {item.reportSubsetCode}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <div className="flex items-center space-x-3.5">
                    <button
                      className="hover:text-primary"
                      onClick={() => handleEditClick(item)}
                    >
                      Edit
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

      {showUpdatePopup && selectedRecord && (
        <UpdateTemplateModel
          existingData={selectedRecord}
          onClose={handleCloseUpdatePopup}
        />
      )}
    </div>
  );
};

export default TemplateTable;
