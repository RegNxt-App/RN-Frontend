import { Button } from '@/components/ui/button';
import { useState } from 'react';

const ActionsAllocate = () => {
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [selectedRuleset, setSelectedRuleset] = useState<string | null>(null);

  const handleCapture = () => {
    console.log('Dataset:', selectedDataset);
    console.log('Ruleset:', selectedRuleset);
    // Handle capture logic here
  };

  const handleAllocate = () => {
    console.log('Allocating full allocation from dimension+metric table...');
    // Handle full allocation logic here
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      {/* Section 1: Direct Allocation (from Dataset) */}
      <h2 className="text-lg font-medium text-black dark:text-white mb-4">
        Direct Allocation (from Dataset)
      </h2>

      <div className="flex items-center space-x-4 mb-6 w-full">
        <select
          className="border border-gray-300 rounded-md px-4 py-2  w-[42%]"
          value={selectedDataset || ''}
          onChange={(e) => setSelectedDataset(e.target.value)}
        >
          <option value="" disabled>
            Select a Dataset
          </option>
          <option value="Dataset 1">Dataset 1</option>
          <option value="Dataset 2">Dataset 2</option>
          <option value="Dataset 3">Dataset 3</option>
        </select>

        <select
          className="border border-gray-300 rounded-md px-4 py-2  w-[42%]"
          value={selectedRuleset || ''}
          onChange={(e) => setSelectedRuleset(e.target.value)}
        >
          <option value="" disabled>
            Select a Ruleset
          </option>
          <option value="Ruleset 1">Ruleset 1</option>
          <option value="Ruleset 2">Ruleset 2</option>
          <option value="Ruleset 3">Ruleset 3</option>
        </select>

        <Button className="bg-purple-500 text-white" onClick={handleCapture}>
          Capture
        </Button>
      </div>

      {/* Section 2: Full Allocation (from generic dimension+metric table) */}
      <h2 className="text-lg font-medium text-black dark:text-white mb-4">
        Full Allocation (from generic dimension+metric table)
      </h2>

      <Button className="bg-purple-500 text-white" onClick={handleAllocate}>
        Allocate
      </Button>
    </div>
  );
};

export default ActionsAllocate;
