import { useState, useMemo, useEffect } from 'react';
import Pagination from '../../../Pagination';
import ViewLayer from './ViewLayer';
import Api from '../../../../utils/Api';
import { Dialog } from '../../../ui/Dialog';
interface LayersTableData {
  versionId: number;
  from: string;
  to: string;
  reason: string;
  modifier: string;
}

interface VersionDetailData {
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
  workbookId: string | number;
  onRemove?: (versionId: number) => void;
  onDataChange?: () => void;
}
interface DeleteConfirmationData {
  version: LayersTableData;
  cellCount: number;
}
const itemsPerPage = 5;

const LayersTable = ({ data, workbookId, onDataChange }: DataTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [versionDetails, setVersionDetails] = useState<VersionDetailData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedVersion, setSelectedVersion] =
    useState<LayersTableData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmationData, setDeleteConfirmationData] =
    useState<DeleteConfirmationData | null>(null);

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => a.versionId - b.versionId);
  }, [data]);

  useEffect(() => {
    const maxPage = Math.ceil(sortedData.length / itemsPerPage);
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(maxPage);
    }
  }, [sortedData.length, currentPage]);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleView = async (version: LayersTableData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSelectedVersion(version);

      const response = await Api.get(
        `/RI/Workbook/version/data?workbookId=${workbookId}&versionId=${version.versionId}`,
      );

      const detailsData = Array.isArray(response.data)
        ? response.data
        : [response.data];
      setVersionDetails(detailsData);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching version details:', err);
      setError('Failed to fetch version details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVersion(null);
    setVersionDetails([]);
    setError(null);
  };
  const handleDelete = async (version: LayersTableData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await Api.get(
        `/RI/Workbook/version/data?workbookId=${workbookId}&versionId=${version.versionId}`,
      );

      const versionData = Array.isArray(response.data)
        ? response.data
        : [response.data];

      setDeleteConfirmationData({
        version,
        cellCount: versionData.length,
      });
      setIsDeleteDialogOpen(true);
    } catch (err) {
      console.error('Error fetching version details:', err);
      setError('Failed to fetch version details for deletion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmationData) return;

    try {
      setIsDeleting(true);
      setError(null);

      await Api.delete(
        `/RI/Workbook/version?workbookId=${workbookId}&versionId=${deleteConfirmationData.version.versionId}`,
      );

      // Close the dialog before refreshing data
      setIsDeleteDialogOpen(false);
      setDeleteConfirmationData(null);

      // Refresh the data
      if (onDataChange) {
        await onDataChange();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete version');
      console.error('Error deleting version:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Close delete dialog if there's an error
  useEffect(() => {
    if (error) {
      setIsDeleteDialogOpen(false);
      setDeleteConfirmationData(null);
    }
  }, [error]);

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <div className="max-w-full">
          <div className="overflow-x-auto">
            <div className="max-h-[580px] overflow-y-auto">
              <table className="w-full table-auto relative">
                <thead className="sticky top-0 bg-gray-2 dark:bg-meta-4 z-10">
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="min-w-[80px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                      Version Id
                    </th>
                    <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                      From
                    </th>
                    <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                      To
                    </th>
                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                      Reason
                    </th>
                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                      Modifier
                    </th>
                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item) => (
                    <tr key={item.versionId}>
                      <td className="border-b border-[#eee] py-3 px-2 pl-9 dark:border-strokedark xl:pl-11">
                        <h5 className="font-medium text-black dark:text-white">
                          {item.versionId}
                        </h5>
                      </td>
                      <td className="border-b border-[#eee] py-3 px-2 pl-9 dark:border-strokedark xl:pl-11">
                        <h5 className="font-medium text-black dark:text-white">
                          {item.from}
                        </h5>
                      </td>
                      <td className="border-b border-[#eee] py-3 px-2 dark:border-strokedark">
                        <p className="text-black dark:text-white">{item.to}</p>
                      </td>
                      <td className="border-b border-[#eee] py-3 px-2 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {item.reason}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] py-3 px-2 dark:border-strokedark">
                        <p className="text-black dark:text-white">
                          {item.modifier}
                        </p>
                      </td>
                      <td className="border-b border-[#eee] py-3 px-2 dark:border-strokedark">
                        <div className="flex items-center justify-center space-x-3.5">
                          <button
                            className="inline-flex items-center justify-center rounded-md border border-blue-500 py-1 text-center font-medium text-blue-500 hover:bg-blue-500 hover:text-white lg:px-4 xl:px-6"
                            onClick={() => handleView(item)}
                          >
                            View
                          </button>
                          {item.versionId !== 1 && (
                            <button
                              className="inline-flex items-center justify-center rounded-md border border-red-500 py-1 text-center font-medium text-red-500 hover:bg-red-500 hover:text-white lg:px-4 xl:px-6"
                              onClick={() => handleDelete(item)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? 'Removing...' : 'Remove'}
                            </button>
                          )}
                        </div>
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

      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        title={`Version Details ${selectedVersion?.versionId}`}
        description={`Viewing details for version from ${selectedVersion?.from} to ${selectedVersion?.to}`}
      >
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-red-500 p-4 text-center">
            <p>{error}</p>
            <button
              className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md dark:bg-meta-4 dark:text-gray-200 dark:hover:bg-meta-4/80 transition-colors"
              onClick={() => selectedVersion && handleView(selectedVersion)}
            >
              Retry
            </button>
          </div>
        ) : (
          <ViewLayer
            data={versionDetails}
            onView={() => {}}
            onRemove={() => {}}
          />
        )}
      </Dialog>
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteDialogOpen(false);
            setDeleteConfirmationData(null);
          }
        }}
        title="Confirm Delete"
      >
        <div className="p-6">
          <p className="text-base text-gray-700 dark:text-gray-300">
            Are you sure you want to remove the changes related to version{' '}
            <span className="font-semibold">
              {deleteConfirmationData?.version.versionId}
            </span>
            ? This will reverse{' '}
            <span className="font-semibold">
              {deleteConfirmationData?.cellCount}
            </span>{' '}
            cells!
          </p>

          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeleteConfirmationData(null);
              }}
              disabled={isDeleting}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:bg-red-300"
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default LayersTable;
