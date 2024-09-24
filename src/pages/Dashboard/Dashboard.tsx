import { DollarSign, Download, Eye, ShoppingCart, Users } from 'lucide-react';
import CardDataStats from '../../components/CardDataStats';

const Dashboard = () => {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats
          title="Total Downloads"
          total="$5.56K"
          rate="0.54%"
          levelUp
        >
          <Download size={20} strokeWidth={1.75} />
        </CardDataStats>
        <CardDataStats
          title="Total Profit"
          total="$455.2K"
          rate="4.35%"
          levelUp
        >
          <DollarSign size={20} strokeWidth={1.75} />
        </CardDataStats>
        <CardDataStats title="Total Product" total="2150" rate="2.19%" levelUp>
          <ShoppingCart size={20} strokeWidth={1.75} />
        </CardDataStats>
        <CardDataStats title="Total Users" total="3456" rate="0.15%" levelDown>
          <Users size={20} strokeWidth={1.75} />
        </CardDataStats>
      </div>
    </>
  );
};

export default Dashboard;
