import {useMemo, useState} from 'react';

import {toast} from '@/hooks/use-toast';
import {orchestraBackendInstance} from '@/lib/axios';
import {SystemVariable} from '@/types/databaseTypes';
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Folder,
  Search,
  Settings,
  Tag,
} from 'lucide-react';
import useSWR, {mutate} from 'swr';

import {Button} from '@rn/ui/components/ui/button';
import {Card} from '@rn/ui/components/ui/card';
import {Input} from '@rn/ui/components/ui/input';
import {ScrollArea} from '@rn/ui/components/ui/scroll-area';

const SYSTEM_VARIABLES_ENDPOINT = '/api/v1/system-variables/';

const SystemVariables = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVariable, setSelectedVariable] = useState<SystemVariable | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const {
    data: response,
    error,
    isLoading,
  } = useSWR<SystemVariable[]>(SYSTEM_VARIABLES_ENDPOINT, async (url: string) => {
    const response = await orchestraBackendInstance.get(url);
    return response.data;
  });

  const variables = response || [];

  const stats = useMemo(() => {
    const categories = new Set(variables.map((v) => v.category)).size;
    const now = new Date();

    return [
      {
        title: 'Total Variables',
        count: variables.length.toString(),
        description: `Active across ${categories} categories`,
        titleIcon: <FileText className="w-4 h-4" />,
        descriptionIcon: <ArrowLeftRight className="w-3 h-3 text-gray-400" />,
      },
      {
        title: 'Last Updated',
        count: now.toLocaleDateString(),
        description: now.toLocaleTimeString(),
        titleIcon: <Settings className="w-4 h-4" />,
        descriptionIcon: <Clock className="w-3 h-3 text-gray-400" />,
      },
    ];
  }, [variables]);

  const variableCategories = useMemo(() => {
    if (!Array.isArray(variables) || variables.length === 0) return [];

    return Object.entries(
      variables.reduce((acc: Record<string, SystemVariable[]>, variable) => {
        const category = variable.category || 'Uncategorized';
        if (!acc[category]) acc[category] = [];
        acc[category].push(variable);
        return acc;
      }, {})
    ).map(([name, vars]) => ({
      name,
      count: vars.length,
      variables: vars,
    }));
  }, [variables]);

  const handleSave = async (variable: SystemVariable) => {
    try {
      await orchestraBackendInstance.put(`${SYSTEM_VARIABLES_ENDPOINT}${variable.system_variable_id}/`, {
        value: variable.value,
      });

      await mutate(SYSTEM_VARIABLES_ENDPOINT);

      toast({
        title: 'Success',
        description: 'Variable updated successfully',
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating variable:', error);
      toast({
        title: 'Error',
        description: 'Failed to update variable',
        variant: 'destructive',
      });
    }
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName) ? prev.filter((name) => name !== categoryName) : [...prev, categoryName]
    );
  };

  const filteredCategories = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return variableCategories;

    return variableCategories
      .map((category) => ({
        ...category,
        variables: category.variables.filter(
          (variable) =>
            variable.variable_name.toLowerCase().includes(query) ||
            variable.value?.toLowerCase().includes(query) ||
            variable.description.toLowerCase().includes(query) ||
            category.name.toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.variables.length > 0);
  }, [variableCategories, searchTerm]);

  if (error) {
    return (
      <div className="text-red-500 p-4 text-center">Error loading system variables: {error.message}</div>
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-screen-2xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 lg:mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-1">System Variables</h1>
          <p className="text-sm">Configure and manage system variables</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 lg:mb-8">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="p-4 lg:p-6"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-base font-semibold">{stat.title}</p>
                {stat.titleIcon}
              </div>
              <p className="text-2xl font-bold">{stat.count}</p>
              <div className="flex items-center gap-1.5">
                {stat.descriptionIcon}
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <Card className="w-full lg:w-80">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Variable Categories</h2>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search variables"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="h-[calc(100vh-24rem)]">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredCategories.map((category) => (
                    <div
                      key={category.name}
                      className="space-y-1"
                    >
                      <div
                        className="flex items-center justify-between p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                        onClick={() => toggleCategory(category.name)}
                      >
                        <div className="flex items-center">
                          {expandedCategories.includes(category.name) ? (
                            <ChevronDown className="w-4 h-4 mr-2" />
                          ) : (
                            <ChevronRight className="w-4 h-4 mr-2" />
                          )}
                          <Folder className="w-4 h-4 mr-2" />
                          <span className="text-sm capitalize">{category.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">{category.count}</span>
                      </div>
                      {expandedCategories.includes(category.name) && (
                        <div className="space-y-1">
                          {category.variables.map((variable) => (
                            <div
                              key={variable.system_variable_id}
                              className={`flex items-center justify-between ml-8 p-2 hover:bg-gray-100 rounded-lg cursor-pointer ${
                                selectedVariable?.system_variable_id === variable.system_variable_id
                                  ? 'bg-gray-100'
                                  : ''
                              }`}
                              onClick={() => setSelectedVariable(variable)}
                            >
                              <div className="flex items-start min-w-0">
                                <FileText className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm">{variable.variable_name}</div>
                                  <div className="text-xs text-gray-500">
                                    {variable.value || 'No value set'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {searchTerm && filteredCategories.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-500">No variables found matching "{searchTerm}"</p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </Card>

        <Card className="flex-1 p-4 lg:p-6">
          {selectedVariable ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{selectedVariable.variable_name}</h2>
                <Button
                  onClick={() => {
                    if (isEditing) {
                      handleSave(selectedVariable);
                    } else {
                      setIsEditing(true);
                    }
                  }}
                >
                  {isEditing ? 'Save Changes' : 'Edit'}
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <Tag className="w-4 h-4 mr-1" /> {selectedVariable.category}
                </span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Value</label>
                  <Input
                    value={selectedVariable.value || ''}
                    onChange={(e) => {
                      setSelectedVariable({
                        ...selectedVariable,
                        value: e.target.value,
                      });
                    }}
                    disabled={!isEditing}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <p className="text-sm text-gray-600">{selectedVariable.description}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[calc(100vh-16rem)] flex items-center justify-center">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-3xl font-bold mb-2">No Variable Selected</h3>
                <p>Select a variable from the browser to view and edit its details</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SystemVariables;
