import React from 'react';

import {Task} from '@/types/databaseTypes';
import {ArrowLeftRight, Clock, CodeXml, FileText, Plus, Save, Settings2} from 'lucide-react';

import {StatsCard} from './StatsCard';

interface TaskStatsProps {
  tasks: Task[];
}

export const TaskStats: React.FC<TaskStatsProps> = ({tasks}) => {
  const stats = React.useMemo(() => {
    if (!Array.isArray(tasks)) return [];

    const totalTasks = tasks.length;
    const predefinedTasks = tasks.filter((t) => t.is_predefined).length;
    const customTasks = totalTasks - predefinedTasks;
    const categories = new Set(tasks.map((t) => t.task_type_label)).size;
    const now = new Date();

    return [
      {
        title: 'Total Tasks',
        count: totalTasks.toString(),
        description: `Active across ${categories} categories`,
        titleIcon: <FileText className="w-4 h-4" />,
        descriptionIcon: <ArrowLeftRight className="w-3 h-3 text-gray-400" />,
      },
      {
        title: 'Predefined Tasks',
        count: predefinedTasks.toString(),
        description: 'System defined templates',
        titleIcon: <CodeXml className="w-4 h-4" />,
        descriptionIcon: <Save className="w-3 h-3 text-gray-400" />,
      },
      {
        title: 'Custom Tasks',
        count: customTasks.toString(),
        description: 'User defined workflows',
        titleIcon: <Settings2 className="w-4 h-4" />,
        descriptionIcon: <Plus className="w-3 h-3 text-gray-400" />,
      },
      {
        title: 'Last Updated',
        count: now.toLocaleDateString(),
        description: now.toLocaleTimeString(),
        titleIcon: <Clock className="w-4 h-4" />,
        descriptionIcon: <ArrowLeftRight className="w-3 h-3 text-gray-400" />,
      },
    ];
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 lg:mb-8">
      {stats.map((stat, index) => (
        <StatsCard
          key={index}
          {...stat}
        />
      ))}
    </div>
  );
};
