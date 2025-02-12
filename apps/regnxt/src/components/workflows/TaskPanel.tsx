import React, {useCallback, useState} from 'react';

import {orchestraBackendInstance} from '@/lib/axios';
import {Task} from '@/types/databaseTypes';
import {Loader2} from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  const {
    data: tasksResponse,
    error,
    isLoading,
  } = useSWR<TasksResponse>(`/api/v1/tasks/?search=${searchTerm}&page=${page}`, async (url: string) => {
    const response = await orchestraBackendInstance.get(url);
    return response.data;
  });

  const handleDragStart = useCallback((event: React.DragEvent, nodeData: any) => {
    event.dataTransfer.setData('application/json', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  return (
    <div className={`w-74 overflow-y-auto ${className}`}>
      <h3 className="font-semibold mb-4">Available Tasks</h3>
      <Input
        placeholder="Search tasks..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4"
      />
      {error ? (
        <div className="text-sm text-red-500 p-4">Error loading tasks. Please try again.</div>
      ) : isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
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
