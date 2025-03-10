import React, {useCallback, useMemo, useState} from 'react';

import DatasetTree from '@/components/Lineage/DatasetTree';
import HeaderDirectionSelector from '@/components/Lineage/HeaderDirectionSelector';
import LineageGraph from '@/components/Lineage/LineageGraph';
import LineageStats from '@/components/Lineage/LineageStats';
import TransformationDetailsDialog from '@/components/Lineage/TransformationDetailsDialog';
import {Card, CardContent} from '@/components/ui/card';
import {birdBackendInstance} from '@/lib/axios';
import {Layer, LineageConnection, LineageDirection, TransformationDetail} from '@/types/databaseTypes';
import {Database, Loader2} from 'lucide-react';
import useSWR from 'swr';

interface ApiResponse<T> {
  data: T;
}
const swrCallOptions = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 3600000,
};

const DataLineageExplorer: React.FC = () => {
  const [direction, setDirection] = useState<LineageDirection>('destination-to-source');
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);
  const [selectedTransformation, setSelectedTransformation] = useState<string | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedSourceDataset, setSelectedSourceDataset] = useState<string | null>(null);

  const {data: destinationToSrc, isLoading} = useSWR<ApiResponse<Layer[]>>(
    `/api/v1/lineage/destination-to-source-layers/`,
    birdBackendInstance,
    swrCallOptions
  );
  const {data: srcToDestination} = useSWR<ApiResponse<Layer[]>>(
    `/api/v1/lineage/source-to-destination-layers/`,
    birdBackendInstance,
    swrCallOptions
  );
  const {data: lineageApiData, isLoading: isLineageLoading} = useSWR<ApiResponse<LineageConnection[]>>(
    selectedDataset
      ? `/api/v1/lineage/${direction}-path/?${
          direction === 'source-to-destination' ? 'source_dataset' : 'destination_dataset'
        }=${selectedDataset}`
      : null,
    birdBackendInstance,
    swrCallOptions
  );

  const {data: transformationApiData, isLoading: isLineageLoadingRules} = useSWR<
    ApiResponse<TransformationDetail>
  >(
    selectedTransformation && selectedSourceDataset
      ? `/api/v1/lineage/transformation-rule/?rule_id=${selectedTransformation}&source_dataset=${selectedSourceDataset}`
      : null,
    birdBackendInstance,
    swrCallOptions
  );
  const layersData = useMemo(
    () =>
      direction === 'source-to-destination' ? srcToDestination?.data || [] : destinationToSrc?.data || [],
    [direction, srcToDestination, destinationToSrc]
  );

  const lineageData = useMemo(() => lineageApiData?.data || [], [lineageApiData]);
  const transformationDetails = useMemo(() => transformationApiData?.data || null, [transformationApiData]);
  const lineageStats = useMemo(() => {
    const uniqueDatasets = new Set<string>();
    layersData.forEach((layer) => {
      layer.datasets.forEach((dataset) => uniqueDatasets.add(dataset));
    });
    const totalDatasets = uniqueDatasets.size;

    const sourceSets = new Set(lineageData.map((conn) => conn.source_dataset));
    const destinationSets = new Set(lineageData.map((conn) => conn.destination_dataset));

    const connectionsCount = lineageData.length;

    const uniqueTransformations = new Set(lineageData.map((conn) => conn.logical_transformation_rule_id));

    return {
      totalDatasets,
      sourcesOrDestinationsCount:
        direction === 'source-to-destination' ? sourceSets.size : destinationSets.size,
      connectionsCount,
      transformationsCount: uniqueTransformations.size,
    };
  }, [layersData, lineageData, direction]);

  const handleDirectionChange = useCallback((newDirection: LineageDirection) => {
    setDirection(newDirection);
    setSelectedDataset(null);
    setSelectedTransformation(null);
  }, []);

  const handleDatasetSelect = useCallback((datasetCode: string) => {
    setSelectedDataset(datasetCode);
    setSelectedTransformation(null);
  }, []);

  const handleTransformationSelect = useCallback((ruleId: string, sourceDataset: string) => {
    setSelectedTransformation(ruleId);
    setSelectedSourceDataset(sourceDataset);
    setIsDetailsDialogOpen(true);
  }, []);

  const handleCloseDetailsDialog = useCallback(() => {
    setIsDetailsDialogOpen(false);
  }, []);

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center p-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold mb-1">Data Lineage</h1>
          <p className="text-sm">Visualize, track, and manage the flow of your data across systems</p>
        </div>
      </div>

      <div className="px-4 my-4">
        <LineageStats
          stats={lineageStats}
          direction={direction}
        />
      </div>
      <div className="px-4">
        <HeaderDirectionSelector
          direction={direction}
          onDirectionChange={handleDirectionChange}
        />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="xl:w-[33%] p-4 flex flex-col overflow-auto">
          <Card className="flex-1 overflow-hidden">
            <CardContent className="p-4 h-full flex flex-col">
              <h2 className="text-lg font-medium mb-4">Datasets</h2>
              <DatasetTree
                layers={layersData}
                selectedDataset={selectedDataset}
                onSelectDataset={handleDatasetSelect}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex-1 p-4 flex flex-col relative">
          <Card className="flex-1 overflow-hidden">
            <CardContent className="p-0 h-full">
              {isLoading || (selectedDataset && isLineageLoading) ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </div>
              ) : lineageData && lineageData.length > 0 ? (
                <LineageGraph
                  lineageData={lineageData}
                  direction={direction}
                  onEdgeClick={handleTransformationSelect}
                  selectedTransformationId={selectedTransformation}
                />
              ) : selectedDataset ? (
                <div className="flex items-center justify-center h-full">
                  <p>No lineage data found for the selected dataset</p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Database className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-3xl font-bold mb-2">No Dataset Selected</h3>

                    <p>Select a dataset to visualize its lineage</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <TransformationDetailsDialog
            details={transformationDetails}
            isOpen={isDetailsDialogOpen}
            onClose={handleCloseDetailsDialog}
            isLoading={isLineageLoadingRules}
          />
        </div>
      </div>
    </div>
  );
};

export default DataLineageExplorer;
