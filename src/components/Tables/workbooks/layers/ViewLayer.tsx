import { useState } from 'react';
import Pagination from '../../../Pagination';

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

const itemsPerPage = 5;

const ViewLayer = ({ data, onView, onRemove }: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString();
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="max-w-full">
        <div className="overflow-x-auto">
          <div className="max-h-[580px] overflow-y-auto">
            <table className="w-full table-auto relative">
              <thead className="sticky top-0 bg-gray-2 dark:bg-meta-4 z-10">
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  {/* <th className="min-w-[80px] py-4 px-2 font-medium text-black dark:text-white">
                    Workbook ID
                  </th> */}
                  <th className="min-w-[80px] py-4 px-2 font-medium text-black dark:text-white">
                    Sheet ID
                  </th>
                  {/* <th className="min-w-[80px] py-4 px-2 font-medium text-black dark:text-white">
                    Version ID
                  </th> */}
                  <th className="min-w-[80px] py-4 px-2 font-medium text-black dark:text-white">
                    Cell ID
                  </th>
                  <th className="min-w-[80px] py-4 px-2 font-medium text-black dark:text-white">
                    Row Nr
                  </th>
                  <th className="min-w-[80px] py-4 px-2 font-medium text-black dark:text-white">
                    Col Nr
                  </th>
                  <th className="min-w-[120px] py-4 px-2 font-medium text-black dark:text-white">
                    Value
                  </th>
                  {/* <th className="min-w-[90px] py-4 px-2 font-medium text-black dark:text-white">
                    Status
                  </th> */}
                  <th className="min-w-[150px] py-4 px-2 font-medium text-black dark:text-white">
                    Invalid Reason
                  </th>
                  <th className="min-w-[100px] py-4 px-2 font-medium text-black dark:text-white">
                    Modifier
                  </th>
                  {/* <th className="min-w-[150px] py-4 px-2 font-medium text-black dark:text-white">
                    Modified Time
                  </th> */}
                  {/* <th className="min-w-[150px] py-4 px-2 font-medium text-black dark:text-white text-center">
                    Actions
                  </th> */}
                </tr>
              </thead>
              <tbody>
                {currentItems.map((item) => (
                  <tr key={`${item.workbookId}-${item.sheetId}-${item.cellId}`}>
                    {/* <td className="border-b border-[#eee] py-3 px-2 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.workbookId}
                      </p>
                    </td> */}
                    <td className="border-b border-[#eee] py-3 px-2 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.sheetId}
                      </p>
                    </td>
                    {/* <td className="border-b border-[#eee] py-3 px-2 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.versionId}
                      </p>
                    </td> */}
                    <td className="border-b border-[#eee] py-3 px-2 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.cellId}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-3 px-2 dark:border-strokedark">
                      <p className="text-black dark:text-white">{item.rowNr}</p>
                    </td>
                    <td className="border-b border-[#eee] py-3 px-2 dark:border-strokedark">
                      <p className="text-black dark:text-white">{item.colNr}</p>
                    </td>
                    <td className="border-b border-[#eee] py-3 px-2 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.cellValue}
                      </p>
                    </td>
                    {/* <td className="border-b border-[#eee] py-3 px-2 dark:border-strokedark">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                          item.isInvalid
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        }`}
                      >
                        {item.isInvalid ? 'Invalid' : 'Valid'}
                      </span>
                    </td> */}
                    <td className="border-b border-[#eee] py-3 px-2 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.invalidReason || '-'}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] py-3 px-2 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {item.modifierId}
                      </p>
                    </td>
                    {/* <td className="border-b border-[#eee] py-3 px-2 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {formatDateTime(item.modificationTime)}
                      </p>
                    </td> */}
                    {/* <td className="border-b border-[#eee] py-3 px-2 dark:border-strokedark">
                      <div className="flex items-center justify-center space-x-3.5">
                        <button
                          className="inline-flex items-center justify-center rounded-md border border-blue-500 py-1 text-center font-medium text-blue-500 hover:bg-blue-500 hover:text-white lg:px-4 xl:px-6"
                          onClick={() => onView?.(item)}
                        >
                          View
                        </button>
                        <button
                          className="inline-flex items-center justify-center rounded-md border border-red-500 py-1 text-center font-medium text-red-500 hover:bg-red-500 hover:text-white lg:px-4 xl:px-6"
                          onClick={() => onRemove?.(item.versionId)}
                        >
                          Remove
                        </button>
                      </div>
                    </td> */}
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

export default ViewLayer;
