import { useState, useEffect } from 'react';
import AddTemplateModel from '../../components/CModels/TemplateModels/AddTemplateModel';
import { ArrowDownToLine, ArrowUpFromLine, Plus } from 'lucide-react';
import Api from '../../utils/Api';
import TemplateTable from '../../components/Tables/TemplateTable';
import Loader from '../../components/loader';
import { Button } from '@/components/ui/button';
function Template() {
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [showPopup, setShowPopup] = useState(false);
  const [templateData, setTemplateData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const fetchTemplateData = () => {
    setLoading(true);
    Api.get('/RI/Template')
      .then((response) => {
        setTemplateData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching entity data:', error);
        setLoading(false);
      });
  };
  useEffect(() => {
    fetchTemplateData();
  }, []);

  const handleAddTemplateSuccess = () => {
    fetchTemplateData();
    setShowPopup(false);
  };
  const handleUpdateTemplateSuccess = () => {
    fetchTemplateData();
    setShowPopup(false);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <div className="flex justify-between mb-4">
        <div className="flex space-x-4">
          <Button
            onClick={() => setView('list')}
            className="flex items-center gap-2 bg-purple-500 text-white"
          >
            Import
            <ArrowUpFromLine size={20} strokeWidth={1.75} />
          </Button>
          <Button
            onClick={() => setView('kanban')}
            className="flex items-center gap-2 bg-purple-500 text-white"
          >
            Export
            <ArrowDownToLine size={20} strokeWidth={1.75} />
          </Button>
        </div>

        <Button
          className="flex items-center gap-2 bg-purple-500 text-white"
          onClick={() => setIsOpen(true)}
        >
          <Plus size={20} strokeWidth={1.75} />
          Add Template
        </Button>
      </div>
      <TemplateTable
        data={templateData}
        onDataChange={handleUpdateTemplateSuccess}
      />

      <AddTemplateModel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={handleAddTemplateSuccess}
      />
    </>
  );
}

export default Template;
