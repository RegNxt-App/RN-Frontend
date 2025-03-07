import React from 'react';

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {ArrowLeftRight, Database, GitBranch, GitMerge} from 'lucide-react';

interface LineageStatsProps {
  stats: {
    totalDatasets: number;
    sourcesOrDestinationsCount: number;
    connectionsCount: number;
    transformationsCount: number;
  };
  direction: 'source-to-destination' | 'destination-to-source';
}

const LineageStats: React.FC<LineageStatsProps> = ({stats, direction}) => {
  const statCards = [
    {
      title: 'Total Datasets',
      value: stats.totalDatasets || 0,
      icon: <Database className="h-4 w-4 text-blue-500" />,
      description: 'Datasets available for lineage',
    },
    {
      title: direction === 'source-to-destination' ? 'Source Datasets' : 'Destination Datasets',
      value: stats.sourcesOrDestinationsCount || 0,
      icon: <GitBranch className="h-4 w-4 text-indigo-500" />,
      description: direction === 'source-to-destination' ? 'Origin data points' : 'Target data points',
      valueColor: 'text-indigo-600',
    },
    {
      title: 'Connections',
      value: stats.connectionsCount || 0,
      icon: <ArrowLeftRight className="h-4 w-4 text-green-500" />,
      description: 'Dataset relationships',
      valueColor: 'text-green-600',
    },
    {
      title: 'Transformations',
      value: stats.transformationsCount || 0,
      icon: <GitMerge className="h-4 w-4 text-amber-500" />,
      description: 'Data transformation rules',
      valueColor: 'text-amber-600',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${card.valueColor || ''}`}>{card.value}</div>
              <p className="text-xs text-muted-foreground">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LineageStats;
