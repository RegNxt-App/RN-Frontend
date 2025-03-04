import React from 'react';
import {useParams} from 'react-router-dom';

import Loader from '@/common/Loader';
import BasicFields from '@/components/Variables/FormComponents/BasicFields';
import DependencySelector from '@/components/Variables/FormComponents/DependencySelector';
import VariableError from '@/components/Variables/FormComponents/ErrorDisplay';
import TypeFields from '@/components/Variables/FormComponents/TypeFields';
import useVariableForm from '@/hooks/useVariableForm';

import {Button} from '@rn/ui/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@rn/ui/components/ui/card';
import {Form} from '@rn/ui/components/ui/form';

const VariableForm: React.FC = () => {
  const {variableId} = useParams<{variableId: string}>();
  const {
    form,
    isEditMode,
    isSubmitting,
    selectedType,
    dataTypes,
    isLoadingTypes,
    isLoadingVariable,
    error,
    onSubmit,
    handleTypeChange,
    navigate,
    variableDetails,
    handleDependenciesChange,
  } = useVariableForm();

  if (error) {
    return <VariableError message={error.message || 'An error occurred'} />;
  }

  if (isEditMode && isLoadingVariable) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? 'Edit Variable' : 'Create New Variable'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditMode ? 'Modify an existing variable' : 'Add a new global variable to the application'}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/orchestra/variables')}
          >
            Back to Variables
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Variable Details</CardTitle>
          <CardDescription>
            {isEditMode
              ? 'Edit the variable properties below'
              : 'Fill in the required information to create a new variable'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <BasicFields
                form={form}
                isEditMode={isEditMode}
                dataTypes={dataTypes}
                isLoadingTypes={isLoadingTypes}
                selectedType={selectedType}
                onTypeChange={handleTypeChange}
              />

              {selectedType && (
                <TypeFields
                  type={selectedType}
                  control={form.control}
                />
              )}
              <DependencySelector
                variableId={isEditMode ? Number(variableId) : undefined}
                onDependenciesChange={handleDependenciesChange}
                initialDependencies={variableDetails?.dependencies?.map((d) => d.variable_id) || []}
              />
              <div className="flex justify-end gap-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/orchestra/variables')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? isEditMode
                      ? 'Updating...'
                      : 'Creating...'
                    : isEditMode
                    ? 'Update Variable'
                    : 'Create Variable'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VariableForm;
