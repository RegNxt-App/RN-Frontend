import React from 'react';

import {Card} from '@rn/ui/components/ui/card';

interface StatsCardProps {
  title: string;
  count: string;
  description: string;
  titleIcon: React.ReactNode;
  descriptionIcon: React.ReactNode;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  count,
  description,
  titleIcon,
  descriptionIcon,
}) => (
  <Card className="p-4 lg:p-6">
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold">{title}</p>
        {titleIcon}
      </div>
      <p className="text-2xl font-bold">{count}</p>
      <div className="flex items-center gap-1.5">
        {descriptionIcon}
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  </Card>
);
