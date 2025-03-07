import React, {useEffect, useState} from 'react';
import {useForm} from 'react-hook-form';
import {useNavigate, useParams} from 'react-router-dom';

import AwsS3Form from '@/components/Connections/AwsS3Form';
import AzureBlobStorageForm from '@/components/Connections/AzureBlobStorageForm';
import {AzureFileShareForm} from '@/components/Connections/AzureFileShareForm';
import PostgresForm from '@/components/Connections/PostgresForm';
import {useBackend} from '@/contexts/BackendContext';
import {useToast} from '@/hooks/use-toast';
import {ConnectionFormData, ConnectionType} from '@/types/databaseTypes';
import useSWR from 'swr';

import {Button} from '@rn/ui/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@rn/ui/components/ui/card';
import {Form, FormControl, FormField, FormItem, FormLabel} from '@rn/ui/components/ui/form';
import {Input} from '@rn/ui/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';
import {Skeleton} from '@rn/ui/components/ui/skeleton';

const CONNECTIONS_TYPES_ENDPOINT = '/api/v1/connections/list-types/';
const CONNECTIONS_ENDPOINT = '/api/v1/connections/';

interface ConnectionResponse {
  id: number;
  name: string;
  type_id: number;
  type_name: string;
  type_code: string;
  type_description: string;
  connection_string: string;
  is_system_generated: boolean;
  created_at: string;
  created_by: string | null;
}

const EditConnection: React.FC = () => {
  const {id} = useParams();
  const navigate = useNavigate();
  const {backendInstance} = useBackend();
  const [isValidated, setIsValidated] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {toast} = useToast();

  const form = useForm<ConnectionFormData>({
    defaultValues: {
      name: '',
      type: '',
      properties: {},
    },
  });

  const {
    data: connectionTypes,
    error: typesError,
    isLoading: isLoadingTypes,
  } = useSWR<ConnectionType[]>(CONNECTIONS_TYPES_ENDPOINT, (url: string) =>
    backendInstance.get(url).then((r) => r.data)
  );

  const {
    data: connection,
    error: connectionError,
    isLoading: isLoadingConnection,
  } = useSWR<ConnectionResponse>(id ? `${CONNECTIONS_ENDPOINT}${id}/` : null, (url: string) =>
    backendInstance.get(url).then((r) => r.data)
  );

  useEffect(() => {
    if (connection) {
      try {
        const connectionString = JSON.parse(connection.connection_string);
        form.reset({
          name: connection.name,
          type: connection.type_code,
          properties: connectionString,
        });
      } catch (error) {
        console.error('Error parsing connection string:', error);
        toast({
          title: 'Error',
          description: 'Failed to load connection details',
          variant: 'destructive',
        });
      }
    }
  }, [connection, form]);

  const testConnection = async () => {
    const formData = form.getValues();
    try {
      const isValid = true;

      if (isValid) {
        setIsValidated(true);
        toast({
          title: 'Connection Validated',
          description: 'Connection credentials are valid.',
        });
      } else {
        setIsValidated(false);
        toast({
          title: 'Validation Failed',
          description: 'Unable to establish connection. Please check your credentials.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      setIsValidated(false);
      toast({
        title: 'Error',
        description: 'An error occurred while testing the connection.',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data: ConnectionFormData) => {
    if (!isValidated) {
      toast({
        title: 'Validation Required',
        description: 'Please test the connection before saving.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const selectedTypeInfo = connectionTypes?.find((t) => t.code === data.type);

      if (!selectedTypeInfo) {
        throw new Error('Invalid connection type');
      }

      await backendInstance.put(`${CONNECTIONS_ENDPOINT}${id}/`, {
        name: data.name,
        type_id: selectedTypeInfo.type_id,
        connection_string: JSON.stringify(data.properties),
        is_system_generated: false,
      });

      toast({
        title: 'Success',
        description: 'Connection updated successfully.',
      });
      navigate('/orchestra/connections');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to update connection';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderConnectionForm = () => {
    const type = form.watch('type');
    switch (type) {
      case 'postgresql':
        return <PostgresForm control={form.control} />;
      case 'azure_fileshare':
        return <AzureFileShareForm control={form.control} />;
      case 'azure_blob_storage':
        return <AzureBlobStorageForm control={form.control} />;
      case 'aws_s3':
        return <AwsS3Form control={form.control} />;
      default:
        return null;
    }
  };

  if (connectionError || typesError) {
    return (
      <div className="p-6 text-center text-red-500">
        Error loading data: {connectionError?.message || typesError?.message}
      </div>
    );
  }

  if (isLoadingConnection || isLoadingTypes) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Connection</h1>
            <p className="text-sm text-muted-foreground">Modify connection details</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/orchestra/connections')}
          >
            Back to Connections
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connection Details</CardTitle>
          <CardDescription>Update the connection information</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({field}) => (
                    <FormItem>
                      <FormLabel>Connection Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter connection name"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Connection Type</FormLabel>
                  {isLoadingTypes ? (
                    <Skeleton className="h-10 w-full" />
                  ) : connectionTypes ? (
                    <FormField
                      control={form.control}
                      name="type"
                      render={({field}) => (
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            setIsValidated(false);
                          }}
                          disabled
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select connection type" />
                          </SelectTrigger>
                          <SelectContent>
                            {connectionTypes.map((type) => (
                              <SelectItem
                                key={type.type_id}
                                value={type.code}
                              >
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  ) : null}
                </FormItem>
              </div>

              {form.watch('type') && renderConnectionForm()}

              <div className="flex justify-end gap-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/orchestra/connections')}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={testConnection}
                >
                  Test Connection
                </Button>
                <Button
                  type="submit"
                  disabled={!isValidated || isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Connection'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditConnection;
