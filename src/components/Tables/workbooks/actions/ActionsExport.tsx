import { Button } from '@/components/ui/button';

const ActionsExport = () => {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <Button
        className="bg-purple text-white"
        //   onClick={() => setShowConfirmDialog(true)}
      >
        Export
      </Button>
    </div>
  );
};

export default ActionsExport;
