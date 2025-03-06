import React, {useCallback, useEffect, useMemo, useState} from 'react';

import useVariables from '@/hooks/useVariables';
import {Variable} from '@/types/databaseTypes';
import {Loader2, RefreshCw, Search} from 'lucide-react';

import {Badge} from '@rn/ui/components/ui/badge';
import {Button} from '@rn/ui/components/ui/button';
import {CardDescription, CardHeader, CardTitle} from '@rn/ui/components/ui/card';
import {Input} from '@rn/ui/components/ui/input';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@rn/ui/components/ui/select';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@rn/ui/components/ui/table';

interface DependencySelectorProps {
  variableId?: number;
  onDependenciesChange: (dependencyIds: number[]) => void;
  initialDependencies?: number[];
}

const DependencySelector = React.memo(
  ({variableId, onDependenciesChange, initialDependencies = []}: DependencySelectorProps) => {
    const {variables} = useVariables();
    const [selectedDependencies, setSelectedDependencies] = useState<Record<number, Variable>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [initialized, setInitialized] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(5);

    useEffect(() => {
      if (initialized || !variables?.length) return;

      if (initialDependencies.length > 0) {
        const depsMap = initialDependencies.reduce((acc, depId) => {
          const variable = variables.find((v) => v.variable_id === depId);
          if (variable) acc[depId] = variable;
          return acc;
        }, {} as Record<number, Variable>);

        setSelectedDependencies(depsMap);
      }

      setInitialized(true);
    }, [variables, initialDependencies, initialized]);

    useEffect(() => {
      const dependencyIds = Object.keys(selectedDependencies).map(Number);
      onDependenciesChange(dependencyIds);
    }, [selectedDependencies, onDependenciesChange]);

    const filteredVariables = useMemo(() => {
      if (!variables) return [];

      return variables.filter(
        (v) =>
          (v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.label.toLowerCase().includes(searchTerm.toLowerCase())) &&
          (filterType === 'all' || v.data_type === filterType) &&
          v.variable_id !== variableId
      );
    }, [variables, searchTerm, filterType, variableId]);

    const totalPages = Math.ceil(filteredVariables.length / pageSize);
    const currentPageVariables = filteredVariables.slice((page - 1) * pageSize, page * pageSize);

    const uniqueDataTypes = useMemo(() => {
      if (!variables) return [];
      return [...new Set(variables.map((v) => v.data_type))];
    }, [variables]);

    const handleAdd = useCallback((variable: Variable, e: React.MouseEvent) => {
      e.preventDefault();
      setSelectedDependencies((prev) => ({
        ...prev,
        [variable.variable_id]: variable,
      }));
    }, []);

    const handleRemove = useCallback((variableId: number, e: React.MouseEvent) => {
      e.preventDefault();
      setSelectedDependencies((prev) => {
        const {[variableId]: removed, ...remaining} = prev;
        return remaining;
      });
    }, []);

    const resetFilters = (e: React.MouseEvent) => {
      e.preventDefault();
      setSearchTerm('');
      setFilterType('all');
      setPage(1);
    };

    return (
      <div className="space-y-6">
        <CardHeader className="px-0">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Variable Dependencies</CardTitle>
              <CardDescription>Select variables that this variable depends on</CardDescription>
            </div>
            <Badge variant="outline">{Object.keys(selectedDependencies).length} dependencies selected</Badge>
          </div>

          <div className="flex gap-2 mt-2 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search variables..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-8"
              />
            </div>

            <Select
              value={filterType}
              onValueChange={(value) => {
                setFilterType(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {uniqueDataTypes.map((type) => (
                  <SelectItem
                    key={type}
                    value={type}
                  >
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={resetFilters}
              type="button"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <div>
          <h3 className="text-lg font-medium mb-2">Available Variables</h3>
          <div className="rounded-md border">
            {!variables ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : currentPageVariables.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground">No variables found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPageVariables.map((variable) => (
                    <TableRow key={variable.variable_id}>
                      <TableCell>{variable.name}</TableCell>
                      <TableCell>{variable.label}</TableCell>
                      <TableCell className="capitalize">{variable.data_type}</TableCell>
                      <TableCell>
                        {variable.variable_id in selectedDependencies ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={(e) => handleRemove(variable.variable_id, e)}
                            type="button"
                          >
                            Remove
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleAdd(variable, e)}
                            type="button"
                          >
                            Add
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => p - 1);
                }}
                disabled={page === 1}
                type="button"
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  setPage((p) => p + 1);
                }}
                disabled={page === totalPages}
                type="button"
              >
                Next
              </Button>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Selected Dependencies</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.values(selectedDependencies).length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-4 text-muted-foreground"
                    >
                      No dependencies selected
                    </TableCell>
                  </TableRow>
                ) : (
                  Object.values(selectedDependencies).map((variable) => (
                    <TableRow key={variable.variable_id}>
                      <TableCell>{variable.name}</TableCell>
                      <TableCell>{variable.label}</TableCell>
                      <TableCell className="capitalize">{variable.data_type}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={(e) => handleRemove(variable.variable_id, e)}
                          type="button"
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }
);

export default DependencySelector;
