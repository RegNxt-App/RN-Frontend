import { useState, useEffect } from 'react';
import EntityTable from '../../components/Tables/EntityTable';
import AddEntityModel from '../../components/CModels/EntityModels/AddEntityModel';
import { ArrowDownToLine, ArrowUpFromLine, Plus } from 'lucide-react';
import Api from '../../utils/Api';
import Loader from '../../components/loader';

function Entity() {
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [showPopup, setShowPopup] = useState(false);
  const [entityData, setEntityData] = useState([]);
  const [loading, setLoading] = useState(true);

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
          <button
            className={`flex items-center space-x-2 px-4 py-2 rounded bg-blue-500 text-white`}
            onClick={() => setView('list')}
          >
            <span>Import</span>
            <ArrowUpFromLine size={20} strokeWidth={1.75} />
          </button>
          <button
            className={`flex items-center space-x-2 px-4 py-2 rounded bg-blue-500 text-white`}
            onClick={() => setView('kanban')}
          >
            <span>Export</span>
            <ArrowDownToLine size={20} strokeWidth={1.75} />
          </button>
        </div>

        <button
          className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md"
          onClick={() => setShowPopup(true)}
        >
          <Plus size={20} strokeWidth={1.75} />
          <span>Add Entity</span>
        </button>
      </div>
      <EntityTable data={entityData} onDataChange={handleUpdateEntitySuccess} />
      {showPopup && (
        <AddEntityModel
          onClose={() => setShowPopup(false)}
          onSuccess={handleAddEntitySuccess}
        />
      )}
    </>
  );
}

export default Entity;
