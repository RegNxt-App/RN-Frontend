import React from 'react';

import ConfigureDatasets from '@/components/configurations/ConfigureDatasets';
import {ConfigureDataviews} from '@/components/configurations/ConfigureDataviews';
import ConfigureGrouping from '@/components/configurations/ConfigureGrouping';
import {Database, LayersIcon, Table} from 'lucide-react';

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@rn/ui/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@rn/ui/components/ui/tabs';

const Configuration: React.FC = () => {
  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-8 text-3xl font-bold">Configuration</h1>

      <Tabs
        defaultValue="datasets"
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="datasets">Configure Datasets</TabsTrigger>
          <TabsTrigger value="dataviews">Configure Dataviews</TabsTrigger>
          <TabsTrigger value="grouping">Configure Grouping</TabsTrigger>
        </TabsList>

        <TabsContent value="datasets">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="mr-2" />
                Configure Datasets
              </CardTitle>
              <CardDescription>Manage datasets, versions, and columns</CardDescription>
            </CardHeader>
            <CardContent>
              <ConfigureDatasets />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dataviews">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Table className="mr-2" />
                Configure Dataviews
              </CardTitle>
              <CardDescription>Create complex views based on existing datasets or dataviews</CardDescription>
            </CardHeader>
            <CardContent>
              <ConfigureDataviews />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="grouping">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LayersIcon className="mr-2" />
                Configure Grouping
              </CardTitle>
              <CardDescription>Manage groups and dataset versions</CardDescription>
            </CardHeader>
            <CardContent>
              <ConfigureGrouping />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Configuration;
