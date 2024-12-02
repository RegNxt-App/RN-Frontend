import { useState, useMemo, useEffect } from 'react';
import Pagination from '../../../Pagination';
import ViewLayer from './ViewLayer';
import Api from '../../../../utils/Api';
import { Dialog } from '../../../ui/Dialog';
import DeleteDialog from './DeleteDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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
      setIsModalOpen(true); // Open modal when version is selected
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
      setIsDeleteDialogOpen(true); // Open delete confirmation dialog
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version Id</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Modifier</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.map((item) => (
                    <TableRow key={item.versionId}>
                      <TableCell>{item.versionId}</TableCell>
                      <TableCell>{item.from}</TableCell>
                      <TableCell>{item.to}</TableCell>
                      <TableCell>{item.reason}</TableCell>
                      <TableCell>{item.modifier}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-3.5">
                          <Button
                            className="text-white bg-purple hover:bg-white hover:text-purple border hover:border-purple"
                            onClick={() => handleView(item)}
                          >
                            View
                          </Button>
                          {item.versionId !== 1 && (
                            <Button
                              className="text-white bg-red-500 hover:bg-white hover:text-red-500 border hover:border-red-500"
                              onClick={() => handleDelete(item)}
                              disabled={isDeleting}
                            >
                              {isDeleting ? 'Removing...' : 'Remove'}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
              className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md dark:bg-meta-4 dark:text-gray-200 dark:hover:bg-meta-3"
              onClick={handleCloseModal}
            >
              Close
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
      {/* <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Confirm Deletion"
        description="Are you sure you want to delete this version?"
      >
        <div className="p-4">
          <p>
            You are about to delete version{' '}
            {deleteConfirmationData?.version.versionId}. It has{' '}
            {deleteConfirmationData?.cellCount} cells.
          </p>
          <div className="mt-4 flex justify-between space-x-4">
            <button
              className="px-4 py-2 bg-red-600 text-white rounded"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
            <button
              className="px-4 py-2 bg-gray-300 text-black rounded"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </Dialog> */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirmDelete={handleConfirmDelete}
        deleteConfirmationData={deleteConfirmationData}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default LayersTable;
