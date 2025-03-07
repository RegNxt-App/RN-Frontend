import React, {useState} from 'react';

import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@/components/ui/accordion';
import {cn} from '@/lib/utils';
import {Layer} from '@/types/databaseTypes';
import {Search} from 'lucide-react';

import {Badge} from '@rn/ui/components/ui/badge';
import {Input} from '@rn/ui/components/ui/input';
import {ScrollArea} from '@rn/ui/components/ui/scroll-area';

export interface DatasetTreeProps {
  layers: Layer[];
  selectedDataset: string | null;
  onSelectDataset: (dataset: string) => void;
}

const DatasetTree: React.FC<DatasetTreeProps> = ({layers, selectedDataset, onSelectDataset}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLayers = layers
    .map((layer) => ({
      ...layer,
      datasets: layer.datasets.filter((dataset) => dataset.toLowerCase().includes(searchQuery.toLowerCase())),
    }))
    .filter((layer) => layer.datasets.length > 0);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search datasets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <Accordion
          type="multiple"
          defaultValue={filteredLayers.map((layer) => layer.layer)}
          className="space-y-1"
        >
          {filteredLayers.map((layer) => (
            <AccordionItem
              key={layer.layer}
              value={layer.layer}
              className="border rounded-md overflow-hidden"
            >
              <AccordionTrigger className="px-2 py-2 hover:bg-muted/50 hover:no-underline">
                <div className="flex items-center">
                  <span className="font-medium">{layer.layer}</span>
                  <Badge
                    variant="secondary"
                    className="ml-2"
                  >
                    {layer.datasets.length}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="p-1 bg-muted/20">
                  {layer.datasets.map((dataset) => (
                    <button
                      key={dataset}
                      onClick={() => onSelectDataset(dataset)}
                      className={cn(
                        'flex items-center w-full px-4 py-1.5 text-left text-sm rounded hover:bg-muted',
                        selectedDataset === dataset && 'bg-primary/10 text-primary font-medium'
                      )}
                    >
                      {dataset}
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {filteredLayers.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            {searchQuery ? 'No datasets match your search' : 'No datasets available'}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default DatasetTree;
