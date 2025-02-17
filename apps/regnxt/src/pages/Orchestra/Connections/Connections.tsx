import React, {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import ConnectionStats from '@/components/Connections/ConnectionStats';
import ConnectionTable from '@/components/Connections/ConnectionTable';
import DeleteConnectionDialog from '@/components/Connections/DeleteConnectionDialog';
import {useBackend} from '@/contexts/BackendContext';
import {toast} from '@/hooks/use-toast';
import {ConnectionType} from '@/types/databaseTypes';
import useSWR from 'swr';

import {Button} from '@rn/ui/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@rn/ui/components/ui/card';

const CONNECTIONS_TYPES_ENDPOINT = '/api/v1/connections/list-types/';
const CONNECTIONS_ENDPOINT = '/api/v1/connections/';

interface ConnectionsResponse {
  count: number;
  num_pages: number;
  results: Array<{
    id: number;
    name: string;
    type_id: number;
    type_name: string;
    connection_string: string;
    is_system_generated: boolean;
    created_at: string;
    created_by: string | null;
  }>;
}

const Connections: React.FC = () => {
  const {backendInstance} = useBackend();
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    connection: {id: number; name: string} | null;
  }>({
    isOpen: false,
    connection: null,
  });

  const {data: connectionTypes, error: typesError} = useSWR<ConnectionType[]>(
    CONNECTIONS_TYPES_ENDPOINT,
    (url: string) => backendInstance.get(url).then((r) => r.data)
  );

  const {
    data: connectionsData,
    error: connectionsError,
    mutate: refreshConnections,
  } = useSWR<ConnectionsResponse>(CONNECTIONS_ENDPOINT, (url: string) =>
    backendInstance.get(url).then((r) => r.data)
  );

  const handleDeleteClick = (connection: {id: number; name: string}) => {
    setDeleteDialog({
      isOpen: true,
      connection,
    });
  };
  const handleDeleteConfirm = async () => {
    if (!deleteDialog.connection) return;

    try {
      await backendInstance.delete(`${CONNECTIONS_ENDPOINT}${deleteDialog.connection.id}/`);
      await refreshConnections();
      toast({
        title: 'Success',
        description: 'Connection deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete connection',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialog({isOpen: false, connection: null});
    }
  };

  const handleEditConnection = async (id: number) => {
    try {
      console.log('Editing connection:', id);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to edit connection',
        variant: 'destructive',
      });
    }
  };

  if (typesError || connectionsError) {
    return (
      <div className="p-6 text-center text-red-500">
        Error loading data: {typesError?.message || connectionsError?.message}
      </div>
    );
  }

  const stats = useMemo(() => {
    if (!connectionsData?.results) return {total: 0, databases: 0, storage: 0};

    const connections = connectionsData.results;
    return {
      total: connections.length,
      databases: connections.filter((conn) => conn.type_id === 1).length,
      storage: connections.filter((conn) => conn.type_id > 1).length,
    };
  }, [connectionsData?.results]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Connections</h1>
          <p className="text-sm text-muted-foreground">Manage your database and storage connections</p>
        </div>

        <Button onClick={() => navigate('/orchestra/connections/new')}>Create Connection</Button>
      </div>

      <ConnectionStats stats={stats} />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Connections</CardTitle>
              <CardDescription>A list of all configured data connections</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ConnectionTable
            connections={connectionsData?.results || []}
            onEdit={handleEditConnection}
            onDeleteClick={handleDeleteClick}
          />
        </CardContent>
      </Card>
      <DeleteConnectionDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={(isOpen) => setDeleteDialog((prev) => ({...prev, isOpen}))}
        connection={deleteDialog.connection}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default Connections;
