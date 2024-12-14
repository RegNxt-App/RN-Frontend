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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { fastApiInstance } from "@/lib/axios";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { Asterisk } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";

interface FilterField {
  code: string;
  label: string;
  is_mandatory: boolean;
  datatype: string;
  datatype_format?: string;
  value_statement?: string;
  is_report_snapshot_field: boolean;
  is_filter: boolean;
  column_order?: number;
}

interface FilterPanelProps {
  datasetId: string | number;
  versionId: string | number;
  onFilterApply: (filterValues: Record<string, any>) => Promise<void>;
  disabled?: boolean;
}

interface Option {
  value: string;
  label: string;
}

const filterFieldsFetcher = (url: string) =>
  fastApiInstance.get(url).then((res) => res.data);

const fetchDropdownOptions = async (
  url: string,
  statement: string
): Promise<Option[]> => {
  try {
    const response = await fastApiInstance.get(url, {
      params: { statement },
    });
    return response.data
      .map((item: any) => ({
        value: item.value?.toString() || "",
        label: item.label || item.value?.toString() || "",
      }))
      .filter((option: Option) => option.value !== "");
  } catch (error) {
    console.error("Error fetching dropdown options:", error);
    return [];
  }
};

export default function DatasetFilter({
  datasetId,
  versionId,
  onFilterApply,
  disabled = false,
}: FilterPanelProps) {
  const { toast } = useToast();
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [isApplying, setIsApplying] = useState(false);

  const { data: filterFields, isLoading } = useSWR<{ data: FilterField[] }>(
    versionId
      ? `/api/v1/datasets/${datasetId}/filters/?version_id=${versionId}`
      : null,
    filterFieldsFetcher
  );

  const { snapshotFields, filterFields: regularFilters } = useMemo(() => {
    if (!filterFields?.data) return { snapshotFields: [], filterFields: [] };

    const sorted = [...filterFields.data].sort(
      (a, b) => (a.column_order || 0) - (b.column_order || 0)
    );

    return {
      snapshotFields: sorted.filter((f) => f.is_report_snapshot_field),
      filterFields: sorted.filter(
        (f) => !f.is_report_snapshot_field && f.is_filter
      ),
    };
  }, [filterFields]);

  const fieldsWithStatements = useMemo(() => {
    return [...snapshotFields, ...regularFilters].filter(
      (field) => field.value_statement
    );
  }, [snapshotFields, regularFilters]);

  const { data: dropdownOptionsData } = useSWR(
    fieldsWithStatements.length > 0
      ? fieldsWithStatements.map((field) => ({
          url: `/api/v1/datasets/${datasetId}/execute_statement/`,
          statement: field.value_statement,
          code: field.code,
        }))
      : null,
    async (requests) => {
      const results = await Promise.all(
        requests.map((req) =>
          fetchDropdownOptions(req.url, req.statement as any)
            .then((options) => ({ code: req.code, options }))
            .catch((error) => {
              console.error(`Error fetching options for ${req.code}:`, error);
              return { code: req.code, options: [] };
            })
        )
      );

      return results.reduce((acc, { code, options }) => {
        acc[code] = options;
        return acc;
      }, {} as Record<string, Option[]>);
    },
    {
      dedupingInterval: 60000,
      revalidateOnFocus: false,
    }
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dropdownOptions = dropdownOptionsData || {};

  const handleFilterChange = useCallback((code: string, value: any) => {
    setFilterValues((prev) => ({
      ...prev,
      [code]: value === "__clear__" ? null : value,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilterValues({});
  }, []);

  const canApplyFilters = useMemo(() => {
    const mandatoryFields = [...snapshotFields, ...regularFilters].filter(
      (f) => f.is_mandatory
    );

    return mandatoryFields.every(
      (field) =>
        filterValues[field.code] !== undefined &&
        filterValues[field.code] !== null &&
        filterValues[field.code] !== ""
    );
  }, [filterValues, snapshotFields, regularFilters]);

  const handleApplyFilters = async () => {
    if (disabled || !canApplyFilters) return;

    setIsApplying(true);
    try {
      await onFilterApply(filterValues);
    } catch (error) {
      console.error("Error applying filters:", error);
      toast({
        title: "Error",
        description: "Failed to apply filters. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  const renderField = useCallback(
    (field: FilterField) => {
      const value = filterValues[field.code];

      if (field.value_statement) {
        const options = dropdownOptions[field.code] || [];
        return (
          <Select
            value={value?.toString() || ""}
            onValueChange={(v) => handleFilterChange(field.code, v)}
            disabled={disabled}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={`Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {/* Only add clear option if there's a current value */}
              {value && (
                <SelectItem value="__clear__">Clear selection</SelectItem>
              )}
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label || option.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      if (field.datatype.toLowerCase() === "gregorianday") {
        return (
          <div className="flex items-center space-x-2">
            <DatePicker
              value={value}
              onChange={(date) =>
                handleFilterChange(
                  field.code,
                  date ? format(date, "yyyy-MM-dd") : null
                )
              }
              placeholder={`Select ${field.label}`}
              disabled={disabled}
            />
            {value && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleFilterChange(field.code, null)}
                disabled={disabled}
              >
                ×
              </Button>
            )}
          </div>
        );
      }

      return (
        <div className="flex items-center space-x-2">
          <Input
            type={field.datatype === "number" ? "number" : "text"}
            value={value || ""}
            onChange={(e) => handleFilterChange(field.code, e.target.value)}
            placeholder={`Enter ${field.label}`}
            disabled={disabled}
          />
          {value && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFilterChange(field.code, null)}
              disabled={disabled}
            >
              ×
            </Button>
          )}
        </div>
      );
    },
    [filterValues, handleFilterChange, dropdownOptions, disabled]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {snapshotFields.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            Report Snapshot Fields
            <Badge variant="outline">Priority 1</Badge>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {snapshotFields.map((field) => (
              <div key={field.code} className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  {field.label}
                  {field.is_mandatory && (
                    <Asterisk className="inline-block ml-1 h-3 w-3 text-destructive" />
                  )}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
        </div>
      )}

      {regularFilters.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            Additional Filters
            <Badge variant="outline">Priority 2</Badge>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regularFilters.map((field) => (
              <div key={field.code} className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  {field.label}
                  {field.is_mandatory && (
                    <Badge
                      variant="destructive"
                      className="h-2 w-2 rounded-full p-0"
                    />
                  )}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
        </div>
      )}

      {!canApplyFilters && (
        <Alert variant="destructive">
          <InfoCircledIcon className="h-4 w-4" />
          <AlertDescription>
            Please fill in all mandatory fields before applying filters.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={handleClearFilters}
          disabled={disabled || Object.keys(filterValues).length === 0}
        >
          Clear Filters
        </Button>
        <Button
          onClick={handleApplyFilters}
          disabled={disabled || !canApplyFilters || isApplying}
        >
          {isApplying ? "Applying..." : "Show Data"}
        </Button>
      </div>
    </div>
  );
}
