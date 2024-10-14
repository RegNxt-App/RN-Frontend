import { useState, useEffect } from 'react';
import AddEntityModel from '../../components/CModels/EntityModels/AddEntityModel';
import AddTemplateModel from '../../components/CModels/TemplateModels/AddTemplateModel';
import { ArrowDownToLine, ArrowUpFromLine, Plus } from 'lucide-react';
import Api from '../../utils/Api';
import TemplateTable from '../../components/Tables/TemplateTable';

function Template() {
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [showPopup, setShowPopup] = useState(false);
  const [entityData, setEntityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Api.get('/RI/Template')
      .then((response) => {
        setEntityData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching entity data:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
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
          <span>Add Template</span>
        </button>
      </div>
      <TemplateTable data={entityData} />
      {showPopup && <AddTemplateModel onClose={() => setShowPopup(false)} />}
    </>
  );
}

export default Template;
