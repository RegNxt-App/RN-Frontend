import React from 'react';

import {ArrowUpRight, Gauge, Network, ToggleLeft} from 'lucide-react';

import {Card, CardContent, CardHeader, CardTitle} from '@rn/ui/components/ui/card';

interface VariableStatsProps {
  stats: {
    total: number;
    active: number;
    withDependencies: number;
  };
}

const VariableStats: React.FC<VariableStatsProps> = ({stats}) => {
  const statCards = [
    {
      title: 'Total Variables',
      value: stats.total,
      icon: <Gauge className="h-4 w-4 text-muted-foreground" />,
      description: 'Total configured variables',
      showTrend: true,
    },
    {
      title: 'Active Variables',
      value: stats.active,
      icon: <ToggleLeft className="h-4 w-4 text-muted-foreground" />,
      description: 'Currently active variables',
    },
    {
      title: 'With Dependencies',
      value: stats.withDependencies,
      icon: <Network className="h-4 w-4 text-muted-foreground" />,
      description: 'Variables with dependencies',
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

export default VariableStats;
