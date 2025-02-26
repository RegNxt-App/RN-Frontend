import {useEffect, useState} from 'react';

import {useDataViewContext} from '@/contexts/DataViewContext';
import {useDataView} from '@/hooks/api/use-dataview';
import {DataViewObject} from '@/types/databaseTypes';
import {DragHandleDots2Icon} from '@radix-ui/react-icons';
import {Loader2} from 'lucide-react';

import {Button} from '@rn/ui/components/ui/button';
import {Input} from '@rn/ui/components/ui/input';
import {ScrollArea} from '@rn/ui/components/ui/scroll-area';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@rn/ui/components/ui/table';

interface ObjectSelectionProps {
  config: DataViewObject[];
  updateConfig: (objects: DataViewObject[]) => void;
  framework?: string;
}

export function ObjectSelection({config = [], updateConfig, framework}: ObjectSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const {selectedObjects, setSelectedObjects} = useDataViewContext();
  const {useAvailableObjects} = useDataView();

  const {data: response, error, isLoading} = useAvailableObjects(page, searchTerm);

  useEffect(() => {
    if (config?.length > 0 && Object.keys(selectedObjects).length === 0) {
      const objectsMap = config.reduce((acc: Record<string, DataViewObject>, obj: DataViewObject) => {
        acc[obj.id] = obj;
        return acc;
      }, {});
      setSelectedObjects(objectsMap);
    }
  }, [config, selectedObjects, setSelectedObjects]);

  const handleAdd = async (obj: DataViewObject) => {
    const newSelected = {
      ...selectedObjects,
      [obj.id]: obj,
    };
    setSelectedObjects(newSelected);
    updateConfig(Object.values(newSelected));
  };

  const handleRemove = (objId: string) => {
    const {[objId]: removed, ...remaining} = selectedObjects;
    setSelectedObjects(remaining);
    updateConfig(Object.values(remaining));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Available Objects</h3>
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Search objects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border">
          <ScrollArea className="h-[300px]">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center p-4 text-destructive">Error loading objects</div>
            ) : response?.results?.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">No objects found</div>
            ) : (
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
                  {response?.results?.map((obj) => (
                    <TableRow key={obj.id}>
                      <TableCell>{obj.name}</TableCell>
                      <TableCell className="capitalize">{obj.type}</TableCell>
                      <TableCell>{obj.description}</TableCell>
                      <TableCell>
                        {obj.id in selectedObjects ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleRemove(obj.id)}
                          >
                            Remove
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAdd(obj)}
                          >
                            Add
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </div>

        {response && response.total_pages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {response.total_pages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === response.total_pages}
            >
              Next
            </Button>
          </div>
        )}
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
                  <TableHead>Type</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.values(selectedObjects).map((obj) => (
                  <TableRow key={obj.id}>
                    <TableCell>
                      <DragHandleDots2Icon className="h-4 w-4" />
                    </TableCell>
                    <TableCell>{obj.name}</TableCell>
                    <TableCell>
                      <Input
                        placeholder="Enter alias"
                        value={obj.alias || ''}
                        onChange={(e) => {
                          const newSelected = {
                            ...selectedObjects,
                            [obj.id]: {
                              ...obj,
                              alias: e.target.value,
                            },
                          };
                          setSelectedObjects(newSelected);
                          updateConfig(Object.values(newSelected));
                        }}
                        className="h-8 w-[150px]"
                      />
                    </TableCell>
                    <TableCell className="capitalize">{obj.type}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => handleRemove(obj.id)}
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
