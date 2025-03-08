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
  count: number;
  num_pages: number;
  results: TaskType[];
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
  task_subtype_id: number;
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
  task_subtype_id: number;
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
export interface SystemVariablesResponse {
  count: number;
  num_pages: number;
  results: SystemVariable[];
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
export interface WorkflowRun {
  'Run ID': number;
  'Pipeline Name': string;
  Status: string;
  'Started At': string;
  'Completed At': string;
  'Total Runtime (seconds)': string | number;
  'Block Details': Array<{
    'Block UUID': string;
    Status: string;
    'Started At': string | null;
    'Completed At': string | null;
  }>;
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
export interface NodeData extends Record<string, unknown> {
  label: string;
  type: number;
  language: string | null;
}

export interface WorkflowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow?: Workflow | null;
}
export interface Task {
  task_id: number;
  code?: string;
  label: string;
  description?: string;
  task_type_label?: string;
  is_predefined?: boolean;
  task_language: string | null;
  task_code: string;
  context?: string;
  task_type_id: number;
  task_type_code?: string;
  task_subtype_id: number;
  upstream_tasks: number[] | null;
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
  selectedTask: Task | null;
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

export interface DMSubtask {
  subtask_id: number;
  task_id: number;
  label: string;
  description: string;
  order: number;
  output_fields: any[];
  filters: any[];
}
export interface TaskParameter {
  id: number;
  parameter_id: number;
  default_value: string;
  source?: 'dataset' | 'dataview';
}
export interface DataviewOption {
  dataview_version_id: number;
  code: string;
}
export interface DatasetOption {
  dataset_version_id: number;
  code: string;
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
export interface TaskSubtypeParameter {
  id: number;
  name: string;
}

export interface SubtypeParamsResponse {
  task_subtype_id: number;
  parameters: TaskSubtypeParameter[];
}
export interface SortableItemProps {
  id: string;
  label: string;
  description: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export interface SortableListProps {
  items: DMSubtask[];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  selectedId?: number;
  disabled?: boolean;
  onItemClick: (item: DMSubtask) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  total: number;
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
      tasks: Array<TaskType & {isPredefined: boolean}>;
    }
  >;
}
export interface AddRuntimeParameterDialogProps {
  taskId: number;
  availableParameters: AvailableParameter[];
  onParameterAdd: () => void;
  isDisabled: boolean;
}

export interface VariableCardProps {
  selectedVariable: SystemVariable;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (variable: SystemVariable) => void;
  onChange: (variable: SystemVariable) => void;
}
export interface VariableListItemProps {
  variable: SystemVariable;
  isSelected: boolean;
  onSelect: (variable: SystemVariable) => void;
}
export interface WorkflowContextType {
  currentWorkflow: Workflow | null;
  nodes: Node<NodeData>[];
  edges: Edge[];
  tasks: WorkflowTask[];
  isEditing: boolean;
  setCurrentWorkflow: (workflow: Workflow | null) => void;
  setNodes: React.Dispatch<React.SetStateAction<Node<NodeData>[]>>;
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  setTasks: React.Dispatch<React.SetStateAction<WorkflowTask[]>>;
  setIsEditing: (isEditing: boolean) => void;
  onConnect: (connection: Connection) => void;
}
export interface SortableItemProps {
  id: string;
  label: string;
  description: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}
export interface ApiResponse<T> {
  data: T;
}

export interface TaskDetailTabsProps {
  selectedTask: TaskDetails;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  localTask: TaskDetails;
  setLocalTask: (task: TaskDetails | null) => void;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  designTimeParams: {
    sourceId: string;
    sourceType: 'dataset' | 'dataview';
    destinationId: string;
  };
  setDesignTimeParams: (params: any) => void;
  runtimeParams: RuntimeParameter[];
  onSave: () => Promise<void>;
  onDeleteClick: () => void;
  inputOptionsResponse?: ApiResponse<(DatasetOption | DataviewOption)[]>;
  outputOptionsResponse?: ApiResponse<DatasetOption[]>;
  variablesResponse?: VariableResponse[];
}
export interface ConfigurationsTabContentProps {
  selectedTask: TaskDetails;
  localTask: TaskDetails;
  handleInputChange: (field: keyof TaskDetails, value: string) => void;
  designTimeParams: {
    sourceId: string;
    sourceType: 'dataset' | 'dataview';
    destinationId: string;
  };
  setDesignTimeParams: React.Dispatch<
    React.SetStateAction<{
      sourceId: string;
      sourceType: 'dataset' | 'dataview';
      destinationId: string;
    }>
  >;
  variablesResponse?: VariableResponse[];
  inputOptionsResponse?: ApiResponse<(DatasetOption | DataviewOption)[]>;
  outputOptionsResponse?: ApiResponse<DatasetOption[]>;
  runtimeParams: RuntimeParameter[];
}
export interface PropertiesTabContentProps {
  selectedTask: TaskDetails;
  localTask: TaskDetails;
  handleInputChange: (field: keyof TaskDetails, value: string) => void;
}
export interface TooltipWrapperProps {
  children: React.ReactNode;
  disabled?: boolean;
  disabledMessage?: string;
  enabled?: boolean;
}
