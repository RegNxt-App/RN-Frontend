import {useNavigate} from 'react-router-dom';

import {DataViewsTable} from '@/components/dataviews/DataViewsTable';
import {ArrowUpRight, BarChart3, Database, FileText, PlusCircle} from 'lucide-react';

import {Button} from '@rn/ui/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@rn/ui/components/ui/card';

export default function Dataviews() {
  const navigate = useNavigate();
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
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 inline h-4 w-4 text-green-500" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Views</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              <ArrowUpRight className="mr-1 inline h-4 w-4 text-green-500" />
              +5% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Linked Datasets</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">32</div>
            <p className="text-xs text-muted-foreground">Across all data views</p>
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
          <DataViewsTable />
        </CardContent>
      </Card>
    </div>
  );
}
