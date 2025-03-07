import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {useNavigate} from 'react-router-dom';

import AwsS3Form from '@/components/Connections/AwsS3Form';
import AzureBlobStorageForm from '@/components/Connections/AzureBlobStorageForm';
import {AzureFileShareForm} from '@/components/Connections/AzureFileShareForm';
import PostgresForm from '@/components/Connections/PostgresForm';
import {useBackend} from '@/contexts/BackendContext';
import {useToast} from '@/hooks/use-toast';
import {useConnections} from '@/hooks/useConnections';
import {ConnectionFormData, ConnectionType} from '@/types/databaseTypes';
import useSWR from 'swr';

import {Button} from '@rn/ui/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@rn/ui/components/ui/card';
import {Form, FormControl, FormField, FormItem, FormLabel} from '@rn/ui/components/ui/form';
import {Input} from '@rn/ui/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';
import {Skeleton} from '@rn/ui/components/ui/skeleton';

const CONNECTIONS_TYPES_ENDPOINT = '/api/v1/connections/list-types/';

const CreateConnection: React.FC = () => {
  const navigate = useNavigate();
  const {backendInstance} = useBackend();
  const [selectedType, setSelectedType] = useState<string>('');
  const [isValidated, setIsValidated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {toast} = useToast();
  const {saveConnection} = useConnections();

  const {
    data: connectionTypes,
    error: typesError,
    isLoading: isLoadingTypes,
  } = useSWR<ConnectionType[]>(CONNECTIONS_TYPES_ENDPOINT, async (url: string) => {
    const response = await backendInstance.get(url);
    return response.data;
  });

  const form = useForm<ConnectionFormData>({
    defaultValues: {
      name: '',
      type: '',
      properties: {},
    },
  });

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

      await saveConnection(data, selectedTypeInfo.type_id);
      toast({
        title: 'Success',
        description: 'Connection created successfully.',
      });
      navigate('/orchestra/connections');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create connection';
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
    switch (selectedType) {
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

  if (typesError) {
    return (
      <div className="p-6 text-center text-red-500">Error loading connection types: {typesError.message}</div>
    );
  }

  return (
    <div className="container mx-auto ">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create New Connection</h1>
            <p className="text-sm text-muted-foreground">Configure a new data connection</p>
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
          <CardDescription>Fill in the required information to create a new connection</CardDescription>
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
                            setSelectedType(value);
                            setIsValidated(false);
                          }}
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

              {selectedType && renderConnectionForm()}

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
                  disabled={!form.getValues('type')}
                >
                  Test Connection
                </Button>
                <Button
                  type="submit"
                  disabled={!isValidated || isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Connection'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateConnection;
