import { useState, useEffect } from 'react';

import EntityTable from '../../components/Tables/EntityTable';
import AddEntityModel from '../../components/CModels/EntityModels/AddEntityModel';
import { ArrowDownToLine, ArrowUpFromLine, Download, Plus } from 'lucide-react';
function Entity() {
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [showPopup, setShowPopup] = useState(false);

  const sampleData = [
    {
      id: 1,
      code: 'A123',
      label: 'Entity 1',
      country: 'USA',
      city: 'New York',
      identificationType: 'ID',
      vat: '123456',
      bicCode: 'BIC001',
      kboCode: 'KBO001',
      leiCode: 'LEI001',
      reportingCurrency: 'USD',
      significantCurrencies: ['USD', 'EUR'],
      email: 'entity1@example.com',
    },
    {
      id: 2,
      code: 'B456',
      label: 'Entity 2',
      country: 'UK',
      city: 'London',
      identificationType: 'Passport',
      vat: '654321',
      bicCode: 'BIC002',
      kboCode: 'KBO002',
      leiCode: 'LEI002',
      reportingCurrency: 'GBP',
      significantCurrencies: ['GBP', 'EUR'],
      email: 'entity2@example.com',
    },
    {
      id: 3,
      code: 'B456',
      label: 'Entity 2',
      country: 'UK',
      city: 'London',
      identificationType: 'Passport',
      vat: '654321',
      bicCode: 'BIC002',
      kboCode: 'KBO002',
      leiCode: 'LEI002',
      reportingCurrency: 'GBP',
      significantCurrencies: ['GBP', 'EUR'],
      email: 'entity2@example.com',
    },
    {
      id: 4,
      code: 'B456',
      label: 'Entity 2',
      country: 'UK',
      city: 'London',
      identificationType: 'Passport',
      vat: '654321',
      bicCode: 'BIC002',
      kboCode: 'KBO002',
      leiCode: 'LEI002',
      reportingCurrency: 'GBP',
      significantCurrencies: ['GBP', 'EUR'],
      email: 'entity2@example.com',
    },
    {
      id: 5,
      code: 'B456',
      label: 'Entity 2',
      country: 'UK',
      city: 'London',
      identificationType: 'Passport',
      vat: '654321',
      bicCode: 'BIC002',
      kboCode: 'KBO002',
      leiCode: 'LEI002',
      reportingCurrency: 'GBP',
      significantCurrencies: ['GBP', 'EUR'],
      email: 'entity2@example.com',
    },
    {
      id: 6,
      code: 'B456',
      label: 'Entity 2',
      country: 'UK',
      city: 'London',
      identificationType: 'Passport',
      vat: '654321',
      bicCode: 'BIC002',
      kboCode: 'KBO002',
      leiCode: 'LEI002',
      reportingCurrency: 'GBP',
      significantCurrencies: ['GBP', 'EUR'],
      email: 'entity2@example.com',
    },
    {
      id: 7,
      code: 'B456',
      label: 'Entity 2',
      country: 'UK',
      city: 'London',
      identificationType: 'Passport',
      vat: '654321',
      bicCode: 'BIC002',
      kboCode: 'KBO002',
      leiCode: 'LEI002',
      reportingCurrency: 'GBP',
      significantCurrencies: ['GBP', 'EUR'],
      email: 'entity2@example.com',
    },
  ];

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
      <EntityTable data={sampleData} />
      {showPopup && <AddEntityModel onClose={() => setShowPopup(false)} />}
    </>
  );
}

export default Entity;
