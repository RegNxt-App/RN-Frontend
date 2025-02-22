import React from 'react';

import {ActivitySquare, CheckCircle, PlayCircle, XCircle} from 'lucide-react';

import {Card, CardContent, CardHeader, CardTitle} from '@rn/ui/components/ui/card';

interface WorkflowStatsProps {
  stats: {
    total: number;
    active: number;
    configured: number;
    inactive: number;
  };
}

const WorkflowStats: React.FC<WorkflowStatsProps> = ({stats}) => {
  const statCards = [
    {
      title: 'Total Workflows',
      value: stats.total,
      icon: <ActivitySquare className="h-4 w-4 text-muted-foreground" />,
      description: 'Total configured workflows',
    },
    {
      title: 'Active & Deployed',
      value: stats.active,
      icon: <PlayCircle className="h-4 w-4 text-blue-500" />,
      description: 'Workflows in production',
      valueColor: 'text-blue-600',
    },
    {
      title: 'Configured',
      value: stats.configured,
      icon: <CheckCircle className="h-4 w-4 text-green-500" />,
      description: 'Ready to be deployed',
      valueColor: 'text-green-600',
    },
    {
      title: 'Inactive',
      value: stats.inactive,
      icon: <XCircle className="h-4 w-4 text-red-500" />,
      description: 'Disabled workflows',
      valueColor: 'text-red-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
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
  );
};

export default WorkflowStats;
