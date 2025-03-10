import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';

import {Variable} from '@/types/databaseTypes';
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
import {ArrowUpDown, ChevronLeft, ChevronRight, Edit, Network, Trash2} from 'lucide-react';

import {Badge} from '@rn/ui/components/ui/badge';
import {Button} from '@rn/ui/components/ui/button';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@rn/ui/components/ui/table';

import {VariableSearch} from './VariableSearch';

interface VariableTableProps {
  variables: Variable[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onDeleteClick: (variable: {variable_id: number; name: string}) => void;
}

const VariableTable: React.FC<VariableTableProps> = ({
  variables,
  onDeleteClick,
  searchQuery,
  onSearchChange,
}) => {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);

  const columns: ColumnDef<Variable>[] = [
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
      cell: ({row}) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'label',
      header: ({column}) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Label
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({row}) => <div>{row.getValue('label')}</div>,
    },
    {
      accessorKey: 'data_type',
      header: ({column}) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Type
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({row}) => {
        const dataType = row.getValue('data_type') as string;
        const badgeVariants: Record<string, string> = {
          string: 'default',
          number: 'secondary',
          boolean: 'outline',
          enum: 'destructive',
          date: 'blue',
        };
        const variant = badgeVariants[dataType] || 'default';

        return <Badge variant={variant as any}>{dataType}</Badge>;
      },
    },
    {
      accessorKey: 'default_value',
      header: 'Default Value',
      cell: ({row}) => {
        const value = row.getValue('default_value');
        return (
          <div className="truncate max-w-[200px]">
            {value !== null && value !== undefined ? String(value) : 'N/A'}
          </div>
        );
      },
    },
    {
      id: 'dependencies',
      header: 'Dependencies',
      cell: ({row}) => {
        const count = row.original.dependency_count || 0;
        return (
          <div className="flex items-center gap-1">
            <Network className="h-4 w-4 text-muted-foreground" />
            <span>{count}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({row}) => {
        const isActive = row.getValue('is_active') as boolean;
        return (
          <Badge variant={isActive ? 'default' : 'destructive'}>{isActive ? 'Active' : 'Inactive'}</Badge>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({row}) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/orchestra/variables/${row.original.variable_id}/edit`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              onDeleteClick({
                variable_id: row.original.variable_id,
                name: row.original.name,
              })
            }
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: variables,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
      pagination: {
        pageIndex,
        pageSize,
      },
      globalFilter: searchQuery,
    },
    onGlobalFilterChange: onSearchChange,
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(columnId);
      return value !== undefined && value !== null
        ? String(value).toLowerCase().includes(filterValue.toLowerCase())
        : false;
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        const newState = updater({
          pageIndex,
          pageSize,
        });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(updater.pageSize);
      }
    },
    pageCount: Math.ceil(variables.length / pageSize),
  });

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPageIndex(0);
  };

  return (
    <div className="w-full space-y-4">
      <VariableSearch
        value={searchQuery}
        onChange={onSearchChange}
      />
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
                <TableRow key={row.id}>
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
                  No variables found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => handlePageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[5, 10, 20, 30, 40, 50].map((size) => (
                <SelectItem
                  key={size}
                  value={`${size}`}
                >
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1 text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VariableTable;
