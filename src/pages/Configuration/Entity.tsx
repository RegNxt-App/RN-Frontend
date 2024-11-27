import { useState, useEffect } from 'react';
import EntityTable from '../../components/Tables/EntityTable';
import AddEntityModel from '../../components/CModels/EntityModels/AddEntityModel';
import { ArrowDownToLine, ArrowUpFromLine, Plus } from 'lucide-react';
import Api from '../../utils/Api';
import Loader from '../../components/loader';
import { Button } from '@/components/ui/button';

function Entity() {
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [showPopup, setShowPopup] = useState(false);
  const [entityData, setEntityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const fetchEntityData = () => {
    setLoading(true);
    Api.get('/RI/Entity')
      .then((response) => {
        setEntityData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching entity data:', error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEntityData();
  }, []);

  const handleAddEntitySuccess = () => {
    fetchEntityData();
    setShowPopup(false);
  };
  const handleUpdateEntitySuccess = () => {
    fetchEntityData();
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
            className="flex items-center gap-2 bg-purple text-white"
          >
            Import
            <ArrowUpFromLine size={20} strokeWidth={1.75} />
          </Button>

          <Button
            onClick={() => setView('kanban')}
            className="flex items-center gap-2 bg-purple text-white"
          >
            Export
            <ArrowDownToLine size={20} strokeWidth={1.75} />
          </Button>
        </div>

        <Button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 bg-purple text-white"
        >
          <Plus size={20} strokeWidth={1.75} />
          Add Entity
        </Button>
      </div>
      <EntityTable data={entityData} onDataChange={handleUpdateEntitySuccess} />

      <AddEntityModel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSuccess={handleAddEntitySuccess}
      />
    </>
  );
}

export default Entity;
