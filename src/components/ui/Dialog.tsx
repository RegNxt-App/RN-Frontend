import React from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  children,
  title,
  description,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-0 mx-auto p-5 w-full max-w-5xl">
        <div className="relative bg-white rounded-lg shadow dark:bg-boxdark">
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-600">
            <div>
              {title && (
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-meta-4 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="p-6 max-h-[calc(100vh-14rem)] overflow-y-auto">
            {children}
          </div>

          <div className="flex justify-end gap-3 p-4 border-t dark:border-gray-600">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md dark:bg-meta-4 dark:text-gray-200 dark:hover:bg-meta-4/80 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
