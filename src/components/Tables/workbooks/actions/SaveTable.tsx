import { useState } from 'react';
import Pagination from '../../../Pagination';
import Api from '../../../../utils/Api';

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
  workbookId: string;
}

const itemsPerPage = 10;

const SaveTable = ({ data, workbookId }: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleSaveToDb = async () => {
    try {
      setIsLoading(true);
      const payload = {
        cells: data,
        workbookId: workbookId,
        reason: 'User update',
      };

      const response = await Api.post('RI/Workbook/Data', payload);

      // Show success message
      alert('Data saved successfully!');
    } catch (error) {
      // Handle error appropriately
      console.error('Error saving data:', error);
      alert('Failed to save data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <button
        className={`px-4 py-2 bg-green-500 text-white rounded-md mb-4 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
        }`}
        onClick={handleSaveToDb}
        disabled={isLoading}
      >
        {isLoading ? 'Saving...' : 'Save to DB'}
      </button>
      <div className="max-w-full">
        <div className="overflow-x-auto">
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full table-auto">
              {/* Fixed header */}
              <thead className="sticky top-0 bg-gray-2 dark:bg-meta-4">
                <tr className="text-left">
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                    Cell Id
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                    Cell Code
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                    Sheet Id
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                    Row Nr
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                    Col Nr
                  </th>
                  <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                    Previous Value
                  </th>
                  <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                    New Value
                  </th>
                  <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white">
                    Comment
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={item.cellid}>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                      <h5 className="font-medium text-black dark:text-white">
                        {item.cellid}
                      </h5>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                      <h5 className="font-medium text-black dark:text-white">
                        {item.cellcode}
                      </h5>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.sheetid}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">{item.rowNr}</p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">{item.colNr}</p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.prevvalue}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.newvalue}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.comment}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default SaveTable;
