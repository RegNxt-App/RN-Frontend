import React from 'react';

interface DeleteConfirmationData {
  versionId: number;
  versionName: string;
  cellCount: number;
}

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
  deleteConfirmationData: DeleteConfirmationData | null;
  isDeleting: boolean;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
  deleteConfirmationData,
  isDeleting,
}) => {
  if (!isOpen || !deleteConfirmationData) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
      <div className="bg-white rounded-lg border border-slate-300 p-6 w-96 shadow-2xl">
        <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
        <p className="mb-4">
          You are about to delete version {deleteConfirmationData.versionId} (
          {deleteConfirmationData.versionName}). It has {deleteConfirmationData.cellCount} cells.
        </p>
        <div className="flex justify-between space-x-4">
          <button
            className="px-4 py-2 bg-red-600 text-white rounded"
            onClick={onConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
          <button
            className="px-4 py-2 bg-gray-300 text-black rounded"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDialog;
