import React, {useCallback, useState} from 'react';

import {useBackend} from '@/contexts/BackendContext';
import {Task} from '@/types/databaseTypes';
import {Loader2, SearchX} from 'lucide-react';
import useSWR from 'swr';

import {Input} from '@rn/ui/components/ui/input';

import {TasksList} from './TasksList';

interface TaskPanelProps {
  className?: string;
}

interface TasksResponse {
  count: number;
  num_pages: number;
  results: Task[];
}

export const TaskPanel: React.FC<TaskPanelProps> = ({className}) => {
  const {backendInstance} = useBackend();
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const {
    data: tasksResponse,
    error,
    isLoading,
  } = useSWR<TasksResponse>(`/api/v1/tasks/?search=${searchTerm}&page=${page}`, (url: string) =>
    backendInstance.get(url).then((r) => r.data)
  );

  const handleDragStart = useCallback((event: React.DragEvent, nodeData: any) => {
    event.dataTransfer.setData('application/json', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const hasNoResults = !isLoading && tasksResponse?.results.length === 0;

  return (
    <div className={`w-96 overflow-y-auto p-4 bg-white rounded-lg border ${className}`}>
      <h3 className="font-semibold mb-4">Available Tasks</h3>
      <Input
        placeholder="Search tasks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-full"
      />
      {error ? (
        <div className="text-sm text-red-500 p-4">Error loading tasks. Please try again.</div>
      ) : isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : hasNoResults ? (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <SearchX className="h-12 w-12 mb-4" />
          <p className="text-sm">No tasks found matching {searchTerm && `"${searchTerm}"`}</p>
        </div>
      ) : (
        <TasksList
          tasks={tasksResponse?.results || []}
          onDragStart={handleDragStart}
          currentPage={page}
          totalPages={tasksResponse?.num_pages || 1}
          onPageChange={setPage}
        />
      )}
    </div>
  );
};
