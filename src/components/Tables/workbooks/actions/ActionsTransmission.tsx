import React, { useState, useEffect } from 'react';
import Api from '../../../../utils/Api';

const ActionsTransmission = ({ workbookId }) => {
  const [transmissionfileReady, setTransmissionfileReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const checkFileStatus = async () => {
      try {
        setIsLoading(true);
        const response = await Api.get(
          `/RT/xbrl/filecheck?workbookId=${workbookId}`,
        );
        setTransmissionfileReady(response.data);
      } catch (error) {
        console.error('Error checking file status:', error);
        setTransmissionfileReady(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkFileStatus();
  }, [workbookId]);

  const handleButtonClick = async () => {
    try {
      setIsProcessing(true);

      if (transmissionfileReady) {
        const response = await Api.get(
          `/RT/xbrl/file?workbookId=${workbookId}&zip=true`,
          {
            responseType: 'blob',
            headers: {
              Accept: 'application/octet-stream',
            },
          },
        );

        const contentDisposition = response.headers['content-disposition'];
        const filename = contentDisposition
          ? contentDisposition
              .split(';')[1]
              .trim()
              .split('=')[1]
              .replace(/"/g, '')
          : 'transmission-file.zip';

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();

        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const response = await Api.get(`/RT/xbrl?workbookId=${workbookId}`);
        setTransmissionfileReady(response);
      }
    } catch (error) {
      console.error('Error handling transmission file:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getButtonText = () => {
    if (isLoading) return 'Loading...';
    if (isProcessing)
      return transmissionfileReady ? 'Downloading...' : 'Generating...';
    return transmissionfileReady
      ? 'Download Transmission File'
      : 'Generate Transmission File';
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <button
        className="px-4 py-2 bg-green-500 text-white rounded-md mb-4 disabled:opacity-50 hover:bg-green-600 transition-colors"
        onClick={handleButtonClick}
        disabled={isLoading || isProcessing}
      >
        {getButtonText()}
      </button>
    </div>
  );
};

export default ActionsTransmission;
