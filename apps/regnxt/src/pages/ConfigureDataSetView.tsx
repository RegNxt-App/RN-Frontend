import {useNavigate} from 'react-router-dom';

import {Columns, Database, Group, Settings2, Table} from 'lucide-react';

import {Button} from '@rn/ui/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@rn/ui/components/ui/card';

const ConfigureDataSetView = () => {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-3xl font-bold">Configuration</h1>
      <p className="mb-8 text-lg text-gray-600">
        Welcome to the Configuration page. In the future, you'll be able to dynamically create and manage
        PostgreSQL tables, datasets, and columns.
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="mr-2" />
              Configure Datasets
            </CardTitle>
            <CardDescription>Define a new dataset structure</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Easily create new datasets to organize your data efficiently.</p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClickCapture={() => navigate('/bird/configuration/dataset')}
            >
              <Settings2 className="mr-2 h-4 w-4" /> Configure
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Table className="mr-2" />
              Configure Dataviews
            </CardTitle>
            <CardDescription>Configure your PostgreSQL tables</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Add, edit, or remove tables to match your data requirements.</p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant="outline"
            >
              Manage Tables
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Columns className="mr-2" />
              Configure Grouping
            </CardTitle>
            <CardDescription>Customize table columns</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Fine-tune your data structure with custom column configurations.</p>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant="secondary"
              onClickCapture={() => navigate('/bird/configuration/groups')}
            >
              <Group className="mr-2 h-4 w-4" /> Configure
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12 rounded-lg bg-gray-100 p-6">
        <h2 className="mb-4 text-2xl font-semibold">Coming Soon</h2>
        <p className="text-gray-600">
          We're working on bringing you powerful tools to create and manage your database configurations
          directly through this interface. Stay tuned for updates!
        </p>
      </div>
    </div>
  );
};

export default ConfigureDataSetView;
