import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {ChevronLeft, ChevronRight, Menu} from 'lucide-react';

import {Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from '../ui/select';
import DropdownUser from './DropdownUser';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (arg: boolean) => void;
  selectedApp: string;
  setSelectedApp: (app: string) => void;
}

const Header = ({
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  selectedApp,
  setSelectedApp,
}: HeaderProps) => {
  const handleSelectChange = (value: string) => {
    setSelectedApp(value);
  };

  const handleTabChange = (value: string) => {
    setSelectedApp(value);
  };

  return (
    <header className="z-999 drop-shadow-1 dark:bg-boxdark sticky top-0 flex w-full bg-white dark:drop-shadow-none">
      <div className="shadow-2 flex flex-grow items-center justify-between px-4 py-4 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            className="z-99999 border-stroke dark:border-strokedark dark:bg-boxdark block rounded-sm border bg-white p-1.5 shadow-sm lg:hidden"
          >
            <Menu size={24} />
          </button>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="border-stroke dark:border-strokedark dark:bg-boxdark hidden rounded-sm border bg-white p-1.5 shadow-sm lg:block"
          >
            {sidebarCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
          </button>

          {/* App Selection Dropdown */}
          <Select
            onValueChange={handleSelectChange}
            value={selectedApp}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select an App" />
            </SelectTrigger>
            <SelectContent className="mt-5">
              <SelectGroup>
                <SelectItem value="reporting">Reporting</SelectItem>
                <SelectItem value="orchestra">Orchestra</SelectItem>
                <SelectItem value="bird">BIRD</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Tabs for App Selection */}
          <Tabs
            value={selectedApp}
            onValueChange={handleTabChange}
            className="ml-4"
          >
            <TabsList className="flex gap-6">
              <TabsTrigger
                value="reporting"
                className="font-semibold text-green-600 hover:text-green-700"
              >
                Reporting
              </TabsTrigger>
              <TabsTrigger
                value="orchestra"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Orchestra
              </TabsTrigger>
              <TabsTrigger
                value="bird"
                className="font-semibold text-yellow-500 hover:text-yellow-700"
              >
                BIRD
              </TabsTrigger>
            </TabsList>
            <TabsContent value="reporting">{/* Content for Reporting Tab */}</TabsContent>
            <TabsContent value="orchestra">{/* Content for Orchestra Tab */}</TabsContent>
            <TabsContent value="bird">{/* Content for BIRD Tab */}</TabsContent>
          </Tabs>
        </div>

        <div className="hidden sm:block"></div>

        <div className="2xsm:gap-7 flex items-center gap-3">
          <ul className="2xsm:gap-4 flex items-center gap-2"></ul>

          <DropdownUser />
        </div>
      </div>
    </header>
  );
};

export default Header;
