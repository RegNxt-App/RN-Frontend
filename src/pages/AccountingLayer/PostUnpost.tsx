import React, { useState } from 'react';
import PostedJournalsData from '../../components/Tables/PostedJournalsData';
import UnpostedJournalsData from '../../components/Tables/PostedJournalsData';
import UploadPan from './UploadJournalPan';

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

const PostUnpost = () => {
  const [activeTab, setActiveTab] = useState<string>('unposted-journals');

  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const dummyData: Item[] = [
    {
      id: '1',
      JournalCode: 'Accounting',
      JournalNr: 'Entity A',
      Status: 'Initial',
      EntryDate: '2023-09-20',
      EntityList: 'John Doe',
      MinEffectiveDate: '2023-09-01',
      MaxEffectiveDate: '2023-09-30',
      ReversalJournalCode: 'RevA',
      ReversalJournalNr: 'RevNr1',
      Description: 'Initial entry for Entity A',
    },
    {
      id: '2',
      JournalCode: 'Finance',
      JournalNr: 'Entity B',
      Status: 'Approved',
      EntryDate: '2023-09-22',
      EntityList: 'Jane Smith',
      MinEffectiveDate: '2023-09-10',
      MaxEffectiveDate: '2023-09-25',
      ReversalJournalCode: 'RevB',
      ReversalJournalNr: 'RevNr2',
      Description: 'Approved entry for Entity B',
    },
    {
      id: '3',
      JournalCode: 'Sales',
      JournalNr: 'Entity C',
      Status: 'Completed',
      EntryDate: '2023-09-25',
      EntityList: 'Alice Johnson',
      MinEffectiveDate: '2023-09-15',
      MaxEffectiveDate: '2023-09-28',
      ReversalJournalCode: 'RevC',
      ReversalJournalNr: 'RevNr3',
      Description: 'Completed entry for Entity C',
    },
  ];

  const [currentItems] = useState<Item[]>(dummyData);

  const handleViewClick = (item: Item) => {
    console.log('View item:', item);
  };

  const tabs: TabContent[] = [
    {
      id: 'unposted-journals',
      title: 'Unposted Journals',
      content: (
        <>
          <UploadPan />
          <UnpostedJournalsData data={dummyData} />
        </>
      ),
    },
    {
      id: 'posted-journals',
      title: 'Posted Journals',
      content: <PostedJournalsData data={dummyData} />,
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

        {/* <div className="p-5 bg-white shadow-md rounded-b-md"> */}
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
        {/* </div> */}
      </div>
    </div>
  );
};

export default PostUnpost;
