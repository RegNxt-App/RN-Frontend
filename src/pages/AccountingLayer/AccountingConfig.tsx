import React, { useState } from 'react';
import FdlAccountingConfig from '../../components/Tables/FdlAccountingConfig';
import PostedJournalsData from '../../components/Tables/PostedJournalsData';
// Corrected the duplicate import, assuming UnpostedJournalsData is different
import UnpostedJournalsData from '../../components/Tables/UnpostedJournalsData';
import AccountCode from './AccountCode';
import FdlJournalPolicy from '../../components/Tables/FdlJournalPolicy';
import CurrencyRate from './CurrencyRate';

interface Item {
  id: string;
  JournalCode: string;
  JournalNr: string;
  Status: string;
  EntryDate: string;
  EntityList: string;
  MinEffectiveDate: string;
  MaxEffectiveDate: string;
  ReversalJournalCode: string;
  ReversalJournalNr: string;
  Description: string;
}

interface TabContent {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccountingCategory {
  id: string;
  Name: string;
  Description: string;
}
interface JournalPolicy {
  id: string;
  PolicyCode: string;
  Name: string;
  Description: string;
  allowManualEntries: string;
  allowAutomatedEntries: string;
  allowMultipleEntries: string;
  applyAutoApprove: string;
  inbalanceThreshold: string;
  lastJournalNr: string;
  mustBeReversed: string;
}

const AccountingConfig = () => {
  const [activeTab, setActiveTab] = useState<string>('AccountingCategory');
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const accountingCategoryData: AccountingCategory[] = [
    {
      id: '1',
      Name: 'PCOA',
      Description: 'Primary Chart of Accounts',
    },
    {
      id: '2',
      Name: 'SCOA',
      Description: 'Secondary Chart of Accounts',
    },
  ];
  const JournalPolicyData: JournalPolicy[] = [
    {
      id: '1',
      PolicyCode: 'string',
      Name: 'string',
      Description: 'string',
      allowManualEntries: 'string',
      allowAutomatedEntries: 'string',
      allowMultipleEntries: 'string',
      applyAutoApprove: 'string',
      inbalanceThreshold: 'string',
      lastJournalNr: 'string',
      mustBeReversed: 'string',
    },
    {
      id: '2',
      PolicyCode: 'string',
      Name: 'string',
      Description: 'string',
      allowManualEntries: 'string',
      allowAutomatedEntries: 'string',
      allowMultipleEntries: 'string',
      applyAutoApprove: 'string',
      inbalanceThreshold: 'string',
      lastJournalNr: 'string',
      mustBeReversed: 'string',
    },
  ];

  const tabs: TabContent[] = [
    {
      id: 'AccountingCategory',
      title: 'Accounting Category',
      content: <FdlAccountingConfig data={accountingCategoryData} />,
    },
    {
      id: 'AccountCode',
      title: 'Account Code',
      content: <AccountCode />,
    },
    {
      id: 'JournalPolicy',
      title: 'Journal Policy',
      content: <FdlJournalPolicy data={JournalPolicyData} />,
    },
    {
      id: 'CurrencyRate',
      title: 'Currency Rate',
      content: <CurrencyRate />,
    },
  ];

  return (
    <div className="w-full">
      <div className="relative right-0">
        <ul
          className="relative flex flex-wrap px-1.5 py-1.5 list-none rounded-md bg-slate-100"
          role="tablist"
        >
          {tabs.map((tab) => (
            <li key={tab.id} className="z-30 flex-auto text-center">
              <a
                className={`z-30 flex items-center justify-center w-full px-0 py-2 text-sm mb-0 transition-all ease-in-out border-0 rounded-md cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-700 shadow-md font-bold border-b-2'
                    : 'text-slate-600 bg-inherit font-bold'
                }`}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={tab.id}
              >
                {tab.title}
              </a>
            </li>
          ))}
        </ul>

        {tabs.map((tab) => (
          <div
            key={tab.id}
            id={tab.id}
            role="tabpanel"
            className={activeTab === tab.id ? '' : 'hidden'}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccountingConfig;
