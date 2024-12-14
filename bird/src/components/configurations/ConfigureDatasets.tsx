import { SharedColumnFilters } from "@/components/SharedFilters";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { fastApiInstance } from "@/lib/axios";

import {
  Column,
  Dataset,
  DatasetItem,
  DatasetResponse,
  DatasetVersion,
  DatasetVersions,
  Frameworks,
  Layers,
} from "@/types/databaseTypes";
import { Plus } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import DataSkeleton from "../skeletons/DataSkeleton";
import { ConfigurationAccordion } from "./ConfigAccord";
import { DatasetFormModal } from "./DatasetFormModal";
import { DatasetVersionFormModal } from "./DatasetVersionFormModal";
import { FrameworkAccordion } from "./FrameworkAccordion";
import { VersionHistoryModal } from "./VersionHistoryModal";

const NO_FILTER = "NO_FILTER";

interface VersionColumnsData {
  data: any;
}

export const ConfigureDatasets: React.FC = () => {
  const { toast } = useToast();

  // Basic state
  const [selectedFramework, setSelectedFramework] = useState<string>(NO_FILTER);
  const [selectedLayer, setSelectedLayer] = useState<string>(NO_FILTER);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10000);

  const [selectedTable, setSelectedTable] = useState<any | null>(null);

  // Modal states
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(
    null
  );
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Selected item states
  const [selectedDataset, setSelectedDataset] = useState<Dataset | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<DatasetVersion | null>(
    null
  );
  const [editingDataset, setEditingDataset] = useState<Dataset | null>(null);
  const [editingVersion, setEditingVersion] = useState<DatasetVersion | null>(
    null
  );
  const [deletingDatasetId, setDeletingDatasetId] = useState<number | null>(
    null
  );

  // Column filters
  const [columnFilters, setColumnFilters] = useState({
    code: "",
    label: "",
    framework: "",
    group: "",
    type: "",
    description: "",
  });

  // History data
  const [historyData, setHistoryData] = useState<any[]>([]);
  const handleVersionSelect = (versionId: number) => {
    setSelectedVersionId((prev) => (prev === versionId ? null : versionId));
  };
  // Data fetching
  const { data: layers } = useSWR<Layers>("/api/v1/layers/", fastApiInstance);
  const { data: frameworks } = useSWR<Frameworks>(
    "/api/v1/frameworks/",
    fastApiInstance
  );
  const { data: datasetsResponse, mutate: mutateDatasets } =
    useSWR<DatasetResponse>(
      `/api/v1/datasets/?page=${currentPage}&page_size=${pageSize}`,
      fastApiInstance
    );

  const { data: dataTableJson } = useSWR<DatasetResponse>(
    `/api/v1/datasets/?page=${currentPage}&page_size=${pageSize}`,
    fastApiInstance,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 3600000,
    }
  );

  const handleUpdateColumns = async (updatedColumns: Column[]) => {
    if (!selectedDataset || !selectedVersionId) return;

    try {
      await fastApiInstance.post(
        `/api/v1/datasets/${selectedDataset.dataset_id}/update-columns/?version_id=${selectedVersionId}`,
        { columns: updatedColumns }
      );

      await mutateVersionColumns();
      toast({
        title: "Success",
        description: "Columns updated successfully.",
      });
    } catch (error) {
      console.error("Error updating columns:", error);
      toast({
        title: "Error",
        description: "Failed to update columns. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const {
    data: datasetVersions,
    mutate: mutateVersions,
    isValidating: isLoadingVersions,
  } = useSWR<DatasetVersions>(
    selectedDataset
      ? `/api/v1/datasets/${selectedDataset.dataset_id}/versions_all/`
      : null,
    fastApiInstance
  );

  const { data: versionColumns, mutate: mutateVersionColumns } =
    useSWR<VersionColumnsData>(
      selectedVersionId
        ? `/api/v1/datasets/${selectedDataset?.dataset_id}/version-columns/?version_id=${selectedVersionId}`
        : null,
      fastApiInstance
    );

  const handleFrameworkChange = useCallback((value: string) => {
    setSelectedFramework(value);
    setSelectedTable(null);
  }, []);

  const handleLayerChange = useCallback((value: string) => {
    setSelectedLayer(value);
    setSelectedTable(null);
  }, []);

  const groupedData = useMemo(() => {
    if (!dataTableJson?.data?.results) return {};
    return dataTableJson.data.results.reduce<
      Record<string, Record<string, DatasetItem[]>>
    >((acc, item) => {
      const framework = item.framework;
      const group =
        item.groups && item.groups.length > 0 && item.groups[0].label
          ? item.groups[0].label
          : "Ungrouped Datasets";

      if (!acc[framework]) {
        acc[framework] = {};
      }
      if (!acc[framework][group]) {
        acc[framework][group] = [];
      }
      acc[framework][group].push(item as any);

      return acc;
    }, {});
  }, [dataTableJson]);

  const filteredData = useMemo(() => {
    const filtered: Record<string, Record<string, DatasetItem[]>> = {};

    Object.entries(groupedData).forEach(([framework, groups]) => {
      if (selectedFramework !== NO_FILTER && framework !== selectedFramework) {
        return;
      }

      filtered[framework] = {};

      Object.entries(groups as Record<string, DatasetItem[]>).forEach(
        ([group, items]) => {
          const filteredItems = items.filter((item: DatasetItem) => {
            const layerMatch =
              selectedLayer === NO_FILTER || item.type === selectedLayer;
            const columnFilterMatch = Object.entries(columnFilters).every(
              ([key, value]) => {
                if (key === "group") {
                  return (
                    value === "" ||
                    (item.groups &&
                      item.groups.some(
                        (g: any) =>
                          g.code.toLowerCase().includes(value.toLowerCase()) ||
                          g.label.toLowerCase().includes(value.toLowerCase())
                      ))
                  );
                }
                return (
                  value === "" ||
                  (item[key as keyof DatasetItem] &&
                    item[key as keyof DatasetItem]
                      .toString()
                      .toLowerCase()
                      .includes(value.toLowerCase()))
                );
              }
            );
            return layerMatch && columnFilterMatch;
          });

          if (filteredItems.length > 0) {
            filtered[framework][group] = filteredItems;
          }
        }
      );

      if (Object.keys(filtered[framework]).length === 0) {
        delete filtered[framework];
      }
    });

    return filtered;
  }, [groupedData, selectedFramework, selectedLayer, columnFilters]);

  const handleCreateDataset = async (newDataset: Partial<Dataset>) => {
    try {
      // Make the API call
      await fastApiInstance.post("/api/v1/datasets/", {
        ...newDataset,
        is_system_generated: false,
      });
      await mutateDatasets();
      setIsDatasetModalOpen(false);

      toast({
        title: "Success",
        description: "Dataset created successfully.",
      });
    } catch (error: any) {
      console.error("Error creating dataset:", error);
      toast({
        title: "Error",
        description:
          error?.response?.data?.error ||
          "Failed to create dataset. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateDataset = async (updatedDataset: Dataset) => {
    if (updatedDataset.is_system_generated) return;
    try {
      await fastApiInstance.put(
        `/api/v1/datasets/${updatedDataset.dataset_id}/`,
        updatedDataset
      );
      await mutateDatasets();
      toast({
        title: "Success",
        description: "Dataset updated successfully.",
      });
      setIsDatasetModalOpen(false);
      setEditingDataset(null);
    } catch (error) {
      console.error("Error updating dataset:", error);
      toast({
        title: "Error",
        description: "Failed to update dataset. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteDataset = async () => {
    if (!deletingDatasetId) return;
    try {
      await fastApiInstance.delete(`/api/v1/datasets/${deletingDatasetId}/`);
      await mutateDatasets();
      toast({
        title: "Success",
        description: "Dataset deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting dataset:", error);
      toast({
        title: "Error",
        description: "Failed to delete dataset. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingDatasetId(null);
    }
  };

  const handleCreateVersion = async (
    dataset: Dataset & Partial<DatasetVersion>
  ) => {
    if (dataset.is_system_generated) return;
    try {
      const payload = {
        version_code: dataset.version_code,
        code: dataset.code,
        label: dataset.label,
        description: dataset.description,
        valid_from: dataset.valid_from,
        valid_to: dataset.valid_to,
      };

      await fastApiInstance.post(
        `/api/v1/datasets/${dataset.dataset_id}/create_version/`,
        payload
      );
      await mutateVersions();
      toast({
        title: "Success",
        description: "Version created successfully.",
      });
      setIsVersionModalOpen(false);
    } catch (error) {
      console.error("Error creating version:", error);
      toast({
        title: "Error",
        description: "Failed to create version. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateVersion = async (version: DatasetVersion) => {
    try {
      await fastApiInstance.put(
        `/api/v1/datasets/${version.dataset_id}/update_version/?version_id=${version.dataset_version_id}`,
        version
      );
      await mutateVersions();
      toast({
        title: "Success",
        description: "Version updated successfully.",
      });
      setIsVersionModalOpen(false);
      setEditingVersion(null);
    } catch (error) {
      console.error("Error updating version:", error);
      toast({
        title: "Error",
        description: "Failed to update version. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVersion = async (datasetId: number, versionId: number) => {
    try {
      await fastApiInstance.delete(
        `/api/v1/datasets/${datasetId}/delete_version/?version_id=${versionId}`
      );
      await mutateVersions();
      toast({
        title: "Success",
        description: "Version deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting version:", error);
      toast({
        title: "Error",
        description: "Failed to delete version. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Configuration and History handlers
  const handleConfigurationSave = async (configData: {
    is_visible: boolean;
    historization_type: string;
  }) => {
    if (!selectedDataset) return;

    try {
      await fastApiInstance.put(
        `/api/v1/datasets/${selectedDataset.dataset_id}/`,
        {
          ...selectedDataset,
          is_visible: configData.is_visible,
        }
      );

      if (selectedVersion) {
        await fastApiInstance.put(
          `/api/v1/datasets/${selectedDataset.dataset_id}/update-columns/`,
          {
            dataset_version_id: selectedVersion.dataset_version_id,
            historization_type: parseInt(configData.historization_type),
          }
        );
      }

      await mutateDatasets();
      await mutateVersions();

      toast({
        title: "Success",
        description: "Configuration updated successfully.",
      });
      setIsConfigModalOpen(false);
    } catch (error) {
      console.error("Error updating configuration:", error);
      toast({
        title: "Error",
        description: "Failed to update configuration.",
        variant: "destructive",
      });
    }
  };

  const handleViewHistory = async (
    dataset: Dataset,
    version: DatasetVersion
  ) => {
    try {
      const response = await fastApiInstance.get(
        `/api/v1/datasets/${dataset.dataset_id}/version_history/?version_id=${version.dataset_version_id}`
      );

      setHistoryData(response.data);
      setSelectedDataset(dataset);
      setSelectedVersion(version);
      setIsHistoryModalOpen(true);
    } catch (error) {
      console.error("Error fetching version history:", error);
      toast({
        title: "Error",
        description: "Failed to fetch version history. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const layersWithNoFilter = useMemo(
    () => [
      { code: NO_FILTER, name: "No Layer Selected" },
      ...(layers?.data || []),
    ],
    [layers]
  );
  const frameworksWithNoFilter = useMemo(
    () => [
      { code: NO_FILTER, name: "No Framework Selected" },
      ...(frameworks?.data || []),
    ],
    [frameworks]
  );

  if (!layers || !frameworks || !datasetsResponse) return <DataSkeleton />;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Configure Datasets</h2>
      <div className="flex space-x-4 mb-4">
        <Select onValueChange={handleFrameworkChange} value={selectedFramework}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select a Framework" />
          </SelectTrigger>
          <SelectContent>
            {frameworksWithNoFilter.map((framework) => (
              <SelectItem key={framework.code} value={framework.code}>
                {framework.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={handleLayerChange} value={selectedLayer}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Select a Layer" />
          </SelectTrigger>
          <SelectContent>
            {layersWithNoFilter.map((layer) => (
              <SelectItem key={layer.code} value={layer.code}>
                {layer.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>{" "}
      </div>

      <SharedColumnFilters
        filters={columnFilters}
        setFilter={(key, value) =>
          setColumnFilters((prev) => ({ ...prev, [key]: value }))
        }
      />

      <div className="mt-4 flex flex-row-reverse">
        <Button onClick={() => setIsDatasetModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Dataset
        </Button>
      </div>

      {selectedFramework === NO_FILTER && selectedLayer === NO_FILTER ? (
        <FrameworkAccordion
          groupedDatasets={filteredData}
          handleDatasetClick={setSelectedDataset}
          datasetVersions={datasetVersions}
          selectedFramework={selectedFramework}
          selectedDataset={selectedDataset}
          handleEditDataset={(dataset) => {
            setEditingDataset(dataset);
            setIsDatasetModalOpen(true);
          }}
          handleUpdateVersion={handleUpdateVersion}
          isLoadingVersions={isLoadingVersions}
          handleCreateVersion={handleCreateVersion}
          handleDeleteVersion={handleDeleteVersion}
          handleDeleteDataset={(datasetId) => {
            setDeletingDatasetId(datasetId);
            setIsDeleteDialogOpen(true);
          }}
          selectedVersionId={selectedVersionId}
          onVersionSelect={handleVersionSelect}
          versionColumns={versionColumns?.data}
          onUpdateColumns={handleUpdateColumns as any}
          isVersionModalOpen={isVersionModalOpen}
          setIsVersionModalOpen={setIsVersionModalOpen}
          handleViewHistory={handleViewHistory}
        />
      ) : (
        <ConfigurationAccordion
          datasets={filteredData}
          handleDatasetClick={setSelectedDataset}
          datasetVersions={datasetVersions}
          handleEditDataset={(dataset) => {
            setEditingDataset(dataset);
            setIsDatasetModalOpen(true);
          }}
          isLoadingVersions={isLoadingVersions}
          selectedDataset={selectedDataset}
          handleCreateVersion={handleCreateVersion}
          handleUpdateVersion={handleUpdateVersion}
          handleDeleteVersion={handleDeleteVersion}
          handleDeleteDataset={(datasetId) => {
            setDeletingDatasetId(datasetId);
            setIsDeleteDialogOpen(true);
          }}
          onVersionSelect={handleVersionSelect}
          versionColumns={versionColumns?.data}
          onUpdateColumns={handleUpdateColumns}
          isVersionModalOpen={isVersionModalOpen}
          setIsVersionModalOpen={setIsVersionModalOpen}
          handleViewHistory={handleViewHistory}
        />
      )}

      {dataTableJson && (
        <div className="mt-4 flex justify-between items-center">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, dataTableJson.data.count)} of{" "}
            {dataTableJson.data.count} entries
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === dataTableJson.data.num_pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <DatasetFormModal
        isOpen={isDatasetModalOpen}
        onClose={() => {
          setIsDatasetModalOpen(false);
          setEditingDataset(null);
        }}
        onSubmit={(dataset) => {
          if (editingDataset) {
            handleUpdateDataset({ ...editingDataset, ...dataset } as Dataset);
          } else {
            handleCreateDataset(dataset);
          }
        }}
        initialData={editingDataset || undefined}
        frameworks={frameworks?.data || []}
        layers={layers?.data || []}
      />

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this dataset? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              onClick={() => setIsDeleteDialogOpen(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button onClick={handleDeleteDataset} variant="destructive">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <VersionHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        dataset={selectedDataset}
        version={selectedVersion}
        historyData={historyData}
      />
      <DatasetVersionFormModal
        isOpen={isVersionModalOpen}
        onClose={() => {
          setIsVersionModalOpen(false);
          setEditingVersion(null);
        }}
        onSubmit={(version) => {
          if (selectedDataset) {
            handleCreateVersion({
              ...selectedDataset,
              ...version,
            });
          }
        }}
        currentVersion={datasetVersions?.data[0]}
        datasetCode={selectedDataset?.code || ""}
      />
    </div>
  );
};
