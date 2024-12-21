import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import DropdownUser from './DropdownUser';
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    setSelectedApp(value); // Sync the selected app with dropdown
  };

  const handleTabChange = (value: string) => {
    setSelectedApp(value); // Sync the selected app with tab
  };

  return (
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              setSidebarOpen(!sidebarOpen);
            }}
            className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
          >
            <Menu size={24} />
          </button>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark"
          >
            {sidebarCollapsed ? (
              <ChevronRight size={24} />
            ) : (
              <ChevronLeft size={24} />
            )}
          </button>

          {/* App Selection Dropdown */}
          <Select onValueChange={handleSelectChange} value={selectedApp}>
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
                className="text-green-600 font-semibold hover:text-green-700"
              >
                Reporting
              </TabsTrigger>
              <TabsTrigger
                value="orchestra"
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                Orchestra
              </TabsTrigger>
              <TabsTrigger
                value="bird"
                className="text-yellow-500 font-semibold hover:text-yellow-700"
              >
                BIRD
              </TabsTrigger>
            </TabsList>
            <TabsContent value="reporting">
              {/* Content for Reporting Tab */}
            </TabsContent>
            <TabsContent value="orchestra">
              {/* Content for Orchestra Tab */}
            </TabsContent>
            <TabsContent value="bird">{/* Content for BIRD Tab */}</TabsContent>
          </Tabs>
        </div>

        <div className="hidden sm:block"></div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4"></ul>

          <DropdownUser />
        </div>
      </div>
    </header>
  );
};

export default Header;
