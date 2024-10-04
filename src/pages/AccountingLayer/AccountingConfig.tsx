import React, { useEffect, useState } from 'react';
import FdlAccountingConfig from '../../components/Tables/FdlAccountingConfig';
import AccountCode from './AccountCode';
import FdlJournalPolicy from '../../components/Tables/FdlJournalPolicy';
import CurrencyRate from './CurrencyRate';
import Api from '../../components/Api';
import Loader from '../../components/loader';

interface TabContent {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccountingCategory {
  id: string;
  name: string;
  description: string;
}
interface AccountingRateType {
  id: string;
  name: string;
  code: string;
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
  const [accountingCategoryData, setAccountingCategoryData] = useState<
    AccountingCategory[]
  >([]);
  const [accountingRateTypeData, setAccountingRateTypeData] = useState<
    AccountingRateType[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: '', email: '' });

  useEffect(() => {
    const fetchAccountingCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await Api.get('/FDL/AccountingCategory');
        setAccountingCategoryData(response.data);
        console.log(response.data);
      } catch (err: any) {
        setError('Failed to fetch accounting categories');
      } finally {
        setLoading(false);
      }
    };
    const fetchAccountingRateType = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await Api.get('/FDL/RateType');
        setAccountingRateTypeData(response.data);
        console.log(response.data);
      } catch (err: any) {
        setError('Failed to fetch accounting RateType');
      } finally {
        setLoading(false);
      }
    };

    fetchAccountingCategories();
    fetchAccountingRateType();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

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
      content: loading ? (
        <Loader />
      ) : error ? (
        <p>{error}</p>
      ) : (
        <FdlAccountingConfig data={accountingCategoryData} />
      ),
    },
    {
      id: 'AccountCode',
      title: 'Account Code',
      content: <AccountCode accountingCategories={accountingCategoryData} />,
    },
    {
      id: 'JournalPolicy',
      title: 'Journal Policy',
      content: <FdlJournalPolicy data={JournalPolicyData} />,
    },
    {
      id: 'CurrencyRate',
      title: 'Currency Rate',
      content: <CurrencyRate data={accountingRateTypeData} />,
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
