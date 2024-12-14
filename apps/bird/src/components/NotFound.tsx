// components/NotFoundMessage.tsx
import React from "react";

const NotFoundMessage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <img src="/not-found.svg" alt="not-found" width={250} />
      <h2 className="text-2xl font-semibold mt-4">No results found</h2>
      <p className="text-gray-600 mt-2">
        Try adjusting your search or filter to find what you're looking for.
      </p>
    </div>
  );
};

export default NotFoundMessage;
