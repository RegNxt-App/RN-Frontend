import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        isLoading={false}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />
      <div
        className={`flex-1 overflow-auto transition-all duration-300 ease-in-out ${
          isExpanded ? "ml-[280px]" : "ml-[80px]"
        }`}
      >
        <main className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
