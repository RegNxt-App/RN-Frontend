import {useCallback, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import {AggregationConfiguration} from '@/components/dataviews/AggregationConfiguration';
import {FieldSelection} from '@/components/dataviews/FieldSelection';
import {FilterConfiguration} from '@/components/dataviews/FilterConfiguration';
import {IdentificationForm} from '@/components/dataviews/IdentificationForm';
import {JoinConfiguration} from '@/components/dataviews/JoinConfiguration';
import {ObjectSelection} from '@/components/dataviews/ObjectSelection';
import {PreviewMode} from '@/components/dataviews/PreviewMode';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {DataViewProvider} from '@/contexts/DataViewContext';
import {useDataView} from '@/hooks/api/use-dataview';
import {toast} from '@/hooks/use-toast';
import {ArrowLeft, CheckCircle2, ChevronRight, Loader2} from 'lucide-react';

interface DataViewConfig {
  identification: {
    code?: string;
    label?: string;
    description?: string;
    framework?: string;
    type?: string;
    visible?: boolean;
  };
  objects: any[];
  joins: any[];
  fields: any[];
  filters: any[];
  aggregations: any[];
}

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

export function CreateEditDataview() {
  const navigate = useNavigate();
  const {id} = useParams();
  const {dataview, isLoading, error, createDataView, updateDataView, previewDataView} = useDataView(id);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const [dataViewConfig, setDataViewConfig] = useState<DataViewConfig>({
    identification: {},
    objects: [],
    joins: [],
    fields: [],
    filters: [],
    aggregations: [],
  });

  useEffect(() => {
    if (dataview) {
      setDataViewConfig({
        identification: {
          code: dataview.code,
          label: dataview.label,
          description: dataview.description,
          framework: dataview.framework,
          type: dataview.type,
          visible: dataview.is_visible,
        },
        objects: dataview.data_objects || [],
        joins: dataview.data_joins || [],
        fields: dataview.data_fields || [],
        filters: dataview.data_filters || [],
        aggregations: dataview.data_aggregations || [],
      });
    }
  }, [dataview]);
  const updateConfig = useCallback((step: keyof DataViewConfig, data: any) => {
    setDataViewConfig((prev) => ({
      ...prev,
      [step]: data,
    }));
  }, []);

  const isStepValid = useCallback(
    (step: number) => {
      const stepId = steps[step].id as keyof DataViewConfig;
      const config = dataViewConfig[stepId];

      switch (stepId) {
        case 'identification':
          const ident = config as DataViewConfig['identification'];
          return ident.code && ident.label && ident.framework;
        case 'objects':
          return (config as any[]).length > 0;
        case 'fields':
          return (config as any[]).length > 0;
        default:
          return true;
      }
    },
    [dataViewConfig]
  );

  const loadPreviewData = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoadingPreview(true);
      const data = await previewDataView(100);
      setPreviewData(data);
    } catch (error) {
      console.error('Error loading preview:', error);
      toast({
        title: 'Error',
        description: 'Failed to load preview data',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPreview(false);
    }
  }, [id, previewDataView]);

  useEffect(() => {
    if (currentStep === steps.length - 1) {
      loadPreviewData();
    }
  }, [currentStep, loadPreviewData]);

  const handleNext = useCallback(async () => {
    if (!isStepValid(currentStep)) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields before proceeding.',
        variant: 'destructive',
      });
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleComplete();
    }
  }, [currentStep, isStepValid]);

  const handleComplete = async () => {
    try {
      setIsSubmitting(true);

      const payload = {
        ...dataViewConfig.identification,
        data_objects: dataViewConfig.objects,
        data_joins: dataViewConfig.joins,
        data_fields: dataViewConfig.fields,
        data_filters: dataViewConfig.filters,
        data_aggregations: dataViewConfig.aggregations,
      };

      if (id) {
        await updateDataView(payload);
        toast({
          title: 'Success',
          description: 'Data view updated successfully',
        });
      } else {
        await createDataView(payload);
        toast({
          title: 'Success',
          description: 'Data view created successfully',
        });
      }

      navigate('/orchestra/dataviews');
    } catch (error) {
      console.error('Error saving data view:', error);
      toast({
        title: 'Error',
        description: 'Failed to save data view',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error loading data view: {error.message}</div>;
  }

  return (
    <DataViewProvider>
      <div className="container max-w-5xl py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {id ? 'Edit Data View' : 'Create Data View'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Complete all steps to {id ? 'update' : 'create'} your custom data view.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/orchestra/dataviews')}
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
                    className={`flex items-start space-x-3 rounded-lg p-3 transition-colors ${
                      index === currentStep
                        ? 'bg-primary/10 text-primary'
                        : index < currentStep
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground/60'
                    }`}
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border text-xs">
                      {index < currentStep ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
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
                  isEdit={!!id}
                />
              )}
              {currentStep === 1 && (
                <ObjectSelection
                  config={dataViewConfig.objects}
                  updateConfig={(data) => updateConfig('objects', data)}
                  framework={dataViewConfig.identification.framework}
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
                  selectedObjects={dataViewConfig.objects}
                  config={dataViewConfig.filters}
                  updateConfig={(data) => updateConfig('filters', data)}
                />
              )}
              {currentStep === 5 && (
                <AggregationConfiguration
                  selectedObjects={dataViewConfig.objects}
                  config={dataViewConfig.aggregations}
                  updateConfig={(data) => updateConfig('aggregations', data)}
                />
              )}

              {currentStep === 6 && (
                <PreviewMode
                  config={dataViewConfig}
                  previewData={previewData}
                  isLoading={isLoadingPreview}
                  onRefresh={loadPreviewData}
                />
              )}
            </CardContent>
            <div className="flex items-center justify-between border-t p-6">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0 || isSubmitting}
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : currentStep === steps.length - 1 ? (
                  id ? (
                    'Update'
                  ) : (
                    'Create'
                  )
                ) : (
                  <>
                    Next Step
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DataViewProvider>
  );
}
