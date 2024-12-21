import React from 'react';

const NotFoundMessage: React.FC = () => {
  return (
    <div className="mt-20 flex flex-col items-center justify-center">
      <img
        src="/not-found.svg"
        alt="not-found"
        width={250}
      />
      <h2 className="mt-4 text-2xl font-semibold">No results found</h2>
      <p className="mt-2 text-gray-600">
        Try adjusting your search or filter to find what you're looking for.
      </p>
    </div>
  );
};

export default NotFoundMessage;
