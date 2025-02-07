import {useEffect, useState} from 'react';

import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {DragHandleDots2Icon} from '@radix-ui/react-icons';

import {ScrollArea} from '@rn/ui/components/ui/scroll-area';

interface DataObject {
  id: string;
  name: string;
  type: 'dataset' | 'view';
  description: string;
}

interface ObjectSelectionProps {
  config: DataObject[];
  updateConfig: (objects: DataObject[]) => void;
}

export function ObjectSelection({config, updateConfig}: ObjectSelectionProps) {
  const [availableObjects, setAvailableObjects] = useState<DataObject[]>([
    {id: '1', name: 'Customer Data', type: 'dataset', description: 'Customer information'},
    {id: '2', name: 'Transaction History', type: 'dataset', description: 'Transaction records'},
    {id: '3', name: 'Account Summary', type: 'view', description: 'Account overview'},
    {id: '4', name: 'Product Catalog', type: 'dataset', description: 'Product information'},
    {id: '5', name: 'Employee Records', type: 'dataset', description: 'Employee details'},
  ]);
  const [selectedObjects, setSelectedObjects] = useState<DataObject[]>(config);

  useEffect(() => {
    if (JSON.stringify(selectedObjects) !== JSON.stringify(config)) {
      updateConfig(selectedObjects);
    }
  }, [selectedObjects, config, updateConfig]);

  const handleAdd = (obj: DataObject) => {
    setSelectedObjects([...selectedObjects, {...obj, id: `${obj.id}-${Date.now()}`}]);
    setAvailableObjects(availableObjects.filter((o) => o.id !== obj.id));
  };

  const handleRemove = (obj: DataObject) => {
    setSelectedObjects(selectedObjects.filter((o) => o.id !== obj.id));
    setAvailableObjects([...availableObjects, {...obj, id: obj.id.split('-')[0]}]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Available Objects</h3>
        <div className="rounded-md border">
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableObjects.map((obj) => (
                  <TableRow key={obj.id}>
                    <TableCell>{obj.name}</TableCell>
                    <TableCell className="capitalize">{obj.type}</TableCell>
                    <TableCell>{obj.description}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAdd(obj)}
                      >
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2">Selected Objects</h3>
        <div className="rounded-md border">
          <ScrollArea className="h-[200px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Alias</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedObjects.map((obj) => (
                  <TableRow key={obj.id}>
                    <TableCell>
                      <DragHandleDots2Icon className="h-4 w-4" />
                    </TableCell>
                    <TableCell>{obj.name}</TableCell>
                    <TableCell>
                      <Input
                        placeholder="Enter alias"
                        className="h-8"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleRemove(obj)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
