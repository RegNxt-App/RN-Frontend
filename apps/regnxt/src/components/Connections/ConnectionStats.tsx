import React from 'react';

import {ArrowUpRight, Database, Link2, ServerIcon} from 'lucide-react';

import {Card, CardContent, CardHeader, CardTitle} from '@rn/ui/components/ui/card';

interface ConnectionStatsProps {
  stats: {
    total: number;
    databases: number;
    storage: number;
  };
}

const ConnectionStats: React.FC<ConnectionStatsProps> = ({stats}) => {
  const statCards = [
    {
      title: 'Total Connections',
      value: stats.total,
      icon: <Database className="h-4 w-4 text-muted-foreground" />,
      description: 'Active and configured connections',
      showTrend: true,
    },
    {
      title: 'Database Connections',
      value: stats.databases,
      icon: <ServerIcon className="h-4 w-4 text-muted-foreground" />,
      description: 'PostgreSQL databases connected',
    },
    {
      title: 'Storage Connections',
      value: stats.storage,
      icon: <Link2 className="h-4 w-4 text-muted-foreground" />,
      description: 'Cloud storage integrations',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {statCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            {card.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              {card.showTrend && <ArrowUpRight className="mr-1 inline h-4 w-4 text-green-500" />}
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ConnectionStats;
