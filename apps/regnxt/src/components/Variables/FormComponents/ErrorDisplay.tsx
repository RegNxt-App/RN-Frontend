import React from 'react';

interface VariableErrorProps {
  message: string;
}

const VariableError: React.FC<VariableErrorProps> = ({message}) => (
  <div className="p-6 text-center">
    <div className="bg-red-50 p-4 rounded-md text-red-500 inline-block">
      <p className="font-medium">Error loading data</p>
      <p>{message}</p>
    </div>
  </div>
);

export default VariableError;
