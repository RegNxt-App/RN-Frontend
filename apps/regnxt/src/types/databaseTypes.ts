import {Edge, Node, Position} from '@xyflow/react';
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
export interface ApiTask {
  task_type_id: number;
  task_subtype_id: number;
  task_type_code: string;
  task_type_label: string;
  task_id: number;
  code: string;
  label: string;
  description: string;
  context: string;
  is_predefined: boolean;
  task_language: string | null;
  task_code: string | null;
}
export interface TasksApiResponse {
  data: ApiTask[];
}
export interface TaskType {
  task_id: number;
  code: string;
  label: string;
  description?: string;
  task_type_label?: string;
  is_predefined: boolean;
  task_language?: string | null;
  task_code?: string | null;
  context?: string;
  task_type_id: number;
  task_type_code: string;
}
export interface Group {
  code: string;
  label: string;
  description: string;
  is_system_generated: boolean;
  items: string;
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
export interface TaskDetails {
  id: string | number;
  code: string;
  label: string;
  description?: string;
  task_type_label?: string;
  is_predefined: boolean;
  task_language?: string | null;
  task_code?: string | null;
  context?: string;
  task_type_id: number;
  task_type_code: string;
  task_id: number;
}

export interface TaskDetailTabsProps {
  selectedTask: TaskDetails;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onDelete?: () => void;
}
export interface StatItem {
  title: string;
  count: string;
  description: string;
  titleIcon: JSX.Element;
  descriptionIcon: JSX.Element;
}
export interface SystemVariable {
  system_variable_id: number;
  category: string;
  variable_name: string;
  value: string;
  description: string;
}
export interface TaskSubType {
  task_subtype_id: number;
  task_type_id: number;
  code: string;
  label: string;
  description: string;
  component: string;
  parameters: any | null;
}

export interface Workflow {
  workflow_id: number;
  code: string;
  label: string;
  description: string;
  engine: string;
}

export interface WorkflowParameter {
  task_id: number;
  name: string;
  label: string;
  description: string;
  default_value: string;
  is_enum: boolean;
  statement: string;
}
export interface WorkflowRun {
  'Run ID': string;
  'Pipeline Name': string;
  Status: string;
  'Started At': string;
  'Completed At': string;
  'Total Runtime (seconds)': number | string;
}

export interface UserSetting {
  setting_id: number;
  category: string;
  setting_name: string;
  value: string;
  description: string;
}

export interface GroupedSettings {
  [key: string]: UserSetting[];
}

export interface EditingStates {
  [key: number]: boolean;
}

export interface CategoryIcons {
  [key: string]: LucideIcon;
}

export interface WorkflowTask {
  task_id: number;
  task_code: string;
  task_type_id: number;
  label: string;
  task_language: string;
  upstream_tasks: number[];
}
export interface NodeData {
  label: string;
  type: number;
  language?: string;
}
export interface WorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow?: Workflow | null;
}
export interface Task {
  task_id: number;
  task_code: string;
  task_type_id: number;
  label: string;
  task_language: string | null;
  upstream_tasks: number | null;
}
export interface CustomNodeProps {
  data: {
    label: string;
    type: number;
    language?: string;
  };
}
export interface TransformationTabProps {
  disabled?: boolean;
  onSave?: () => void;
}
export interface DesignTimeParameters {
  sourceId: string;
  sourceType: 'dataset' | 'dataview';
  destinationId: string;
}

export interface RuntimeParameter {
  id: string;
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
}

export interface Field {
  name: string;
  type: string;
  label: string;
}

export interface RuntimeParam {
  id: string;
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
}

export interface FieldMapping {
  destinationField: string;
  sourceField: string;
  runtimeParam?: string;
}

export interface FieldMappingGridProps {
  sourceFields: Field[];
  destinationFields: Field[];
  runtimeParams: RuntimeParam[];
  mappings: FieldMapping[];
  onMappingChange: (newMappings: FieldMapping[]) => void;
  disabled?: boolean;
}
