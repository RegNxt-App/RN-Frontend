import {Connection, Edge, Node, Position} from '@xyflow/react';
import {LucideIcon} from 'lucide-react';

export interface TableColumn {
  id?: string;
  name: string;
  description: string;
  type: string;
  key?: boolean;
  handleType?: 'source' | 'target';
}

export interface Dataset {
  dataset_id: number;
  code: string;
  label: string;
  description: string;
  framework: string;
  type: string;
  is_system_generated: boolean;
  version_nr?: string;
  version_code?: string;
  valid_to?: string;
  valid_from?: string;
  is_visible?: boolean;
  latest_version_id?: number;
  groups: {code: string | null; label: string | null; order: number | null}[];
}

export interface ExcelUploadData {
  [key: string]: string | null;
}

export interface MetadataColumn {
  code: string;
  label: string;
  datatype: string;
  is_mandatory: boolean;
  [key: string]: any;
}

export interface Column {
  dataset_version_column_id: number;
  dataset_version_id: number;
  column_order: number;
  code: string;
  label: string;
  description: string;
  role: string;
  dimension_type: string;
  datatype: string;
  datatype_format: string;
  is_mandatory: boolean;
  is_key: boolean;
  value_statement: string;
  is_filter: boolean;
  is_report_snapshot_field: boolean;
  is_system_generated: boolean;
  historization_type: number;
  is_visible: boolean;
}

export interface Datasets {
  count: number;
  num_pages: number;
  results: Dataset[];
}
export interface DatasetResponse {
  data: {
    results: Dataset[];
    count: number;
    next: string | null;
    previous: string | null;
  };
}

export interface DatasetVersion {
  dataset_version_id: number;
  dataset_id: number;
  version_nr: string;
  version_code: string;
  valid_from: string;
  valid_to: string | null;
  is_system_generated: boolean;
  code: string;
  label: string;
  description: string;
}

export interface DataItem {
  dataset_id: number;
  code: string;
  label: string;
  description: string;
  framework: string;
  type: string;
}

export interface FilterValue {
  value: string;
  label: string;
}

export interface FilterState {
  [key: string]: string | null;
}

export interface FilterOption {
  code: string;
  value: string;
  label: string;
  datatype: string;
  isSelected?: boolean;
}

export interface DropdownState {
  [key: string]: FilterOption[];
}

export interface DatasetVersions {
  data: DatasetVersion[];
}

export interface DatabaseTableData {
  label: string;
  columns: TableColumn[];
  schemaColor: string;
  [key: string]: unknown;
}

export interface CustomNodeProps extends Node<DatabaseTableData> {
  zIndex?: number;
}

export interface EdgeData {
  sourceKey: string;
  targetKey: string;
  relation: string;
  label: string;
  [key: string]: unknown;
}

export interface CustomEdge extends Edge<EdgeData> {
  sourcePosition?: Position;
  targetPosition?: Position;
}

export interface DatabaseTable {
  name: string;
  description: string;
  position: {x: number; y: number};
  columns: TableColumn[];
  schemaColor: string;
  schema?: string;
}

export interface EdgeConfig {
  source: string;
  sourceKey: string;
  target: string;
  targetKey: string;
  relation: string;
  sourcePosition?: string;
  targetPosition?: string;
}

export interface DatabaseConfig {
  tables: DatabaseTable[];
  edgeConfigs: EdgeConfig[];
}

export interface Framework {
  code: string;
  name: string;
}

export interface Frameworks {
  data: Framework[];
}

export interface DatasetItem {
  dataset_id: number;
  code: string;
  label: string;
  description: string;
  framework: string;
  type: string;
  groups: {code: string | null; label: string | null; order: number | null}[];
  latest_version_id: number;
  version_nr: number;
}

export interface Layer {
  name: string;
  code: string;
}

export interface Layers {
  data: Layer[];
}

