import React, { useState, useEffect } from 'react';
import Api from '../../../../utils/Api';
import { Button } from '@/components/ui/button';

interface ActionsTransmissionProps {
  workbookId: string | number;
}

interface ApiResponse {
  data: boolean;
  headers: {
    'content-disposition'?: string;
  };
}

const ActionsTransmission: React.FC<ActionsTransmissionProps> = ({
  workbookId,
}) => {
  const [transmissionfileReady, setTransmissionfileReady] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkFileStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await Api.get(
          `/RT/xbrl/filecheck?workbookId=${workbookId}`,
        );
        setTransmissionfileReady(response.data);
      } catch (error) {
        console.error('Error checking file status:', error);
        setError('Failed to check file status');
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
      setError(null);

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

        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const response = await Api.get(`/RT/xbrl?workbookId=${workbookId}`);

        if (response.status === 200) {
          setTransmissionfileReady(true);
        } else {
          setError('File generation failed');
          setTransmissionfileReady(false);
        }
      }
    } catch (error) {
      console.error('Error handling transmission file:', error);
      setError('Failed to process file');
      setTransmissionfileReady(false);
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
      <Button
        className="bg-purple-500 text-white"
        onClick={handleButtonClick}
        disabled={isLoading || isProcessing}
      >
        {getButtonText()}
      </Button>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
};

export default ActionsTransmission;
