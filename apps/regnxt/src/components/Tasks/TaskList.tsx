import React from 'react';

import {Task} from '@/types/databaseTypes';
import {FileText} from 'lucide-react';

import {Card} from '@rn/ui/components/ui/card';
import {ScrollArea} from '@rn/ui/components/ui/scroll-area';
import {Tabs, TabsList, TabsTrigger} from '@rn/ui/components/ui/tabs';

import {CategoryGroup} from './CategoryGroup';
import {TaskSearch} from './TaskSearch';

interface TaskListProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  categories: Array<any>;
  expandedCategories: string[];
  expandedSubtypes: string[];
  onCategoryToggle: (category: string) => void;
  onSubtypeToggle: (subtypeKey: string) => void;
  onTaskSelect: (task: Task) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  searchQuery,
  onSearchChange,
  categories,
  expandedCategories,
  expandedSubtypes,
  onCategoryToggle,
  onSubtypeToggle,
  onTaskSelect,
}) => (
  <Card className="w-full lg:w-96 xl:w-[33%]">
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Task Categories</h2>
      <Tabs
        defaultValue="all"
        className="w-full"
      >
        <TabsList className="w-full mb-4">
          <TabsTrigger
            value="all"
            className="flex-1"
          >
            All Tasks
          </TabsTrigger>
          <TabsTrigger
            value="recent"
            className="flex-1"
          >
            Recent Tasks
          </TabsTrigger>
        </TabsList>

        <div className="mb-4">
          <TaskSearch
            value={searchQuery}
            onChange={onSearchChange}
          />
        </div>

        <ScrollArea className="h-[calc(100vh-24rem)]">
          <div className="space-y-1">
            {categories.map((category) => (
              <CategoryGroup
                key={category.name}
                {...category}
                isExpanded={expandedCategories.includes(category.name)}
                expandedSubtypes={expandedSubtypes}
                onToggle={() => onCategoryToggle(category.name)}
                onSubtypeToggle={onSubtypeToggle}
                onTaskSelect={onTaskSelect}
              />
            ))}
            {searchQuery && categories.length === 0 && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">No tasks found matching "{searchQuery}"</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  </Card>
);