export interface MetadataItem {
  dataset_version_column_id: number;
  code: string;
  label: string;
  description: string;
  datatype: string;
  datatype_format: string;
  is_mandatory: boolean;
  is_key: boolean;
  value_statement: string;
  is_filter: boolean;
  value_options?: {
    item_code: string;
    item_name: string;
  }[];
}

export interface ValidationResult {
  dataset_version_column_id: number;
  row_id: number | string;
  severity_level: string;
  validation_msg: string;
  column_name: string;
}

export interface Task {
  task_id: number;
  code?: string;
  label: string;
  description?: string;
  task_type_label?: string;
  is_predefined: boolean;
  task_language?: string | null;
  task_code: string;
  context?: string;
  task_type_id: number;
  task_type_code: string;
  task_subtype_id: number;
  upstream_tasks: number[] | null;
  parameters: TaskParameter[];
}

export interface TaskSubType {
  task_subtype_id: number;
  task_type_id: number;
  code: string;
  label: string;
  description: string;
  component: string;
  parameters: TaskParameter[];
}
export interface WorkflowTask {
  task_id: number;
  task_code: string;
  task_type_id: number;
  label: string;
  task_language: string;
  upstream_tasks: number[];
}

export interface TasksApiResponse {
  count: number;
  num_pages: number;
  results: Task[];
}
export interface SystemVariable {
  system_variable_id: number;
  category: string;
  variable_name: string;
  value: string;
  description: string;
}
export interface UserSetting {
  setting_id: number;
  category: string;
  setting_name: string;
  value: string;
  description: string;
}
export interface Group {
  code: string;
  label: string;
  description: string;
  is_system_generated: boolean;
  items: string;
}

export interface DMSubtask {
  subtask_id: number;
  task_id: number;
  label: string;
  description: string;
  order: number;
  output_fields: any[];
  filters: any[];
}
export interface WorkflowRun {
  run_id: number;
  pipeline_name: string;
  status: string;
  started_at: string;
  completed_at: string;
  total_runtime_seconds: string | number;
  block_details: Array<{
    block_uuid: string;
    run_id: number;
    pipeline_name: string;
    status: string;
    started_at: string;
    completed_at: string;
    total_runtime_seconds: string | number;
    block_details: Array<{
      block_uuid: string;
      status: string;
      started_at: string | null;
      completed_at: string | null;
    }>;
  }>;
}

export interface TaskSubtypeParameter {
  id: number;
  name: string;
}
export interface WorkflowParameter {
  task_id: number;
  default_value: string | null;
  name: string;
  label: string;
  description: string;
  statement: string;
  is_enum: boolean;
  options: Array<{
    value: number | string;
    label: string;
  }>;
}

export interface Field {
  name: string;
  type: string;
  label: string;
}
export interface DatasetOption {
  id: string | number;
  dataset_version_id: number;
  code: string;
  source: string;
  label: string;
}
export interface DataviewOption {
  id: string | number;
  source: string;
  dataview_version_id: number;
  code: string;
  label: string;
}
export interface GroupsResponse {
  count: number;
  num_pages: number;
  results: Group[];
}
export interface Grouping {
  data: GroupsResponse;
}
export interface EditableColumnTableProps {
  initialColumns: Column[];
  datasetId: string | number;
  versionId: string | number;
  onColumnChange?: () => void;
  isLoading?: boolean;
}

export interface ColumnData {
  data: Column[];
}

export interface StatItem {
  title: string;
  count: string;
  description: string;
  titleIcon: JSX.Element;
  descriptionIcon: JSX.Element;
}

export interface SystemVariablesResponse {
  count: number;
  num_pages: number;
  results: SystemVariable[];
}

export interface Workflow {
  workflow_id: number;
  code: string;
  label: string;
  description: string;
  engine: string;
  active: string;
  last_deployed: string;
}

export interface NodeData extends Record<string, unknown> {
  label: string;
  type: number;
  language: string | null;
}

export interface DesignTimeParameters {
  sourceId: string;
  sourceType: 'dataset' | 'dataview';
  destinationId: string;
  inputLocation?: string;
  outputLocation?: string;
}

