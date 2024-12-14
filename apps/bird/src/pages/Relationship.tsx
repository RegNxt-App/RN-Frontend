"use client";

import DatabaseDiagram from "@/components/DatabaseDiagram";
import DatePicker from "@/components/DatePicker";
import SelectableAccordion from "@/components/SelectableAccordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { fastApiInstance } from "@/lib/axios";
import { DatasetResponse, Frameworks, Layers } from "@/types/databaseTypes";
import { ReactFlowProvider } from "@xyflow/react";
import ELK from "elkjs/lib/elk.bundled.js";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";

const NO_FILTER = "NO_FILTER";
const PAGE_SIZE = 10000;

const elk = new ELK();

const calculateNodeDimensions = (columns: any[]) => {
  const baseHeight = 40;
  const rowHeight = 24;
  const width = 250;
  const height = baseHeight + columns.length * rowHeight;
  return { width, height };
};

const getLayoutedElements = async (nodes: any[], edges: any[]) => {
  const elkNodes = nodes.map((node) => ({
    id: node.id,
    width: node.width,
    height: node.height,
  }));

  const elkEdges = edges.map((edge: any) => ({
    id: edge.id,
    sources: [edge.source],
    targets: [edge.target],
  }));

  const elkGraph = await elk.layout({
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "RIGHT",
      "elk.spacing.nodeNode": "50",
      "elk.layered.spacing.nodeNodeBetweenLayers": "100",
      "elk.padding": "[top=50,left=50,bottom=50,right=50]",
      "elk.layered.nodePlacement.strategy": "BRANDES_KOEPF",
    },
    children: elkNodes,
    edges: elkEdges,
  });

  return {
    nodes: nodes.map((node) => {
      const elkNode = elkGraph.children?.find((n) => n.id === node.id);
      return {
        ...node,
        position: { x: elkNode?.x || 0, y: elkNode?.y || 0 },
      };
    }),
    edges,
  };
};

