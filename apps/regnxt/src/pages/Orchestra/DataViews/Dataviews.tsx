import {useCallback, useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import {DataViewsTable} from '@/components/dataviews/DataViewsTable';
import {useBackend} from '@/contexts/BackendContext';
import {useToast} from '@/hooks/use-toast';
import {ArrowUpRight, BarChart3, Database, FileText, PlusCircle} from 'lucide-react';
import useSWR, {mutate} from 'swr';

import {Button} from '@rn/ui/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@rn/ui/components/ui/card';

interface DataView {
  dataview_id: number;
  code: string;
  label: string;
  description: string;
  framework: string;
  type: string;
  is_system_generated: boolean;
  is_visible: boolean;
  data_objects: any[];
  data_joins: any[];
  data_fields: any[];
  data_filters: any[];
  data_aggregations: any[];
  version_nr: number;
  version_code: string;
}

interface DataViewsResponse {
  data: {
    count: number;
    current_page: number;
    num_pages: number;
    page_size: number;
    results: DataView[];
    filters_applied: {
      search: string | null;
      framework?: string;
      type?: string;
    };
  };
}

export default function Dataviews() {
  const navigate = useNavigate();
  const {backendInstance} = useBackend();
  const {toast} = useToast();
  const [searchParams, setSearchParams] = useState({
    page: 1,
    page_size: 10,
    search: '',
    framework: '',
    type: '',
  });

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        await backendInstance.delete(`/api/v1/dataviews/${id}/`);

        await mutate(
          `/api/v1/dataviews/?page=${searchParams.page}&page_size=${searchParams.page_size}${
            searchParams.search ? `&search=${searchParams.search}` : ''
          }${searchParams.framework ? `&framework=${searchParams.framework}` : ''}${
            searchParams.type ? `&type=${searchParams.type}` : ''
          }`
        );

        toast({
          title: 'Success',
          description: 'Data view deleted successfully',
        });
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.response?.data?.error || 'Failed to delete data view',
          variant: 'destructive',
        });
      }
    },
    [backendInstance, searchParams, toast]
  );

  const {
    data: viewsData,
    error,
    isLoading,
  } = useSWR<DataViewsResponse>(
    `/api/v1/dataviews/?page=${searchParams.page}&page_size=${searchParams.page_size}${
      searchParams.search ? `&search=${searchParams.search}` : ''
    }${searchParams.framework ? `&framework=${searchParams.framework}` : ''}${
      searchParams.type ? `&type=${searchParams.type}` : ''
    }`,
    backendInstance
  );

  const stats = useMemo(() => {
    if (!viewsData?.data)
      return {
        total: 0,
        active: 0,
        linkedDatasets: 0,
      };

    return {
      total: viewsData.data.count,
      active: viewsData.data.results?.filter((view) => view.is_visible).length,
      linkedDatasets: viewsData.data.results?.reduce((acc, view) => acc + view.data_objects.length, 0),
    };
  }, [viewsData]);

  console.log("console.log('Table Data:', data);: ", viewsData);

  if (error) {
    return <div>Error loading data views: {error.message}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Views</h1>
          <p className="text-sm text-muted-foreground">Manage and analyze your data views</p>
        </div>

        <Button
          className="w-full md:w-auto"
          onClickCapture={() => navigate('/orchestra/dataviews/create')}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Create New View
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Data Views</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 inline h-4 w-4 text-green-500" />
              Total data views
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Views</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 inline h-4 w-4 text-green-500" />
              Currently visible views
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Linked Datasets</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.linkedDatasets}</div>
            <p className="text-xs text-muted-foreground">Total linked data objects</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Data Views</CardTitle>
              <CardDescription>A list of all data views in your organization</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataViewsTable
            data={viewsData?.data?.results ?? []}
            pagination={{
              pageCount: viewsData?.data?.num_pages ?? 0,
              pageSize: viewsData?.data?.page_size ?? 10,
              currentPage: viewsData?.data?.current_page ?? 1,
              totalCount: viewsData?.data?.count ?? 0,
            }}
            isLoading={isLoading}
            onPageChange={(page) => setSearchParams((prev) => ({...prev, page}))}
            onSearch={(search) => {
              // Reset the page when search changes
              setSearchParams((prev) => ({
                ...prev, 
                search,
                page: 1
              }));
            }}
            onFilterChange={(filters) =>
              setSearchParams((prev) => ({
                ...prev,
                ...filters,
                page: 1,
              }))
            }
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
}
