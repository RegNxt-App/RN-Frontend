import { useState } from 'react';
import Pagination from '../Pagination';

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
  leiCode: string;
  reportingCurrency: string;
  significantCurrencies: string[];
  email: string;
}

interface DataTableProps {
  data: WorkbookData[];
}

const itemsPerPage = 10;

const EntityTable = ({ data }: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showWorkbookPopup, setShowWorkbookPopup] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<WorkbookData | null>(
    null,
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleViewClick = (record: WorkbookData) => {
    setSelectedRecord(record);
    setShowWorkbookPopup(true);
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
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                Code
              </th>
              <th className="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white">
                Label
              </th>
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Country
              </th>
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                City
              </th>
              <th className="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white">
                Identification Type
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                VAT
              </th>
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                BIC Code
              </th>
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                KBO Code
              </th>
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                LEI Code
              </th>
              <th className="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white">
                Reporting Currency
              </th>
              <th className="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white">
                Significant Currencies
              </th>
              <th className="min-w-[250px] py-4 px-4 font-medium text-black dark:text-white">
                Email
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
                <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
                  {item.code}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  {item.label}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  {item.country}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  {item.city}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  {item.identificationType}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  {item.vat}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  {item.bicCode}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  {item.kboCode}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  {item.leiCode}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  {item.reportingCurrency}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  {item.significantCurrencies.join(', ')}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  {item.email}
                </td>
                <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                  <div className="flex items-center space-x-3.5">
                    <button
                      className="hover:text-primary"
                      onClick={() => handleViewClick(item)}
                    >
                      View
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
    </div>
  );
};

export default EntityTable;
