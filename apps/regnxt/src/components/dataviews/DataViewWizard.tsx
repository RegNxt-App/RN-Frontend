'use client';

import {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {toast} from '@/hooks/use-toast';
import {ArrowLeft, CheckCircle2, ChevronRight} from 'lucide-react';

import {Button} from '@rn/ui/components/ui/button';

import {AggregationConfiguration} from './AggregationConfiguration';
import {FieldSelection} from './FieldSelection';
import {FilterConfiguration} from './FilterConfiguration';
import {IdentificationForm} from './IdentificationForm';
import {JoinConfiguration} from './JoinConfiguration';
import {ObjectSelection} from './ObjectSelection';

const steps = [
  {
    id: 'identification',
    title: 'Identification',
    description: 'Basic information about your data view',
  },
  {
    id: 'objects',
    title: 'Objects',
    description: 'Select and configure data objects',
  },
  {
    id: 'joins',
    title: 'Joins',
    description: 'Define relationships between objects',
  },
  {
    id: 'fields',
    title: 'Fields',
    description: 'Choose fields to include',
  },
  {
    id: 'filters',
    title: 'Filters',
    description: 'Set up data filters',
  },
  {
    id: 'aggregations',
    title: 'Aggregations',
    description: 'Configure data aggregations',
  },
  {
    id: 'preview',
    title: 'Preview',
    description: 'Review and finalize your data view',
  },
];

interface DataViewWizardProps {
  dataViewId?: string;
}

export function DataViewWizard({dataViewId}: DataViewWizardProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [dataViewConfig, setDataViewConfig] = useState({
    identification: {},
    objects: [],
    joins: [],
    fields: [],
    filters: [],
    aggregations: [],
  });

  useEffect(() => {
    if (dataViewId) {
      // Fetch existing data view configuration
      const fetchDataView = async () => {
        try {
          // Replace this with an actual API call
          const response = await fetch(`/api/dataviews/${dataViewId}`);
          if (!response.ok) {
            throw new Error('Failed to fetch data view');
          }
          const data = await response.json();
          setDataViewConfig(data);
        } catch (error) {
          console.error('Error fetching data view:', error);
          toast({
            title: 'Error',
            description: 'Failed to load data view. Please try again.',
            variant: 'destructive',
          });
        }
      };
      fetchDataView();
    }
  }, [dataViewId]);

  const updateConfig = useCallback((step: string, data: any) => {
    setDataViewConfig((prev) => {
      if (JSON.stringify(prev[step]) === JSON.stringify(data)) {
        return prev;
      }
      return {...prev, [step]: data};
    });
  }, []);

  const isStepValid = (step: number) => {
    const stepId = steps[step].id;
    switch (stepId) {
      case 'identification':
        return !!dataViewConfig.identification.code && !!dataViewConfig.identification.label;
      case 'objects':
        return dataViewConfig.objects.length > 0;
      case 'joins':
        return true; // Make joins optional
      case 'fields':
        return dataViewConfig.fields.length > 0;
      case 'filters':
        return true; // Filters are optional
      case 'aggregations':
        return true; // Aggregations are optional
      case 'preview':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (isStepValid(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields before proceeding.',
        variant: 'destructive',
      });
    }
  };

  const handleComplete = async () => {
    try {
      // This is where you would typically send the data to your backend
      const url = dataViewId ? `/api/dataviews/${dataViewId}` : '/api/dataviews';
      const method = dataViewId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataViewConfig),
      });

      if (!response.ok) {
        throw new Error('Failed to save data view');
      }

      toast({
        title: dataViewId ? 'Data View Updated' : 'Data View Created',
        description: dataViewId
          ? 'Your data view has been successfully updated and saved.'
          : 'Your data view has been successfully created and saved.',
      });

      navigate('/orchestra/dataviews/');
    } catch (error) {
      console.error('Error saving data view:', error);
      toast({
        title: 'Error',
        description: 'Failed to save data view. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleBackToList = () => {
    navigate('/orchestra/dataviews/');
  };

  return (
    <div className="container max-w-5xl py-10">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {dataViewId ? 'Edit Data View' : 'Create Data View'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete all steps to {dataViewId ? 'update' : 'create'} your custom data view.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleBackToList}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to List
        </Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Progress</CardTitle>
            <CardDescription>
              Step {currentStep + 1} of {steps.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg transition-colors ${
                    index === currentStep
                      ? 'bg-primary/10 text-primary'
                      : index < currentStep
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground/60'
                  }`}
                >
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border text-xs">
                    {index < currentStep ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium">{step.title}</div>
                    <div className="text-xs">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{steps[currentStep].title}</CardTitle>
            <CardDescription>{steps[currentStep].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 0 && (
              <IdentificationForm
                config={dataViewConfig.identification}
                updateConfig={(data) => updateConfig('identification', data)}
              />
            )}
            {currentStep === 1 && (
              <ObjectSelection
                config={dataViewConfig.objects}
                updateConfig={(data) => updateConfig('objects', data)}
              />
            )}
            {currentStep === 2 && (
              <JoinConfiguration
                config={dataViewConfig.joins}
                updateConfig={(data) => updateConfig('joins', data)}
                selectedObjects={dataViewConfig.objects}
              />
            )}
            {currentStep === 3 && (
              <FieldSelection
                config={dataViewConfig.fields}
                updateConfig={(data) => updateConfig('fields', data)}
              />
            )}
            {currentStep === 4 && (
              <FilterConfiguration
                config={dataViewConfig.filters}
                updateConfig={(data) => updateConfig('filters', data)}
              />
            )}
            {currentStep === 5 && (
              <AggregationConfiguration
                config={dataViewConfig.aggregations}
                updateConfig={(data) => updateConfig('aggregations', data)}
              />
            )}
            {currentStep === 6 && <PreviewMode config={dataViewConfig} />}
          </CardContent>
          <div className="flex items-center justify-between p-6 border-t">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              className="gap-2"
            >
              {currentStep === steps.length - 1 ? (
                dataViewId ? (
                  'Update'
                ) : (
                  'Create'
                )
              ) : (
                <>
                  Next Step
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