export default function Relationship() {
  const [selectedFramework, setSelectedFramework] = useState<string>(NO_FILTER);
  const [selectedLayer, setSelectedLayer] = useState<string>(NO_FILTER);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDatasetVersions, setSelectedDatasetVersions] = useState<any[]>(
    []
  );
  const [pendingSelections, setPendingSelections] = useState<any[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // const [allDatasets, setAllDatasets] = useState<any[]>([]);

  const { data: layers } = useSWR<Layers>("/api/v1/layers/", fastApiInstance);
  const { data: frameworks } = useSWR<Frameworks>(
    "/api/v1/frameworks/",
    fastApiInstance
  );
  const { data: dataTableJson, isLoading } = useSWR<DatasetResponse>(
    `/api/v1/datasets/?page=${currentPage}&page_size=${PAGE_SIZE}`,
    fastApiInstance,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 3600000,
    }
  );

  const handleFrameworkChange = useCallback((value: string) => {
    setSelectedFramework(value);
  }, []);

  const handleLayerChange = useCallback((value: string) => {
    setSelectedLayer(value);
  }, []);

  const handleDateChange = useCallback((newDate: Date | undefined) => {
    if (newDate instanceof Date) {
      setSelectedDate(newDate);
    }
  }, []);

  const handleDatasetVersionSelect = useCallback((item: any) => {
    setPendingSelections((prev) =>
      prev.some((v) => v.dataset_version_id === item.dataset_version_id)
        ? prev.filter((v) => v.dataset_version_id !== item.dataset_version_id)
        : [...prev, { ...item, dataset_code: item.dataset_code || item.code }]
    );
  }, []);

  const handleApplySelection = useCallback(() => {
    setSelectedDatasetVersions(pendingSelections);
    setIsSheetOpen(false);
  }, [pendingSelections]);

  // const handleRemoveDataset = useCallback((id: number) => {
  //   setSelectedDatasetVersions((prev) =>
  //     prev.filter((v) => v.dataset_version_id !== id)
  //   );
  //   setPendingSelections((prev) =>
  //     prev.filter((v) => v.dataset_version_id !== id)
  //   );
  //   setNodes((prevNodes) =>
  //     prevNodes.filter((node) => node.id !== id.toString())
  //   );
  //   setEdges((prevEdges) =>
  //     prevEdges.filter(
  //       (edge) => edge.source !== id.toString() && edge.target !== id.toString()
  //     )
  //   );
  // }, []);

  const filteredData = useMemo(() => {
    if (!dataTableJson?.data?.results) return {};

    const filtered: Record<string, Record<string, any[]>> = {};
    dataTableJson?.data?.results.forEach((item: any) => {
      if (
        selectedFramework !== NO_FILTER &&
        item.framework !== selectedFramework
      )
        return;
      if (selectedLayer !== NO_FILTER && item.type !== selectedLayer) return;

      const framework = item.framework;
      const group =
        item.groups && item.groups.length > 0
          ? item.groups[0].code
          : "Ungrouped Datasets";

      if (!filtered[framework]) filtered[framework] = {};
      if (!filtered[framework][group]) filtered[framework][group] = [];
      filtered[framework][group].push(item);
    });

    return filtered;
  }, [dataTableJson, selectedFramework, selectedLayer]);

  const handleDiagramSelectionChange = useCallback((selectedNodes: any[]) => {
    setSelectedDatasetVersions(selectedNodes);
  }, []);

  const handleReset = useCallback(() => {
    setSelectedDatasetVersions([]);
    setPendingSelections([]);
    setNodes([]);
    setEdges([]);
  }, []);

  useEffect(() => {
    if (dataTableJson && currentPage < dataTableJson.data.num_pages) {
      setCurrentPage(currentPage + 1);
    }
  }, [dataTableJson, currentPage]);

  useEffect(() => {
    const fetchRelationships = async () => {
      setLoading(true);
      try {
        const responses = await Promise.all(
          selectedDatasetVersions.map((v) =>
            fastApiInstance.get(
              `/api/v1/datasets/${v.dataset_version_id}/relationships/`
            )
          )
        );
        const data = responses.map((r) => r.data);

        const newNodes: any[] = [];
        const newEdges: any[] = [];
        const processedTables = new Set<string>();

        const createNode = (dataset: any) => {
          const { width, height } = calculateNodeDimensions(dataset.columns);
          return {
            id: dataset.dataset_code || dataset.code,
            type: "databaseTable",
            position: { x: 0, y: 0 },
            data: {
              label: `${dataset.dataset_name} (${
                dataset.dataset_code || dataset.code
              })`,
              columns: dataset.columns,
            },
            width,
            height,
          };
        };

        const createEdge = (
          relationship: any,
          source: any,
          target: any,
          direction: "inbound" | "outbound"
        ) => {
          const edgeId = `${source}-${target}-${relationship.from_col}-${relationship.to_col}`;
          const sourceHandle = `${source}.${relationship.from_col}.right`;
          const targetHandle = `${target}.${relationship.to_col}.left`;
          const label =
            direction === "outbound"
              ? `${relationship.from_col} -> ${relationship.to_col}`
              : `${relationship.from_col} <- ${relationship.to_col}`;

          return {
            id: edgeId,
            source,
            target,
            sourceHandle,
            targetHandle,
            type: "custom",
            animated: true,
            data: {
              label,
              relationshipType: relationship.relation_type,
              sourceCardinality: relationship.source_cardinality,
              targetCardinality: relationship.destination_cardinality,
              isSourceMandatory: relationship.is_source_mandatory,
              isTargetMandatory: relationship.is_destination_mandatory,
            },
          };
        };

        const allDatasetsSet = new Set();

        data.forEach((relationshipData) => {
          if (!relationshipData.central_dataset_version) {
            console.error("Missing central_dataset_version:", relationshipData);
            return;
          }

          const centralDataset = relationshipData.central_dataset_version;
          if (!processedTables.has(centralDataset.code)) {
            newNodes.push(createNode(centralDataset));
            processedTables.add(centralDataset.code);
          }

          relationshipData.all_datasets.forEach((dataset: any) => {
            allDatasetsSet.add(JSON.stringify(dataset));
            if (!processedTables.has(dataset.dataset_code)) {
              newNodes.push(createNode(dataset));
              processedTables.add(dataset.dataset_code);
            }
          });

          relationshipData.inbound.forEach((rel: any) => {
            newEdges.push(
              createEdge(rel, rel.from_table, rel.to_table, "inbound")
            );
          });

          relationshipData.outbound.forEach((rel: any) => {
            newEdges.push(
              createEdge(rel, rel.from_table, rel.to_table, "outbound")
            );
          });
        });

        // setAllDatasets(
        //   Array.from(allDatasetsSet).map((dataset) =>
        //     JSON.parse(dataset as string)
        //   )
        // );

        const { nodes: layoutedNodes, edges: layoutedEdges } =
          await getLayoutedElements(newNodes, newEdges);

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } catch (error) {
        console.error("Error fetching relationships:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedDatasetVersions.length > 0) {
      fetchRelationships();
    }
  }, [selectedDatasetVersions]);

  const handleNodeInfoLog = useCallback((node: any) => {
    console.log("Table Information:", node.data);
  }, []);

  return (
    <div className="flex h-screen">
      <div className="w-full p-4">
        <div className="flex flex-wrap space-x-4 mb-4">
          <Select
            onValueChange={handleFrameworkChange}
            value={selectedFramework}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_FILTER}>All Frameworks</SelectItem>
              {frameworks?.data?.map((framework: any) => (
                <SelectItem key={framework.code} value={framework.code}>
                  {framework.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={handleLayerChange} value={selectedLayer}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Layer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NO_FILTER}>All Layers</SelectItem>
              {layers?.data?.map((layer: any) => (
                <SelectItem key={layer.code} value={layer.code}>
                  {layer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DatePicker
            onSelect={
              handleDateChange as React.ComponentProps<
                typeof DatePicker
              >["onSelect"]
            }
            initialDate={selectedDate}
          />
        </div>

        <ReactFlowProvider>
          <DatabaseDiagram
            nodes={nodes}
            edges={edges}
            loading={loading}
            onReset={handleReset}
            selectedDatasetVersions={selectedDatasetVersions}
            onSelectionChange={handleDiagramSelectionChange}
            setNodes={setNodes}
            setEdges={setEdges}
            getLayoutedElements={getLayoutedElements}
            onNodeInfoLog={handleNodeInfoLog}
          />
        </ReactFlowProvider>
      </div>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button className="fixed right-4 top-4 z-10">
            Open Dataset List
          </Button>
        </SheetTrigger>
        <SheetContent className="overflow-y-auto max-h-screen">
          <SheetHeader>
            <SheetTitle>Selected Datasets</SheetTitle>
            <SheetDescription>
              View and manage your selected datasets here.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            {/* <SelectedDatasetChips
              selectedDatasets={allDatasets}
              onRemove={handleRemoveDataset}
            /> */}
            <Input
              placeholder="Search datasets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-[20px] w-full" />
                <Skeleton className="h-[20px] w-full" />
                <Skeleton className="h-[20px] w-full" />
                <Skeleton className="h-[20px] w-full" />
                <Skeleton className="h-[20px] w-full" />
              </div>
            ) : (
              <SelectableAccordion
                data={filteredData}
                selectedItems={pendingSelections}
                onItemSelect={handleDatasetVersionSelect}
                searchTerm={searchTerm}
              />
            )}
            <Button
              onClick={handleApplySelection}
              className="mt-4 w-full"
              disabled={pendingSelections.length === 0}
            >
              Apply Selection
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
