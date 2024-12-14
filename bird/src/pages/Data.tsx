// Data.tsx
import { format } from "date-fns";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";

import { ConfigurationDataTable } from "@/components/ConfigurationDataTable";
import { DataAccordion } from "@/components/DataAccordion";
import DatePicker from "@/components/DatePicker";
import FilterPanel from "@/components/FilterPanel";
import { MetadataTable } from "@/components/metadatatable/MetadataTable";
import { SelectionDisplay } from "@/components/SelectionDisplay";
import { SharedColumnFilters } from "@/components/SharedFilters";
import DataSkeleton from "@/components/skeletons/DataSkeleton";
import { TableInfoHeader } from "@/components/TableInfoHeader";
import { Button } from "@/components/ui/button";
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
  DatasetItem,
  DatasetResponse,
  Frameworks,
  Layers,
  ValidationResult,
} from "@/types/databaseTypes";

const NO_FILTER = "NO_FILTER";

const Data: React.FC = () => {
  const [selectedFramework, setSelectedFramework] = useState<string>(NO_FILTER);
  const [selectedLayer, setSelectedLayer] = useState<string>(NO_FILTER);
  const [selectedTable, setSelectedTable] = useState<any | null>(null);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [metadata, setMetadata] = useState<any[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [datasetVersion, setDatasetVersion] = useState<any>(null);
  const [hasAppliedFilters, setHasAppliedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pageSize, _] = useState(10000);

  const [metadataTableData, setMetadataTableData] = useState<
    Record<string, string>[]
  >([]);
  const [isMetadataLoading, setIsMetadataLoading] = useState(false);
  const [columnFilters, setColumnFilters] = useState({
    code: "",
    label: "",
    type: "",
    group: "",
    description: "",
  });
  const [validationResults, setValidationResults] = useState<
    ValidationResult[]
  >([]);
  const { toast } = useToast();

  const { data: layers } = useSWR<Layers>("/api/v1/layers/", fastApiInstance);
  const { data: frameworks } = useSWR<Frameworks>(
    "/api/v1/frameworks/",
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

  const isLoading = !layers || !frameworks || !dataTableJson;

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

  const hasMandatoryFilters = useCallback(() => {
    return (
      metadata?.some(
        (col) => col.is_report_snapshot_field && col.is_mandatory
      ) ?? false
    );
  }, [metadata]);

  const handleFilterApply = useCallback(
    async (filterValues: Record<string, any>) => {
      if (!selectedTable || !datasetVersion) return;

      setIsFilterLoading(true);
      setIsMetadataLoading(true);

      try {
        const allFiltersEmpty = Object.values(filterValues).every(
          (v) => v === null || v === ""
        );

        if (allFiltersEmpty) {
          toast({
            title: "Error",
            description: "Please select at least one filter",
            variant: "destructive",
          });
          return;
        }

        const params = new URLSearchParams();
        params.append(
          "version_id",
          datasetVersion.dataset_version_id.toString()
        );
        Object.entries(filterValues).forEach(([key, value]) => {
          if (value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });

        const response = await fastApiInstance.get(
          `/api/v1/datasets/${selectedTable.dataset_id}/get_filtered_data/?${params}`
        );
        setMetadataTableData(response.data);
        setHasAppliedFilters(true);
      } catch (error) {
        console.error("Error applying filters:", error);
        toast({
          title: "Error",
          description: "Failed to apply filters. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsFilterLoading(false);
        setIsMetadataLoading(false);
      }
    },
    [selectedTable, datasetVersion, toast]
  );

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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleDateChange = useCallback((newDate: Date | undefined) => {
    if (newDate instanceof Date) {
      setSelectedDate(newDate);
      setDatasetVersion(null);
    }
  }, []);

  const fetchDatasetVersion = useCallback(async () => {
    if (!selectedTable) return;
    try {
      const response = await fastApiInstance.get(
        `/api/v1/datasets/${selectedTable.dataset_id}/versions/`,
        {
          params: { date: format(selectedDate, "yyyy-MM-dd") },
        }
      );
      setDatasetVersion(
        response.data && Object.keys(response.data).length > 0
          ? response.data
          : null
      );
      if (!response.data || Object.keys(response.data).length === 0) {
        toast({
          title: "No Version Available",
          description: `No version history exists for the selected table on ${format(
            selectedDate,
            "yyyy-MM-dd"
          )}.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching dataset version:", error);
      setDatasetVersion(null);
    }
  }, [selectedTable, selectedDate, toast]);

  useEffect(() => {
    fetchDatasetVersion();
  }, [fetchDatasetVersion]);

  const fetchTableData = useCallback(async () => {
    if (!selectedTable || !datasetVersion) return;
    try {
      const [metadataResponse, dataResponse] = await Promise.all([
        fastApiInstance.get(
          `/api/v1/datasets/${selectedTable.dataset_id}/version-columns/`,
          {
            params: { version_id: datasetVersion.dataset_version_id },
          }
        ),
        fastApiInstance.get(
          `/api/v1/datasets/${selectedTable.dataset_id}/get_data/?version_id=${datasetVersion.dataset_version_id}`
        ),
      ]);

      setMetadata(
        Array.isArray(metadataResponse.data) ? metadataResponse.data : null
      );
      setMetadataTableData(dataResponse.data);
    } catch (error) {
      console.error("Error fetching table data:", error);
      setMetadata(null);
      setMetadataTableData([]);
    }
  }, [selectedTable, datasetVersion]);

  useEffect(() => {
    fetchTableData();
  }, [fetchTableData]);

  const fetchMetadata = useCallback(async () => {
    if (!selectedTable || !datasetVersion) return;

    setIsMetadataLoading(true);
    try {
      const [columnsResponse, dataResponse] = await Promise.all([
        fastApiInstance.get(
          `/api/v1/datasets/${selectedTable.dataset_id}/version-columns/`,
          { params: { version_id: datasetVersion.dataset_version_id } }
        ),
        fastApiInstance.get(
          `/api/v1/datasets/${selectedTable.dataset_id}/get_data/?version_id=${datasetVersion.dataset_version_id}`
        ),
      ]);

      setMetadata(
        Array.isArray(columnsResponse.data) ? columnsResponse.data : null
      );
      setMetadataTableData(dataResponse.data);
    } catch (error) {
      console.error("Error fetching metadata:", error);
      setMetadata(null);
      setMetadataTableData([]);
      toast({
        title: "Error",
        description: "Failed to fetch metadata. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMetadataLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTable, datasetVersion]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata, selectedTable]);

  const handleFrameworkChange = useCallback((value: string) => {
    setSelectedFramework(value);
    setSelectedTable(null);
  }, []);

  const handleLayerChange = useCallback((value: string) => {
    setSelectedLayer(value);
    setSelectedTable(null);
  }, []);

  const handleTableClick = useCallback((table: any) => {
    setSelectedTable(table);
    setMetadata(null);
    setMetadataTableData([]);
    setDatasetVersion(null);
  }, []);

  const handleSaveMetadata = useCallback(
    async (saveData: {
      data: Record<string, string | null>[];
      deletions: number[]; // Add deletions to the parameter type
    }) => {
      try {
        const payload = {
          data: saveData.data,
          deletions: saveData.deletions, // Include deletions in payload
          dataset_version_id: selectedTable.dataset_version_id,
        };

        await fastApiInstance.post(
          `/api/v1/datasets/${selectedTable.dataset_id}/save_data/`,
          payload
        );

        toast({
          title: "Success",
          description: saveData.deletions?.length
            ? `Successfully saved changes and deleted ${saveData.deletions.length} row(s)`
            : "Successfully saved changes",
        });
        fetchTableData();
      } catch (error) {
        console.error("Error saving data:", error);
        toast({
          title: "Error",
          description: "Failed to save data. Please try again.",
          variant: "destructive",
        });
      }
    },
    [selectedTable, toast, fetchTableData]
  );

  const handleValidate = useCallback(
    async (tableData: Record<string, string | null>[]) => {
      if (!selectedTable || !datasetVersion) return;

      try {
        const preparedData = tableData.map((row) => {
          const transformed = { ...row };
          Object.keys(transformed).forEach((key) => {
            if (transformed[key] === undefined) {
              transformed[key] = null;
            } else if (transformed[key] !== null) {
              transformed[key] = transformed[key]?.toString();
            }
          });
          return transformed;
        });

        const response = await fastApiInstance.post<ValidationResult[]>(
          `/api/v1/datasets/${selectedTable.dataset_id}/validate/`,
          {
            table_data: preparedData,
            columns: metadata?.map((col) => ({
              ...col,
              value_options: col.value_options?.map((opt: any) => ({
                item_code: opt.item_code?.toString(),
                item_name: opt.item_name,
                value: opt.value?.toString(),
                label: opt.label,
              })),
            })),
          }
        );

        setValidationResults(response.data);
        const errorCount = response.data.length;
        toast({
          title: "Validation Complete",
          description:
            errorCount > 0
              ? `Found ${errorCount} validation issue${
                  errorCount === 1 ? "" : "s"
                }`
              : "No validation issues found.",
          variant: errorCount > 0 ? "destructive" : "default",
        });

        return response.data;
      } catch (error: any) {
        console.error("Validation error:", error);
        toast({
          title: "Validation Error",
          description: error.response?.data?.error || "Failed to validate data",
          variant: "destructive",
        });
        throw error;
      }
    },
    [selectedTable, datasetVersion, metadata, toast]
  );

  const totalFilteredItems = useMemo(() => {
    return Object.values(filteredData).reduce(
      (total, groups) =>
        total +
        Object.values(groups).reduce((sum, items) => sum + items.length, 0),
      0
    );
  }, [filteredData]);
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

  if (isLoading) return <DataSkeleton />;

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Data</h1>
      <div className="flex space-x-4 mb-5">
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
      <SelectionDisplay
        filteredDataLength={totalFilteredItems}
        selectedFramework={selectedFramework}
        selectedLayer={selectedLayer}
        selectedDate={selectedDate}
      />
      <SharedColumnFilters
        filters={columnFilters}
        setFilter={(key, value) =>
          setColumnFilters((prev) => ({ ...prev, [key]: value }))
        }
      />
      {selectedLayer === NO_FILTER ? (
        <DataAccordion
          data={filteredData}
          onTableClick={handleTableClick}
          selectedFramework={selectedFramework}
        />
      ) : (
        <ConfigurationDataTable
          data={filteredData}
          onRowClick={handleTableClick}
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

      {selectedTable && (
        <div className="mt-8">
          <TableInfoHeader
            selectedTable={selectedTable}
            datasetVersion={datasetVersion}
          />
          {datasetVersion ? (
            <>
              <p className="mb-4">
                Valid from: {datasetVersion.valid_from} to{" "}
                {datasetVersion.valid_to || "Present"}
              </p>

              <FilterPanel
                datasetId={selectedTable.dataset_id}
                versionId={datasetVersion.dataset_version_id}
                onFilterApply={handleFilterApply}
                setHasAppliedFilters={setHasAppliedFilters}
                disabled={isMetadataLoading}
                isDataLoading={isFilterLoading || isMetadataLoading}
              />
              <div className="mt-6">
                <MetadataTable
                  metadata={metadata}
                  tableData={metadataTableData}
                  isLoading={isMetadataLoading}
                  onSave={handleSaveMetadata}
                  hasMandatoryFilters={hasMandatoryFilters}
                  hasAppliedFilters={hasAppliedFilters}
                  onValidate={handleValidate}
                  selectedTable={selectedTable}
                  datasetVersion={datasetVersion}
                  validationResults={validationResults}
                />
              </div>
            </>
          ) : (
            <p className="text-gray-500 italic">
              No version history available for the selected date.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Data;
