import React, {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import DeleteVariableDialog from '@/components/Variables/DeleteVariableDialog';
import VariableStats from '@/components/Variables/VariableStats';
import VariableTable from '@/components/Variables/VariableTable';
import {useBackend} from '@/contexts/BackendContext';
import {toast} from '@/hooks/use-toast';
import {Variable} from '@/types/databaseTypes';
import useSWR from 'swr';

import {Button} from '@rn/ui/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@rn/ui/components/ui/card';

const VARIABLES_ENDPOINT = '/api/v1/variables/';
interface VariablesResponse {
  count: number;
  num_pages: number;
  results: Variable[];
}

const Variables: React.FC = () => {
  const {backendInstance} = useBackend();
  const navigate = useNavigate();
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    variable: {variable_id: number; name: string} | null;
  }>({
    isOpen: false,
    variable: null,
  });

  const {
    data: variablesData,
    error: variablesError,
    mutate: refreshVariables,
  } = useSWR<VariablesResponse>(VARIABLES_ENDPOINT, (url: string) =>
    backendInstance.get(url).then((r) => r.data)
  );

  const handleDeleteClick = (variable: {variable_id: number; name: string}) => {
    setDeleteDialog({
      isOpen: true,
      variable,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.variable) return;

    try {
      await backendInstance.delete(`${VARIABLES_ENDPOINT}${deleteDialog.variable.variable_id}/`);
      await refreshVariables();
      toast({
        title: 'Success',
        description: 'Variable deleted successfully',
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to delete variable';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setDeleteDialog({isOpen: false, variable: null});
    }
  };

  const stats = useMemo(() => {
    if (!variablesData?.results) return {total: 0, active: 0, withDependencies: 0};

    const variables = variablesData.results;
    const withDependencies = variables.reduce((count, variable) => {
      return count + (variable.dependency_count > 0 ? 1 : 0);
    }, 0);

    return {
      total: variables.length,
      active: variables.filter((v) => v.is_active).length,
      withDependencies: withDependencies,
    };
  }, [variablesData?.results]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Application Variables</h1>
          <p className="text-sm text-muted-foreground">
            Manage global parameters accessible throughout the application
          </p>
        </div>

        <Button onClick={() => navigate('/orchestra/variables/create')}>Create Variable</Button>
      </div>

      <VariableStats stats={stats} />
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Variables</CardTitle>
              <CardDescription>A list of all configured application variables</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <VariableTable
            variables={variablesData?.results || []}
            onDeleteClick={handleDeleteClick}
          />
        </CardContent>
      </Card>

      <DeleteVariableDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={(isOpen) => setDeleteDialog((prev) => ({...prev, isOpen}))}
        variable={deleteDialog.variable}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default Variables;
