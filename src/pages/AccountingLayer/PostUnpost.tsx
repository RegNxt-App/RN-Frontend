import React, { useState, useEffect } from 'react';
import PostedJournalsData from '../../components/Tables/PostedJournalsData';
import UnpostedJournalsData from '../../components/Tables/UnpostedJournalsData';
import UploadPan from './UploadJournalPan';
import Api from '../../components/Api';
import Loader from '../../components/loader';
interface Item {
  id: string;
  journalCode: string;
  journalNr: string;
  status: string;
  entryDate: string;
  entityList: string;
  minEffectiveDate: string;
  maxEffectiveDate: string;
  reversalJournalCode: string;
  reversalJournalNr: string;
  description: string;
}

interface TabContent {
  id: string;
  title: string;
  content: React.ReactNode;
}

const PostUnpost = () => {
  const [activeTab, setActiveTab] = useState<string>('unposted-journals');
  const [unpostedJournals, setUnpostedJournals] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnpostedJournals = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await Api.get('/FDL/UnpostedJournalBatch');
        setUnpostedJournals(response.data);
      } catch (err) {
        setError('Failed to fetch unposted journals.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUnpostedJournals();
  }, []);

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
          {loading ? (
            <Loader />
          ) : error ? (
            <p>{error}</p>
          ) : (
            <UnpostedJournalsData data={unpostedJournals} />
          )}
        </>
      ),
    },
    {
      id: 'posted-journals',
      title: 'Posted Journals',
      content: <PostedJournalsData data={unpostedJournals} />,
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
