import {ReactNode} from 'react';

import {ArrowDown, ArrowUp} from 'lucide-react';

interface CardDataStatsProps {
  title: string;
  total: string;
  rate: string;
  levelUp?: boolean;
  levelDown?: boolean;
  children: ReactNode;
}

const CardDataStats = ({title, total, rate, levelUp, levelDown, children}: CardDataStatsProps) => {
  return (
    <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
        {children}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-title-md font-bold text-black dark:text-white">{total}</h4>
          <span className="text-sm font-medium">{title}</span>
        </div>

        <span
          className={`flex items-center gap-1 text-sm font-medium ${levelUp && 'text-purple'} ${
            levelDown && 'text-purple'
          } `}
        >
          {rate}

          {levelUp && (
            <ArrowUp
              color="#6419E6"
              size={16}
              strokeWidth={1.25}
            />
          )}
          {levelDown && (
            <ArrowDown
              color="#6419E6"
              size={16}
              strokeWidth={1.25}
            />
          )}
        </span>
      </div>
    </div>
  );
};

export default CardDataStats;
