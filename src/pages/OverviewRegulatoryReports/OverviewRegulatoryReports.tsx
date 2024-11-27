import { useState, useEffect } from 'react';
import DataTable from '../../components/Tables/DataTable';
import KanbanView from '../../components/KanbanView';
import { ChevronDown, ChevronUp } from 'lucide-react';
import AddWorkbookModel from '../../components/CModels/WordbookModels/AddWorkbookModel';
import Api from '../../utils/Api';
import { Button } from '@/components/ui/button';

interface WorkbookData {
  id: number;
  name: string;
  template: string;
  templateId: number;
  reportSubsetId: number;
  module: string;
  entity: string;
  reportingCurrency: string;
  reportingDate: number;
  status: string;
}

const OverviewRegulatoryReports = () => {
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [showPopup, setShowPopup] = useState(false);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [data, setData] = useState<WorkbookData[]>([]);
  const [filteredData, setFilteredData] = useState<WorkbookData[]>([]);
  const [modules, setModules] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPanelOpen, setPanelOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchWorkbooks();
  }, []);

  useEffect(() => {
    let filtered = data;

    if (selectedModule) {
      filtered = filtered.filter((item) => item.module === selectedModule);
    }

    if (selectedStatus) {
      filtered = filtered.filter((item) => item.status === selectedStatus);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();

      filtered = filtered.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(query),
        ),
      );
    }

    setFilteredData(filtered);
  }, [selectedModule, selectedStatus, searchQuery, data]);

  const togglePanel = () => {
    setPanelOpen((prev) => !prev);
  };
  const fetchWorkbooks = async () => {
    try {
      const response = await Api.get('/RI/Workbook');

      const result: WorkbookData[] = await response.data;
      setData(result);
      setFilteredData(result);

      const uniqueModules = Array.from(
        new Set(result.map((item) => item.module)),
      );
      const uniqueStatuses = Array.from(
        new Set(result.map((item) => item.status)),
      );

      setModules(uniqueModules);
      setStatuses(uniqueStatuses);

      setLoading(false);
    } catch (error) {
      setError((error as Error).message);
      setLoading(false);
    }
  };
  const handleWorkbookAdded = () => {
    fetchWorkbooks();
    setShowPopup(false);
  };

  return (
    <>
      <div className="flex justify-between mb-4">
        <div className="flex space-x-4">
          <button
            className={`px-4 py-2 ${view === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setView('list')}
          >
            List
          </button>
          <button
            className={`px-4 py-2 ${view === 'kanban' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            onClick={() => setView('kanban')}
          >
            Kanban
          </button>
        </div>
        <Button className="text-white" onClick={() => setIsOpen(true)}>
          Add Workbook
        </Button>
      </div>
      <div className="pt-3 px-3 m-0 bg-white rounded-md shadow-md">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Filters</h2>
          <button
            onClick={togglePanel}
            className="text-blue-500 focus:outline-none w-6 h-6 flex items-center justify-center"
          >
            {isPanelOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
        </div>

        <div
          className={`mt-4 overflow-hidden transition-all duration-300 ease-in-out ${isPanelOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <div className="grid grid-cols-3 gap-4 pb-4">
            <div>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
              >
                <option value="" disabled>
                  Select Module
                </option>
                {modules.map((module) => (
                  <option key={module} value={module}>
                    {module}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
              >
                <option value="" disabled>
                  Select Status
                </option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="relative z-20 w-full rounded border border-stroke bg-transparent py-3 px-5 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
              />
            </div>
          </div>
        </div>
      </div>
      {view === 'list' ? (
        <DataTable data={filteredData} />
      ) : (
        <KanbanView data={filteredData} />
      )}

      <AddWorkbookModel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onWorkbookAdded={handleWorkbookAdded}
      />
    </>
  );
};

export default OverviewRegulatoryReports;
