import {useEffect, useState} from 'react';

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

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

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
import {Input} from '@rn/ui/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';
import {Skeleton} from '@rn/ui/components/ui/skeleton';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@rn/ui/components/ui/table';

interface ApiDataView {
  dataview_id: number;
  code: string;
  label: string;
  description: string;
  framework: string;
  type: string;
  is_system_generated: boolean;
  is_visible: boolean;
  version_nr: number;
  version_code: string;
}

export const columns: ColumnDef<ApiDataView>[] = [
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
    accessorKey: 'label',
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
    accessorKey: 'description',
    header: 'Description',
    cell: ({row}) => <div className="max-w-[500px] truncate">{row.getValue('description')}</div>,
  },
  {
    accessorKey: 'framework',
    header: 'Framework',
  },
  {
    accessorKey: 'type',
    header: 'Type',
    cell: ({row}) => <div className="capitalize">{row.getValue('type')}</div>,
  },
  {
    accessorKey: 'is_visible',
    header: 'Status',
    cell: ({row}) => {
      const isVisible = row.getValue('is_visible');
      return <Badge variant={isVisible ? 'default' : 'secondary'}>{isVisible ? 'Active' : 'Inactive'}</Badge>;
    },
  },
  {
    accessorKey: 'version_code',
    header: 'Version',
  },
  {
    id: 'actions',
    cell: ({row, table}) => {
      const dataView = row.original;
      const {onDelete} = table.options.meta || {};

      const handleDelete = async () => {
        if (onDelete && typeof onDelete === 'function') {
          try {
            await onDelete(dataView.dataview_id);
          } catch (error) {
            console.error('Failed to delete dataview:', error);
          }
        }
      };

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(dataView.dataview_id.toString())}>
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href={`/orchestra/dataviews/${dataView.dataview_id}/edit`}>Edit</a>
            </DropdownMenuItem>
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            {dataView.is_visible && <DropdownMenuItem>Archive</DropdownMenuItem>}
            <DropdownMenuSeparator />
            {!dataView.is_system_generated && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleDelete}
              >
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

interface DataViewColumnFiltersProps {
  filters: {
    code: string;
    label: string;
    type: string;
    framework: string;
    description: string;
  };
  setFilter: (key: string, value: string) => void;
}

const DataViewColumnFilters: React.FC<DataViewColumnFiltersProps> = ({filters, setFilter}) => {
  // Internal state for immediate UI feedback
  const [localFilters, setLocalFilters] = useState({
    code: filters.code || '',
    label: filters.label || '',
    description: filters.description || '',
  });

  // Debounce the text filter values with a 500ms delay
  const debouncedCode = useDebounce(localFilters.code, 500);
  const debouncedLabel = useDebounce(localFilters.label, 500);
  const debouncedDescription = useDebounce(localFilters.description, 500);

  // Update parent filters when debounced values change
  useEffect(() => {
    if (debouncedCode !== filters.code) {
      setFilter('code', debouncedCode);
    }
  }, [debouncedCode, filters.code, setFilter]);

  useEffect(() => {
    if (debouncedLabel !== filters.label) {
      setFilter('label', debouncedLabel);
    }
  }, [debouncedLabel, filters.label, setFilter]);

  useEffect(() => {
    if (debouncedDescription !== filters.description) {
      setFilter('description', debouncedDescription);
    }
  }, [debouncedDescription, filters.description, setFilter]);

  // Handle local input changes
  const handleInputChange = (key: string, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      <Input
        placeholder="Filter by Code"
        value={localFilters.code}
        onChange={(e) => handleInputChange('code', e.target.value)}
        className="max-w-sm"
      />
      <Input
        placeholder="Filter by Name"
        value={localFilters.label}
        onChange={(e) => handleInputChange('label', e.target.value)}
        className="max-w-sm"
      />
      <Select
        value={filters.framework || 'all'}
        onValueChange={(value) => setFilter('framework', value === 'all' ? '' : value)}
      >
        <SelectTrigger className="max-w-sm">
          <SelectValue placeholder="Filter by Framework" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Frameworks</SelectItem>
          <SelectItem value="framework1">Framework 1</SelectItem>
          <SelectItem value="framework2">Framework 2</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.type || 'all'}
        onValueChange={(value) => setFilter('type', value === 'all' ? '' : value)}
      >
        <SelectTrigger className="max-w-sm">
          <SelectValue placeholder="Filter by Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="standard">Standard</SelectItem>
          <SelectItem value="aggregation">Aggregation</SelectItem>
        </SelectContent>
      </Select>
      <Input
        placeholder="Filter by Description"
        value={localFilters.description}
        onChange={(e) => handleInputChange('description', e.target.value)}
        className="max-w-sm"
      />
    </div>
  );
};

const DataViewsTableSkeleton = () => {
  return (
    <div className="w-full space-y-6">
      {/* Filters skeleton */}
      <div className="flex gap-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton
            key={i}
            className="h-10 w-[200px]"
          />
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-md border">
        <div className="divide-y">
          {/* Header skeleton */}
          <div className="bg-muted/50 p-4">
            <div className="grid grid-cols-8 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-8"
                />
              ))}
            </div>
          </div>

          {/* Rows skeleton */}
          {[...Array(5)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="p-4"
            >
              <div className="grid grid-cols-8 gap-4">
                {[...Array(8)].map((_, colIndex) => (
                  <Skeleton
                    key={colIndex}
                    className="h-8"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[250px]" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-[100px]" />
          <Skeleton className="h-8 w-[100px]" />
        </div>
      </div>
    </div>
  );
};

interface DataViewsTableProps {
  data: ApiDataView[];
  pagination: {
    pageCount: number;
    pageSize: number;
    currentPage: number;
    totalCount: number;
  };
  onPageChange: (page: number) => void;
  onSearch: (search: string) => void;
  onFilterChange: (filters: {framework?: string; type?: string}) => void;
  onDelete?: (id: number) => Promise<void>;
  isLoading?: boolean;
}

export function DataViewsTable({
  data = [],
  pagination,
  onPageChange,
  onSearch,
  onFilterChange,
  onDelete,
  isLoading = false,
}: DataViewsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = useState({
    code: '',
    label: '',
    type: '',
    framework: '',
    description: '',
  });

  const table = useReactTable({
    data,
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
        pageIndex: (pagination?.currentPage ?? 1) - 1,
        pageSize: pagination?.pageSize ?? 10,
      },
    },
    manualPagination: true,
    pageCount: pagination?.pageCount ?? 0,
    meta: {
      onDelete: onDelete,
    },
  });

  if (isLoading) {
    return <DataViewsTableSkeleton />;
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 py-4">
        <DataViewColumnFilters
          filters={columnFilters}
          setFilter={(key, value) => {
            setColumnFilters((prev) => ({...prev, [key]: value}));

            // Handle different filter types
            if (key === 'type' || key === 'framework') {
              // For type and framework, send as backend filter parameters
              onFilterChange({[key]: value});
            } else if (key === 'code' || key === 'label' || key === 'description') {
              // For searchable fields, use the search parameter
              // Only use the value from the current filter being changed
              onSearch(value);
            }
          }}
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

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{' '}
          {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)} of{' '}
          {pagination.totalCount} entries
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.pageCount}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
