import React, {useState} from 'react';

import {SharedDataTable} from '@/components/SharedDataTable';
import {DatasetItem} from '@/types/databaseTypes';
import {ColumnDef} from '@tanstack/react-table';

import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from '@rn/ui/components/ui/accordion';
import {Button} from '@rn/ui/components/ui/button';

interface ConfigurationDataTableProps {
  data: Record<string, Record<string, DatasetItem[]>>;
  onRowClick: (row: DatasetItem) => void;
}

const columns: ColumnDef<DatasetItem>[] = [
  {
    accessorKey: 'framework',
    header: 'Framework',
    cell: ({row}) => <div>{row.getValue('framework')}</div>,
  },
  {
    accessorKey: 'type',
    header: 'Layer/Type',
    cell: ({row}) => <div>{row.getValue('type')}</div>,
  },
  {
    accessorKey: 'code',
    header: 'Code',
    cell: ({row}) => <div>{row.getValue('code')}</div>,
  },
  {
    accessorKey: 'label',
    header: 'Name',
    cell: ({row}) => <div>{row.getValue('label')}</div>,
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({row}) => <div>{row.getValue('description')}</div>,
  },
];

const FRAMEWORKS_PER_PAGE = 15;
const GROUPS_PER_PAGE = 10;

export const ConfigurationDataTable: React.FC<ConfigurationDataTableProps> = ({data, onRowClick}) => {
  const [expandedFramework, setExpandedFramework] = useState<string | undefined>(undefined);
  const [expandedGroup, setExpandedGroup] = useState<string | undefined>(undefined);
  const [frameworkPage, setFrameworkPage] = useState(1);
  const [groupPages, setGroupPages] = useState<Record<string, number>>({});

  const frameworks = Object.keys(data);
  const totalFrameworkPages = Math.ceil(frameworks.length / FRAMEWORKS_PER_PAGE);
  const paginatedFrameworks = frameworks.slice(
    (frameworkPage - 1) * FRAMEWORKS_PER_PAGE,
    frameworkPage * FRAMEWORKS_PER_PAGE
  );

  const getPaginatedGroups = (framework: string) => {
    if (!data[framework]) return [];
    const groups = Object.keys(data[framework]);
    const page = groupPages[framework] || 1;
    return groups.slice((page - 1) * GROUPS_PER_PAGE, page * GROUPS_PER_PAGE);
  };

  const getGroupPageCount = (framework: string) => {
    if (!data[framework]) return 0;
    const groups = Object.keys(data[framework]);
    return Math.ceil(groups.length / GROUPS_PER_PAGE);
  };

  if (frameworks.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <div className="space-y-4">
      <Accordion
        type="single"
        collapsible
        value={expandedFramework}
        onValueChange={setExpandedFramework}
        className="w-full space-y-2"
      >
        {paginatedFrameworks.map((framework) => {
          if (!data[framework]) return null;

          const paginatedGroups = getPaginatedGroups(framework);
          const totalGroupPages = getGroupPageCount(framework);
          const currentGroupPage = groupPages[framework] || 1;

          return (
            <AccordionItem
              key={framework}
              value={framework}
              className="overflow-hidden rounded-lg border border-gray-200 shadow-sm"
            >
              <AccordionTrigger className="bg-white px-6 py-4 transition-colors hover:bg-gray-50">
                <div className="flex w-full items-center justify-between">
                  <span className="text-lg font-semibold">{framework}</span>
                  <span className="text-sm text-gray-600">
                    {Object.values(data[framework]).reduce((acc, items) => acc + items.length, 0)} item(s)
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <Accordion
                  type="single"
                  collapsible
                  value={expandedGroup}
                  onValueChange={setExpandedGroup}
                  className="w-full space-y-1 px-6 py-2"
                >
                  {paginatedGroups.map((group) => (
                    <AccordionItem
                      key={group}
                      value={group}
                      className="border-b border-gray-200 last:border-b-0"
                    >
                      <AccordionTrigger className="py-3 transition-colors hover:bg-gray-50">
                        <div className="flex w-full items-center justify-between">
                          <span className="font-medium">{group}</span>
                          <span className="text-sm text-gray-600">
                            {data[framework][group].length} item(s)
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="py-2">
                        <SharedDataTable
                          data={data[framework][group]}
                          columns={columns}
                          onRowClick={onRowClick}
                          showPagination={true}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
                {totalGroupPages > 1 && (
                  <div className="mt-4 flex items-center justify-center space-x-2">
                    <Button
                      onClick={() =>
                        setGroupPages((prev) => ({
                          ...prev,
                          [framework]: Math.max((prev[framework] || 1) - 1, 1),
                        }))
                      }
                      disabled={currentGroupPage === 1}
                      variant="outline"
                      size="sm"
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentGroupPage} of {totalGroupPages}
                    </span>
                    <Button
                      onClick={() =>
                        setGroupPages((prev) => ({
                          ...prev,
                          [framework]: Math.min((prev[framework] || 1) + 1, totalGroupPages),
                        }))
                      }
                      disabled={currentGroupPage === totalGroupPages}
                      variant="outline"
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {totalFrameworkPages > 1 && (
        <div className="mt-4 flex items-center justify-center space-x-2">
          <Button
            onClick={() => setFrameworkPage((prev) => Math.max(prev - 1, 1))}
            disabled={frameworkPage === 1}
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {frameworkPage} of {totalFrameworkPages}
          </span>
          <Button
            onClick={() => setFrameworkPage((prev) => Math.min(prev + 1, totalFrameworkPages))}
            disabled={frameworkPage === totalFrameworkPages}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
