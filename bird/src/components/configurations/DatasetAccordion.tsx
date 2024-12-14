import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Column,
  Dataset,
  DatasetVersion,
  DatasetVersions,
} from "@/types/databaseTypes";
import { format } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Settings2,
  Trash,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { DatasetVersionColumns } from "./DatasetVersionColumns";

interface DatasetAccordionProps {
  datasets: Dataset[] | any;
  handleDatasetClick: (dataset: Dataset) => void;
  datasetVersions?: DatasetVersions;
  selectedDataset: Dataset | null;
  handleCreateVersion: (dataset: Dataset) => void;
  handleUpdateVersion: (version: DatasetVersion) => void;
  handleDeleteVersion: (datasetId: number, versionId: number) => void;
  handleEditDataset: (dataset: Dataset) => void;
  handleDeleteDataset: (datasetId: number) => void;
  isLoadingVersions: boolean;
  onVersionSelect: any;
  showPagination?: boolean;
  handleViewHistory?: (dataset: Dataset, version: DatasetVersion) => void;
  handleConfigureDataset?: (dataset: Dataset) => void;
  versionColumns?: Column[];
  onUpdateColumns: (columns: Column[]) => Promise<void>;
  isLoadingColumns?: boolean;
  isVersionModalOpen: boolean;
  setIsVersionModalOpen: (open: boolean) => void;
}

const DATASETS_PER_PAGE = 10;

export const DatasetAccordion: React.FC<DatasetAccordionProps> = ({
  datasets,
  handleDatasetClick,
  datasetVersions,
  setIsVersionModalOpen,
  handleDeleteVersion,
  handleEditDataset,
  versionColumns,
  onUpdateColumns,
  isLoadingColumns,
  handleDeleteDataset,
  isLoadingVersions,
  onVersionSelect,
  handleViewHistory,
  handleConfigureDataset,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedDatasetId, setExpandedDatasetId] = useState<number | null>(
    null
  );
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(
    null
  );

  const flattenedDatasets = useMemo(() => {
    if (!Array.isArray(datasets)) {
      const flattened: Dataset[] = [];
      Object.entries(datasets).forEach(([groupName, groupItems]) => {
        if (Array.isArray(groupItems)) {
          flattened.push(...groupItems);
        }
      });

      return flattened;
    }
    return datasets;
  }, [datasets]);

  const totalPages = Math.ceil(flattenedDatasets.length / DATASETS_PER_PAGE);
  const paginatedDatasets = useMemo(() => {
    const start = (currentPage - 1) * DATASETS_PER_PAGE;
    const end = start + DATASETS_PER_PAGE;
    return flattenedDatasets.slice(start, end);
  }, [flattenedDatasets, currentPage]);

  const handleAccordionChange = (datasetId: string) => {
    const id = parseInt(datasetId);
    if (expandedDatasetId === id) {
      setExpandedDatasetId(null);
      setSelectedVersionId(null);
    } else {
      setExpandedDatasetId(id);
      const dataset = flattenedDatasets.find((d) => d.dataset_id === id);
      if (dataset) {
        handleDatasetClick(dataset);
      }
    }
  };

  const getDatasetVersions = (datasetId: number) => {
    return (
      datasetVersions?.data.filter((v) => v.dataset_id === datasetId) || []
    );
  };

  const renderVersions = (dataset: Dataset) => {
    const versions = getDatasetVersions(dataset.dataset_id);

    if (isLoadingVersions) {
      return <div className="py-4">Loading versions...</div>;
    }

    if (versions.length === 0) {
      return (
        <div className="py-4">No versions available for this dataset.</div>
      );
    }

    return (
      <div className="space-y-4">
        {versions.map((version) => (
          <div
            key={version.dataset_version_id}
            className={`border rounded-lg p-4 transition-colors ${
              selectedVersionId === version.dataset_version_id
                ? "border-primary bg-primary/5"
                : "border-border"
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium">
                    Version {version.version_nr}
                  </h4>
                  <Badge variant="outline">{version.version_code}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Valid from: {format(new Date(version.valid_from), "PP")}
                  {version.valid_to && version.valid_to !== "9999-12-31"
                    ? ` to ${format(new Date(version.valid_to), "PP")}`
                    : " to Present"}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {/* {handleViewHistory && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewHistory(dataset, version)}
                  >
                    <History className="h-4 w-4 mr-2" />
                    History
                  </Button>
                )} */}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onVersionSelect(
                      selectedVersionId === version.dataset_version_id
                        ? null
                        : version.dataset_version_id
                    );
                    setSelectedVersionId(
                      selectedVersionId === version.dataset_version_id
                        ? null
                        : version.dataset_version_id
                    );
                  }}
                >
                  View Columns
                </Button>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleDeleteVersion(
                              dataset.dataset_id,
                              version.dataset_version_id
                            )
                          }
                          disabled={dataset.is_system_generated}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      {dataset.is_system_generated
                        ? "Cannot delete system-generated version"
                        : "Delete version"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {selectedVersionId === version.dataset_version_id && (
              <div className="mt-4">
                <DatasetVersionColumns
                  datasetId={dataset.dataset_id}
                  versionId={version.dataset_version_id}
                  columns={versionColumns}
                  onUpdateColumns={onUpdateColumns}
                  isLoading={isLoadingColumns}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Accordion
        type="single"
        collapsible
        value={expandedDatasetId?.toString()}
        onValueChange={handleAccordionChange}
      >
        {paginatedDatasets.map((dataset) => (
          <AccordionItem
            key={dataset.dataset_id}
            value={dataset.dataset_id.toString()}
          >
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-1 items-center justify-between px-4">
                <div className="flex items-center space-x-4">
                  <div className="text-left">
                    <h3 className="text-sm font-medium">{dataset.label}</h3>
                    <div className="flex gap-2">
                      <p className="text-sm text-muted-foreground">
                        {dataset.code}
                      </p>
                      <Badge>{dataset.framework}</Badge>
                      <Badge variant="outline">{dataset.type}</Badge>
                      {!dataset.is_visible && (
                        <Badge variant="secondary">Hidden</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className="flex items-center space-x-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  {handleConfigureDataset && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleConfigureDataset(dataset)}
                    >
                      <Settings2 className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  )}

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditDataset(dataset)}
                            disabled={dataset.is_system_generated}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {dataset.is_system_generated
                          ? "Cannot edit system-generated dataset"
                          : "Edit dataset"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleDeleteDataset(dataset.dataset_id)
                            }
                            disabled={dataset.is_system_generated}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {dataset.is_system_generated
                          ? "Cannot delete system-generated dataset"
                          : "Delete dataset"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent>
              <div className="px-4 py-2 space-y-4">
                {dataset.description && (
                  <p className="text-sm text-muted-foreground">
                    {dataset.description}
                  </p>
                )}

                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Versions</h3>
                  {!dataset.is_system_generated && (
                    <Button
                      onClick={() => {
                        setIsVersionModalOpen(true);
                        handleDatasetClick(dataset);
                      }}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Version
                    </Button>
                  )}
                </div>

                {renderVersions(dataset)}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            variant="outline"
            size="sm"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};
