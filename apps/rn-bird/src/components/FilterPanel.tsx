import { DatePicker } from "@/components/GDate";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { fastApiInstance } from "@/lib/axios";
import { format } from "date-fns";
import {
  AlertCircle,
  CircleDot,
  FileQuestion,
  InfoIcon,
  Loader,
  Loader2,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";

// Types
interface FilterField {
  code: string;
  label: string;
  is_mandatory: boolean;
  datatype: string;
  datatype_format?: string;
  value_statement?: string;
  is_report_snapshot_field: boolean;
  is_filter: boolean;
  column_order: number;
  description?: string;
}

interface FilterPanelProps {
  datasetId: string | number;
  versionId: string | number;
  onFilterApply: (filterValues: Record<string, any>) => Promise<void>;
  disabled?: boolean;
  setHasAppliedFilters: any;
  isDataLoading?: boolean;
}

interface DropdownOption {
  value: string;
  label: string;
}

interface FilterResponse {
  data: FilterField[];
}

// Helper Components
const NoResults: React.FC<{ title?: string; message?: string }> = ({
  title = "No results found",
  message = "Try adjusting your filters to find what you're looking for.",
}) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 bg-muted/20 rounded-lg border border-dashed">
    <FileQuestion className="h-16 w-16 text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground text-center max-w-sm">{message}</p>
  </div>
);

const ActiveFilters: React.FC<{
  filterValues: Record<string, any>;
  fields: FilterField[];
  onClearFilter: (code: string) => void;
  disabled?: boolean;
}> = ({ filterValues, fields, onClearFilter, disabled }) => {
  const activeFilters = Object.entries(filterValues).filter(
    ([_, value]) => value !== null && value !== ""
  );

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-4">
      {activeFilters.map(([code, value]) => {
        const field = fields.find((f) => f.code === code);
        if (!field) return null;

        return (
          <Badge
            key={code}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <span>
              {field.label}: {value}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => onClearFilter(code)}
              disabled={disabled}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        );
      })}
    </div>
  );
};

