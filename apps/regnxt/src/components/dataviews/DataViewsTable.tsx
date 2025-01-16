import {useState} from 'react';

import {SharedColumnFilters} from '@/components/SharedFilters';
import {
  ColumnDef,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {ArrowUpDown, MoreHorizontal} from 'lucide-react';

import {Badge} from '@rn/ui/components/ui/badge';
import {Button} from '@rn/ui/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@rn/ui/components/ui/dropdown-menu';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@rn/ui/components/ui/table';

export type DataView = {
  id: string;
  code: string;
  name: string;
  type: string;
  framework: string;
  status: 'active' | 'draft' | 'archived';
  lastModified: string;
  createdBy: string;
  label?: string;
  description?: string;
  group?: string;
};

const data: DataView[] = [
  {
    id: '1',
    code: 'CUST_TRANS',
    name: 'Customer Transactions',
    type: 'Financial',
    framework: 'Basel III',
    status: 'active',
    lastModified: '2024-01-07',
    createdBy: 'John Doe',
  },
  {
    id: '2',
    code: 'RISK_ASSESS',
    name: 'Risk Assessment',
    type: 'Regulatory',
    framework: 'FINREP',
    status: 'active',
    lastModified: '2024-01-06',
    createdBy: 'Jane Smith',
  },
];

export const columns: ColumnDef<DataView>[] = [
  {
    accessorKey: 'code',
    header: ({column}) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Code
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({row}) => <div className="font-medium">{row.getValue('code')}</div>,
  },
  {
    accessorKey: 'name',
    header: ({column}) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({row}) => <div className="capitalize">{row.getValue('type')}</div>,
  },
  {
    accessorKey: 'framework',
    header: 'Framework',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({row}) => {
      const status = row.getValue('status') as string;
      return (
        <Badge variant={status === 'active' ? 'default' : status === 'draft' ? 'secondary' : 'outline'}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'lastModified',
    header: 'Last Modified',
  },
  {
    accessorKey: 'createdBy',
    header: 'Created By',
  },
  {
    id: 'actions',
    cell: ({row}) => {
      const dataView = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(dataView.id)}>
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href={`/edit-data-view/${dataView.id}`}>Edit</a>
            </DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Archive</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function DataViewsTable() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState({
    code: '',
    label: '',
    type: '',
    group: '',
    description: '',
  });

  // Apply filters to the data
  const filteredData = data.filter((item) => {
    return Object.entries(columnFilters).every(([key, value]) => {
      if (!value) return true;

      // Special handling for group filtering
      if (key === 'group') {
        if (!item.group) return false;
        return item.group.toLowerCase().includes(value.toLowerCase());
      }

      // Handle label (which maps to name in our data)
      if (key === 'label' && item.name) {
        return item.name.toLowerCase().includes(value.toLowerCase());
      }

      // For all other fields
      const itemValue = item[key as keyof typeof item];
      if (!itemValue) return false;
      return itemValue.toString().toLowerCase().includes(value.toLowerCase());
    });
  });

  const table = useReactTable({
    data: filteredData, // Use the filtered data
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 py-4">
        <SharedColumnFilters
          filters={columnFilters}
          setFilter={(key, value) => setColumnFilters((prev) => ({...prev, [key]: value}))}
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length}{' '}
          row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
