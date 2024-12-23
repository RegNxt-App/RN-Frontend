import {useState} from 'react';

import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Upload} from 'lucide-react';

const ActionsImport = () => {
  const [selectedOption, setSelectedOption] = useState<'Excel' | 'XBRL'>('Excel');
  const [file, setFile] = useState<File | null>(null);

  const handleToggle = () => {
    setSelectedOption((prev) => (prev === 'Excel' ? 'XBRL' : 'Excel'));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    console.log('File uploaded:', file);
    // Add upload handling logic here
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      {/* Toggle Button */}
      <div className="flex justify-center mb-6">
        <Button
          onClick={handleToggle}
          className={`px-4 py-2 rounded-md ${
            selectedOption === 'Excel' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-black'
          } mr-2`}
        >
          Excel
        </Button>
        <Button
          onClick={handleToggle}
          className={`px-4 py-2 rounded-md ${
            selectedOption === 'XBRL' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-black'
          }`}
        >
          XBRL
        </Button>
      </div>

      {/* Drag & Drop File Section */}
      <div className="flex flex-col items-center justify-center border-dashed border-2 border-gray-300 rounded-lg py-6 px-4 mb-6">
        <Upload
          size={40}
          className="text-gray-500 mb-4"
        />
        <p className="text-gray-500 mb-4">Drag and drop a file here or click to select a file</p>
        <input
          type="file"
          accept={selectedOption === 'Excel' ? '.xlsx,.xls' : '.xbrl'}
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <Label
          htmlFor="file-upload"
          // className="px-4 py-2 bg-green-500 text-white rounded-md cursor-pointer"
        >
          Choose File
        </Label>
      </div>

      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        className="bg-purple-500 text-white w-full"
      >
        {selectedOption === 'Excel' ? 'React Excel' : 'React XBRL'}
      </Button>
    </div>
  );
};

export default ActionsImport;
