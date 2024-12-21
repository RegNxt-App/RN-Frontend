import {ReactNode, useState} from 'react';

import ErrorBoundary from '@/components/ErrorBoundary';

import Header from '../components/Header/index';
import Sidebar from '../components/Sidebar/index';

type DefaultLayoutProps = {
  children: ReactNode;
};

const DefaultLayout = ({children}: {children: ReactNode}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedApp, setSelectedApp] = useState<string>('reporting');

  return (
    <ErrorBoundary>
      <div className="dark:bg-boxdark-2 dark:text-bodydark">
        <div className="flex h-screen overflow-hidden">
          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            sidebarCollapsed={sidebarCollapsed}
            selectedApp={selectedApp}
          />
          <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <Header
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              sidebarCollapsed={sidebarCollapsed}
              setSidebarCollapsed={setSidebarCollapsed}
              setSelectedApp={setSelectedApp}
            />
            <main>
              <ErrorBoundary>
                <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">{children}</div>
              </ErrorBoundary>
            </main>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default DefaultLayout;