export interface RuntimeParameter {
  id: string;
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
  parameter_id: number;
  default_value: string | null;
  label: string;
  data_type: string;
}
export interface AvailableParameter {
  variable_id: number;
  name: string;
  label: string;
  description: string;
  data_type: string;
}

export interface RuntimeParam {
  id: string;
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
}

export interface TaskParameter {
  id?: number;
  parameter_id?: number;
  default_value?: string;
  value?: string;
  source?: 'dataset' | 'dataview';
}

export interface VariableResponse {
  variable_id: number;
  name: string;
  label: string;
  description: string;
  data_type: string;
  is_enum: boolean;
  statement: string;
  min_value: null | number;
  max_value: null | number;
}

export interface SubtypeParamsResponse {
  task_subtype_id: number;
  parameters: TaskSubtypeParameter[];
}

export interface GroupedTask {
  type_id: number;
  type_code: string;
  label: string;
  subtypes: Record<
    number,
    {
      subtype_id: number;
      label: string;
      tasks: Array<Task & {isPredefined: boolean}>;
    }
  >;
}

export interface ApiResponse<T> {
  data: T;
}
export interface DesignTimeParams {
  sourceId: string | null;
  sourceType: 'dataset' | 'dataview' | null;
  destinationId: string | null;
}

export interface TaskFeatures {
  allowsCustomCode: boolean;
  requiresTransformation: boolean;
}

export interface TaskSubTypeConfig {
  id: number;
  code: string;
  label: string;
  description: string;
  features: TaskFeatures;
}

export interface TaskTypeConfig {
  id: number;
  code: string;
  label: string;
  description: string;
  subtypes: TaskSubTypeConfig[];
}

export interface TaskConfigurationResponse {
  taskTypes: {
    [key: string]: TaskTypeConfig;
  };
  defaultLanguages: {
    [key: string]: string | null;
  };
  features: {
    [key: string]: string;
  };
}

export interface WorkflowRunColumn {
  run_id: number;
  status: string;
  started_at: string;
  completed_at: string | null;
  total_runtime_seconds: string | number;
  block_details: Array<{
    block_uuid: string;
    status: string;
    started_at: string | null;
    completed_at: string | null;
  }>;
}
export interface ConnectionType {
  type_id: number;
  code: string;
  name: string;
  description: string;
  connection_properties: Record<string, any>;
}

export interface Connection {
  id: number;
  type_id: number;
  name: string;
  type_name: string;
  connection_string: string;
  is_system_generated: boolean;
  created_at: string;
  created_by: string | null;
}

export interface ConnectionFormData {
  name: string;
  type: string;
  properties: Record<string, any>;
}

export type LineageDirection = 'source-to-destination' | 'destination-to-source';

export interface Layer {
  layer: string;
  datasets: string[];
}

export interface LineageConnection {
  logical_transformation_rule_id: string;
  source_dataset: string;
  destination_dataset: string;
}

export interface TransformationDetail {
  logical_transformation_rule_id: string;
  source_dataset: string;
  source_column: string;
  destination_dataset: string;
  destination_column: string;
}
export interface DerivationDetails {
  type: 'derivation';
  base_details: {
    logical_transformation_rule_id: string;
    destination_dataset: string;
    destination_column: string;
    dataview_statement: string;
    transformation_statement: string;
  };
  column_mappings: Array<{
    source_column: string | null;
    destination_column: string | null;
    destination_column_label: string;
    source_dataset: string;
    destination_dataset: string;
  }>;
}

export interface GenerationDetails {
  type: 'generation';
  base_details: {
    logical_transformation_rule_id: string;
    destination_dataset: string;
    dataview_statement: string;
  };
  column_mappings: Array<{
    source_column: string | null;
    destination_column: string | null;
    destination_column_label: string;
    source_dataset: string;
    destination_dataset: string;
  }>;
  reporting_cells: Array<{
    reporting_cell: string;
    row_name: string;
    col_name: string;
    filter_statement: string;
  }>;
}
