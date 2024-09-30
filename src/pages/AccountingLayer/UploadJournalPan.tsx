import React, { useState } from 'react';
import { Upload, ChevronUp, ChevronDown, Plus, Minus } from 'lucide-react';

const UploadPan: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePan = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="w-full">
      <div
        className={`bg-white shadow-md rounded-t-lg overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'h-74' : 'h-12'
        }`}
      >
        <div
          className="flex items-center justify-between px-4 py-3 bg-gray-100 cursor-pointer"
          onClick={togglePan}
        >
          <span className="font-semibold text-gray-700">Journal Upload</span>
          {isOpen ? (
            <Minus className="w-5 h-5 text-gray-600" />
          ) : (
            <Plus className="w-5 h-5 text-gray-600" />
          )}
        </div>
        <div className="p-4">
          <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-lg">
            <Upload className="w-12 h-20 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 text-center">
              Drag and drop files here to upload
            </p>
          </div>
          <button className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out">
            Upload Journal
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadPan;