const FilterField: React.FC<{
  field: FilterField;
  value: any;
  onChange: (value: any) => void;
  options?: DropdownOption[];
  disabled?: boolean;
}> = ({ field, value, onChange, options = [], disabled }) => {
  if (field.value_statement) {
    return (
      <Select
        value={value?.toString() || ""}
        onValueChange={(v) => onChange(v === "__clear__" ? null : v)}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Select ${field.label}`} />
        </SelectTrigger>
        <SelectContent>
          {value && (
            <SelectItem value="__clear__" className="text-destructive">
              Clear selection
            </SelectItem>
          )}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field.datatype.toLowerCase() === "gregorianday") {
    return (
      <div className="flex items-center gap-2">
        <DatePicker
          value={value}
          onChange={(date) =>
            onChange(date ? format(date, "yyyy-MM-dd") : null)
          }
          placeholder={`Select ${field.label}`}
          disabled={disabled}
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(null)}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type={field.datatype === "number" ? "number" : "text"}
        value={value || ""}
        onChange={(e) => onChange(e.target.value || null)}
        placeholder={`Enter ${field.label}`}
        disabled={disabled}
      />
      {value && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(null)}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default function FilterPanel({
  datasetId,
  versionId,
  onFilterApply,
  disabled = false,
  setHasAppliedFilters,
  isDataLoading = false,
}: FilterPanelProps) {
  const { toast } = useToast();
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [isApplying, setIsApplying] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Fetch filter fields configuration
  const { data: filterFields, isLoading: isFieldsLoading } =
    useSWR<FilterResponse>(
      versionId
        ? `/api/v1/datasets/${datasetId}/filters/?version_id=${versionId}`
        : null,
      fastApiInstance,
      {
        revalidateOnFocus: false,
      }
    );

  // Initialize filter values
  useEffect(() => {
    if (filterFields?.data) {
      const initialValues = filterFields.data.reduce((acc, field) => {
        acc[field.code] = null;
        return acc;
      }, {} as Record<string, any>);
      setFilterValues(initialValues);
    }
  }, [filterFields, versionId]);

  // Separate snapshot and regular filters
  const { snapshotFields, filterFields: regularFilters } = useMemo(() => {
    if (!filterFields?.data) return { snapshotFields: [], filterFields: [] };

    const sorted = [...filterFields.data].sort(
      (a, b) => a.column_order - b.column_order
    );

    return {
      snapshotFields: sorted.filter((f) => f.is_report_snapshot_field),
      filterFields: sorted.filter(
        (f) => !f.is_report_snapshot_field && f.is_filter
      ),
    };
  }, [filterFields]);

  // Fetch dropdown options
  const { data: dropdownOptions, isLoading: isOptionsLoading } = useSWR(
    filterFields?.data
      ? filterFields.data
          .filter((f) => f.value_statement)
          .map((f) => ({
            url: `/api/v1/datasets/${datasetId}/execute_statement/`,
            statement: f.value_statement,
            code: f.code,
          }))
      : null,
    async (requests) => {
      const results = await Promise.all(
        requests.map(async (req) => {
          try {
            const response = await fastApiInstance.get(req.url, {
              params: { statement: req.statement },
            });
            return {
              code: req.code,
              options: response.data.map((item: any) => ({
                value: item.value?.toString() || "",
                label: item.label || item.value?.toString() || "",
              })),
            };
          } catch (error) {
            console.error(`Error fetching options for ${req.code}:`, error);
            return { code: req.code, options: [] };
          }
        })
      );

      return results.reduce((acc, { code, options }) => {
        acc[code] = options;
        return acc;
      }, {} as Record<string, DropdownOption[]>);
    },
    { dedupingInterval: 60000, revalidateOnFocus: false }
  );

  const handleFilterChange = useCallback((code: string, value: any) => {
    setFilterValues((prev) => ({
      ...prev,
      [code]: value,
    }));
  }, []);
  const canApplyFilters = useMemo(() => {
    const mandatoryFields = [...snapshotFields, ...regularFilters].filter(
      (f) => f.is_mandatory
    );
    return mandatoryFields.every(
      (field) =>
        filterValues[field.code] != null && filterValues[field.code] !== ""
    );
  }, [filterValues, snapshotFields, regularFilters]);

  const handleClearFilters = useCallback(async () => {
    setIsClearing(true);
    try {
      const clearedValues = Object.keys(filterValues).reduce((acc, code) => {
        acc[code] = null;
        return acc;
      }, {} as Record<string, any>);

      setFilterValues(clearedValues);
      setHasAppliedFilters(false);
      await onFilterApply(clearedValues);

      toast({
        title: "Success",
        description: "All filters have been cleared",
      });
    } catch (error) {
      console.error("Error clearing filters:", error);
      toast({
        title: "Error",
        description: "Failed to clear filters",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValues, onFilterApply, toast]);

  const handleApplyFilters = useCallback(async () => {
    if (!canApplyFilters || isApplying) return;

    setIsApplying(true);
    try {
      await onFilterApply(filterValues);
      toast({
        title: "Success",
        description: "Filters applied successfully",
      });
    } catch (error) {
      console.error("Error applying filters:", error);
      toast({
        title: "Error",
        description: "Failed to apply filters",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  }, [filterValues, onFilterApply, canApplyFilters, isApplying, toast]);

  const isLoading = isFieldsLoading || isOptionsLoading || isDataLoading;
  const isDisabled = disabled || isLoading;

  if (
    !filterFields?.data ||
    (snapshotFields.length === 0 && regularFilters.length === 0)
  ) {
    return (
      <NoResults
        title="No filters available"
        message="There are no filters configured for this dataset."
      />
    );
  }

  return (
    <div className="space-y-6 relative">
      {snapshotFields.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Report Snapshot Fields</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {snapshotFields.map((field) => (
              <div key={field.code} className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">
                    {field.label}
                    {field.is_mandatory && (
                      <CircleDot className="inline-block ml-1 h-3 w-3 text-destructive" />
                    )}
                  </label>
                  {field.description && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>{field.description}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <FilterField
                  field={field}
                  value={filterValues[field.code]}
                  onChange={(value) => handleFilterChange(field.code, value)}
                  options={dropdownOptions?.[field.code]}
                  disabled={isDisabled}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {regularFilters.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">Additional Filters</h3>
            <Badge variant="outline">Priority 2</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularFilters.map((field) => (
              <div key={field.code} className="space-y-2">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">
                    {field.label}
                    {field.is_mandatory && (
                      <CircleDot className="inline-block ml-1 h-3 w-3 text-destructive" />
                    )}
                  </label>
                  {field.description && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <InfoIcon className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>{field.description}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <FilterField
                  field={field}
                  value={filterValues[field.code]}
                  onChange={(value) => handleFilterChange(field.code, value)}
                  options={dropdownOptions?.[field.code]}
                  disabled={isDisabled}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      {!canApplyFilters && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fill in all mandatory fields to see the content.
          </AlertDescription>
        </Alert>
      )}
      <div className="flex space-x-4 mt-6">
        <Button
          variant="outline"
          onClick={handleClearFilters}
          disabled={
            isDisabled ||
            Object.values(filterValues).every((v) => v === null) ||
            isClearing
          }
          className="w-32"
        >
          {isClearing ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Clearing...
            </>
          ) : (
            "Clear Filters"
          )}
        </Button>
        <Button
          onClick={handleApplyFilters}
          disabled={isDisabled || !canApplyFilters || isApplying}
          className="min-w-[100px]"
        >
          {isApplying ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Applying...
            </>
          ) : (
            "Show Data"
          )}
        </Button>
      </div>

      <ActiveFilters
        filterValues={filterValues}
        fields={[...snapshotFields, ...regularFilters]}
        onClearFilter={(code) => handleFilterChange(code, null)}
        disabled={isDisabled}
      />

      {isDataLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="flex items-center gap-3 bg-background p-4 rounded-lg shadow-lg">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Loading data...</span>
          </div>
        </div>
      )}
    </div>
  );
}
