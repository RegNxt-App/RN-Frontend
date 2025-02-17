import {useBackend} from '@/contexts/BackendContext';
import {ConnectionFormData} from '@/types/databaseTypes';

const SAVE_CONNECTION_ENDPOINT = '/api/v1/connections/save-connection/';

export const useConnections = () => {
  const {backendInstance} = useBackend();

  const getConnectionString = (type: string, properties: Record<string, any>): string => {
    switch (type) {
      case 'postgresql':
        return JSON.stringify({
          POSTGRES_HOST: properties.POSTGRES_HOST,
          POSTGRES_PORT: parseInt(properties.POSTGRES_PORT),
          POSTGRES_USER: properties.POSTGRES_USER,
          POSTGRES_DBNAME: properties.POSTGRES_DBNAME,
          POSTGRES_SCHEMA: properties.POSTGRES_SCHEMA,
          POSTGRES_PASSWORD: properties.POSTGRES_PASSWORD,
          POSTGRES_CONNECT_TIMEOUT: parseInt(properties.POSTGRES_CONNECT_TIMEOUT || '10'),
        });
      case 'azure_fileshare':
        return JSON.stringify({
          access_key: properties.access_key,
          file_share_name: properties.file_share_name,
          storage_account_name: properties.storage_account_name,
        });
      default:
        return JSON.stringify(properties);
    }
  };

  const saveConnection = async (data: ConnectionFormData, typeId: number) => {
    const connectionString = getConnectionString(data.type, data.properties);

    const payload = {
      name: data.name,
      type_id: typeId,
      connection_string: connectionString,
      is_system_generated: false,
    };

    const response = await backendInstance.post(SAVE_CONNECTION_ENDPOINT, payload);
    return response.data;
  };

  return {
    saveConnection,
    getConnectionString,
  };
};
