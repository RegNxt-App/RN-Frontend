import {ReactNode, useEffect, useState} from 'react';

import ErrorBoundary from '@/components/ErrorBoundary';

import {cn} from '@rn/ui/lib/utils';

import Sidebar from '../components/Sidebar/index';

type DefaultLayoutProps = {
  children: ReactNode;
};

const DefaultLayout = ({children}: DefaultLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedApp, setSelectedApp] = useState<string>('reporting');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarCollapsed(mobile);
      setSidebarOpen(!mobile);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ErrorBoundary>
      <div className="relative flex h-screen w-full overflow-hidden bg-background">
        <div className="fixed left-0 top-0 z-50 h-full">
          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            selectedApp={selectedApp}
          />
        </div>

        <div
          className={cn(
            'flex-1 overflow-auto transition-all duration-300',
            sidebarCollapsed ? 'ml-16' : 'ml-[280px]'
          )}
        >
          <main className="flex-1">
            <ErrorBoundary>
              <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">{children}</div>
            </ErrorBoundary>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default DefaultLayout;
