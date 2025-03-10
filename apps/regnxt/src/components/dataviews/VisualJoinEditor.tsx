import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  Background,
  Connection,
  ConnectionLineType,
  Controls,
  Edge,
  Handle,
  MarkerType,
  Node,
  NodeDragHandler,
  OnSelectionChangeParams,
  Panel,
  Position,
  ReactFlow,
  ReactFlowInstance,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';

import { Button } from '@rn/ui/components/ui/button';

import '@xyflow/react/dist/style.css';

import { toast } from '@/hooks/use-toast';
import { EdgeProps, getBezierPath } from '@xyflow/react';
import { Database, Edit, Link2, Plus, RefreshCw, Wand2, X } from 'lucide-react';

import { Card } from '@rn/ui/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@rn/ui/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@rn/ui/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@rn/ui/components/ui/tabs';

interface Table {
  id: string;
  name: string;
  columns: {name: string; type: string}[];
}

interface Join {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'inner' | 'left' | 'right' | 'full';
  conditions: {
    leftColumn: string;
    operator: string;
    rightColumn: string;
  }[];
}

interface VisualJoinEditorProps {
  tables: Table[];
  joins: Join[];
  onJoinUpdate: (joins: Join[]) => void;
}

function JoinEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
  selected,
}: EdgeProps) {
  const edgePath = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Extract join information from edge data
  const joinType = data?.joinType || 'inner';
  const joinLabel = joinType?.toUpperCase() + ' JOIN';
  const conditions = data?.conditions || [];

  // Determine the center point for the label
  const centerX = (sourceX + targetX) / 2;
  const centerY = (sourceY + targetY) / 2;

  // Function to open editor - explicitly triggered by edit button click
  const openEditor = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent event from propagating to parent elements
    if (data && data.onEditClick) {
      data.onEditClick(id);
    }
  };

  return (
    <>
      <path
        id={id}
        style={{...style, strokeWidth: 2}}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />

      {/* Interactive join badge */}
      <foreignObject
        width={120}
        height={40}
        x={centerX - 60}
        y={centerY - 20}
        className="overflow-visible pointer-events-none"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div className="flex justify-center items-center h-full">
          <div
            className={`
              px-3 py-1 rounded-full text-xs font-semibold 
              ${
                selected
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-primary/10 border border-primary/20 text-primary shadow-sm hover:bg-primary/20'
              } 
              transition-colors duration-200 
              pointer-events-auto cursor-pointer
              flex items-center gap-1
            `}
            data-id={id}
          >
            {selected && (
              <button
                className="h-5 w-5 flex items-center justify-center mr-1 hover:bg-white/20 rounded-full"
                title="Edit this join"
                onClick={openEditor}
              >
                <Edit className="h-3 w-3" />
              </button>
            )}
            {joinLabel}
            {conditions.length > 0 && (
              <span className={`text-xs ${selected ? 'text-white/80' : 'text-primary/80'} ml-1`}>
                ({conditions.length})
              </span>
            )}
          </div>
        </div>
      </foreignObject>
    </>
  );
}

// Custom node component for tables with proper handles
function TableNode({data}: {data: Table}) {
  return (
    <div className="px-3 py-2 shadow-lg rounded-md bg-background border-2 border-primary/20 hover:border-primary/40 min-w-[350px] max-h-[300px]  relative">
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{
          width: '14px',
          height: '14px',
          background: '#94a3b8',
          border: '2px solid white',
          transform: 'translateX(-8px)',
          boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
        className="hover:bg-primary-foreground transition-colors duration-200"
        isConnectable={true}
      />

      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{
          width: '14px',
          height: '14px',
          background: '#94a3b8',
          border: '2px solid white',
          transform: 'translateX(8px)',
          boxShadow: '0 0 0 1px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
        className="hover:bg-primary-foreground transition-colors duration-200"
        isConnectable={true}
      />

      {/* Connecting indicators/instructions */}
      <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 text-xs font-medium text-muted-foreground opacity-60 pointer-events-none">
        ← In
      </div>
      <div className="absolute -right-12 top-1/2 transform -translate-y-1/2 text-xs font-medium text-muted-foreground opacity-60 pointer-events-none">
        Out →
      </div>

      <div className="font-bold border-b pb-1 text-md flex items-center">
        <Database className="h-4 w-4 mr-2 text-primary/60" />
        {data.name}
      </div>
      <div className="mt-1 max-h-[500px] overflow-y-auto">
        {data.columns.map((column) => (
          <div
            key={column.name}
            className="flex justify-between py-1 text-xs"
          >
            <span className="font-medium">{column.name}</span>
            <span className="text-muted-foreground ml-3 text-xs">{column.type}</span>
          </div>
        ))}
      </div>
      <div className="border-t mt-1 pt-1 text-xs text-center text-primary/70">
        Use handles on sides to connect tables
      </div>
    </div>
  );
}

function DraggableTableItem({table, onDrag}: {table: Table; onDrag: () => void}) {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(table));
    event.dataTransfer.effectAllowed = 'move';
    onDrag();
  };

  return (
    <div
      className="px-3 py-2 bg-muted/70 rounded-md cursor-move flex items-center hover:bg-muted border border-transparent hover:border-primary/20"
      draggable
      onDragStart={onDragStart}
      title={`Drag to add ${table.name} to diagram`}
    >
      <Database className="h-4 w-4 mr-2 text-muted-foreground" />
      <span className="text-sm">{table.name}</span>
    </div>
  );
}

const nodeTypes = {
  tableNode: TableNode,
};

const edgeTypes = {
  joinEdge: JoinEdge,
};

function InlineJoinEditor({
  open,
  onClose,
  join,
  sourceTable,
  targetTable,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  join: Join | null;
  sourceTable: Table | null;
  targetTable: Table | null;
  onSave: (join: Join) => void;
}) {
  const [joinType, setJoinType] = useState<Join['type']>('inner');
  const [conditions, setConditions] = useState<Join['conditions']>([]);

  useEffect(() => {
    if (join) {
      setJoinType(join.type);
      setConditions(
        join.conditions.length > 0 ? [...join.conditions] : [{leftColumn: '', operator: '=', rightColumn: ''}]
      );
    }
  }, [join]);

  if (!sourceTable || !targetTable) {
    return null;
  }

  const addCondition = () => {
    setConditions([...conditions, {leftColumn: '', operator: '=', rightColumn: ''}]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, field: string, value: string) => {
    setConditions(
      conditions.map((condition, i) => {
        if (i === index) {
          return {...condition, [field]: value};
        }
        return condition;
      })
    );
  };

  const findPossibleMatches = () => {
    if (
      conditions.length === 0 ||
      (conditions.length === 1 && !conditions[0].leftColumn && !conditions[0].rightColumn)
    ) {
      const possibleMatches: {leftColumn: string; rightColumn: string}[] = [];

      sourceTable.columns.forEach((sourceCol) => {
        const matchingTargetCol = targetTable.columns.find(
          (targetCol) => targetCol.name.toLowerCase() === sourceCol.name.toLowerCase()
        );

        if (matchingTargetCol) {
          possibleMatches.push({
            leftColumn: sourceCol.name,
            rightColumn: matchingTargetCol.name,
          });
        }
      });

      if (possibleMatches.length === 0) {
        const sourceTableName = sourceTable.name.toLowerCase();
        const targetTableName = targetTable.name.toLowerCase();

        sourceTable.columns.forEach((sourceCol) => {
          if (sourceCol.name.toLowerCase().endsWith('_id')) {
            const prefix = sourceCol.name.toLowerCase().slice(0, -3); // Remove '_id'

            // Check if this might be a reference to the target table
            if (targetTableName.includes(prefix) || prefix.includes(targetTableName)) {
              const targetIdColumn = targetTable.columns.find(
                (col) => col.name.toLowerCase() === 'id' || col.name.toLowerCase() === `${prefix}_id`
              );

              if (targetIdColumn) {
                possibleMatches.push({
                  leftColumn: sourceCol.name,
                  rightColumn: targetIdColumn.name,
                });
              }
            }
          }
        });

        // Also check target table for foreign keys to source table
        targetTable.columns.forEach((targetCol) => {
          if (targetCol.name.toLowerCase().endsWith('_id')) {
            const prefix = targetCol.name.toLowerCase().slice(0, -3); // Remove '_id'

            // Check if this might be a reference to the source table
            if (sourceTableName.includes(prefix) || prefix.includes(sourceTableName)) {
              const sourceIdColumn = sourceTable.columns.find(
                (col) => col.name.toLowerCase() === 'id' || col.name.toLowerCase() === `${prefix}_id`
              );

              if (sourceIdColumn) {
                possibleMatches.push({
                  leftColumn: sourceIdColumn.name,
                  rightColumn: targetCol.name,
                });
              }
            }
          }
        });
      }

      // If we found any potential matches, add them as conditions
      if (possibleMatches.length > 0) {
        setConditions(
          possibleMatches.map((match) => ({
            ...match,
            operator: '=',
          }))
        );

        return true;
      }
    }

    return false;
  };

  const handleSave = () => {
    if (!join) return;

    const filteredConditions = conditions.filter((c) => c.leftColumn && c.rightColumn);

    // Ensure we have at least one condition
    if (filteredConditions.length === 0) {
      toast({
        title: 'Error',
        description: 'At least one join condition is required',
        variant: 'destructive',
      });
      return;
    }

    const updatedJoin: Join = {
      ...join,
      type: joinType,
      conditions: filteredConditions,
    };

    onSave(updatedJoin);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Configure Join
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="font-medium">{sourceTable.name}</div>
            <div className="px-2">→</div>
            <div className="font-medium">{targetTable.name}</div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Join Type</label>
            <Select
              value={joinType}
              onValueChange={(v) => setJoinType(v as Join['type'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inner">INNER JOIN</SelectItem>
                <SelectItem value="left">LEFT JOIN</SelectItem>
                <SelectItem value="right">RIGHT JOIN</SelectItem>
                <SelectItem value="full">FULL JOIN</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Join Conditions</label>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={() => {
                    if (findPossibleMatches()) {
                      toast({
                        title: 'Auto-detected join conditions',
                        description: 'Found potential matching columns',
                      });
                    } else {
                      toast({
                        title: 'No matches found',
                        description: 'Could not automatically detect matching columns',
                        variant: 'warning',
                      });
                    }
                  }}
                >
                  <Wand2 className="mr-1 h-3 w-3" />
                  Auto-detect
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs"
                  onClick={addCondition}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {conditions.map((condition, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2"
                >
                  <Select
                    value={condition.leftColumn}
                    onValueChange={(v) => updateCondition(index, 'leftColumn', v)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Source column" />
                    </SelectTrigger>
                    <SelectContent>
                      {sourceTable.columns.map((col) => (
                        <SelectItem
                          key={col.name}
                          value={col.name}
                        >
                          {col.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={condition.operator}
                    onValueChange={(v) => updateCondition(index, 'operator', v)}
                  >
                    <SelectTrigger className="w-[60px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="=">=</SelectItem>
                      <SelectItem value="!=">!=</SelectItem>
                      <SelectItem value="<">&lt;</SelectItem>
                      <SelectItem value="<=">&lt;=</SelectItem>
                      <SelectItem value=">">&gt;</SelectItem>
                      <SelectItem value=">=">&gt;=</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={condition.rightColumn}
                    onValueChange={(v) => updateCondition(index, 'rightColumn', v)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Target column" />
                    </SelectTrigger>
                    <SelectContent>
                      {targetTable.columns.map((col) => (
                        <SelectItem
                          key={col.name}
                          value={col.name}
                        >
                          {col.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {conditions.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeCondition(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function VisualJoinEditorContent({tables, joins, onJoinUpdate}: VisualJoinEditorProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [activeTab, setActiveTab] = useState<string>('diagram');
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [dragCounter, setDragCounter] = useState(0);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // State for inline join editor
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingJoin, setEditingJoin] = useState<Join | null>(null);

  const reactFlow = useReactFlow();

  // Helper function to calculate node positions in a circle
  const calculatePosition = (index: number, total: number, radius: number = 250) => {
    const angle = (index * 2 * Math.PI) / Math.max(total, 1);
    return {
      x: 300 + radius * Math.cos(angle),
      y: 200 + radius * Math.sin(angle),
    };
  };

  // Initialize nodes from tables with proper spacing
  const initialNodes: Node[] = tables.map((table, index) => ({
    id: table.id,
    type: 'tableNode',
    position: calculatePosition(index, tables.length),
    data: table,
    connectable: true,
    draggable: true, // Ensure nodes can be dragged
  }));

  // Filter joins to ensure they're valid (source and target exist in tables)
  const validJoins = joins.filter(
    (join) => tables.some((t) => t.id === join.sourceId) && tables.some((t) => t.id === join.targetId)
  );

  // Initialize edges from joins with proper styling
  const initialEdges: Edge[] = validJoins.map((join) => ({
    id: join.id,
    source: join.sourceId,
    target: join.targetId,
    type: 'joinEdge',
    animated: true,
    style: {stroke: '#888'},
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20,
    },
    data: {
      conditions: join.conditions,
      joinType: join.type,
      onEditClick: (edgeId: string) => {
        // Explicitly triggered by clicking edit button
        const selectedJoin = joins.find((j) => j.id === edgeId);
        if (selectedJoin) {
          setEditingJoin(selectedJoin);
          setIsEditorOpen(true);
        }
      },
    },
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>(initialEdges);

  const [formState, setFormState] = useState({
    leftTable: '',
    rightTable: '',
    joinType: 'inner' as Join['type'],
    conditions: [{leftColumn: '', operator: '=', rightColumn: ''}],
  });

  // Sync from tables to nodes
  useEffect(() => {
    if (!tables || tables.length === 0) return;

    // Preserve existing node positions when updating
    const existingNodePositions = Object.fromEntries(nodes.map((node) => [node.id, node.position]));

    // Track which table IDs are already in nodes
    const existingNodeIds = new Set(nodes.map((node) => node.id));

    // Find tables that need to be added as new nodes
    const newTables = tables.filter((table) => !existingNodeIds.has(table.id));

    let updatedNodes;

    if (newTables.length > 0) {
      // Create new nodes for tables that aren't in the diagram yet
      const newNodes = newTables.map((table) => {
        return {
          id: table.id,
          type: 'tableNode',
          position: calculatePosition(tables.indexOf(table), tables.length),
          data: table,
          connectable: true,
          draggable: true,
        };
      });

      // Update data for existing nodes, keeping their positions
      const existingUpdatedNodes = nodes
        .filter((node) => tables.some((table) => table.id === node.id))
        .map((node) => {
          const tableData = tables.find((t) => t.id === node.id);
          return {
            ...node,
            data: tableData,
          };
        });

      updatedNodes = [...existingUpdatedNodes, ...newNodes];
    } else {
      // Update data of existing nodes without changing positions
      updatedNodes = tables.map((table) => {
        const existingNode = nodes.find((n) => n.id === table.id);

        return {
          id: table.id,
          type: 'tableNode',
          position:
            existingNodePositions[table.id] || calculatePosition(tables.indexOf(table), tables.length),
          data: table,
          connectable: true,
          draggable: true,
        };
      });
    }

    // Set the updated nodes
    setNodes(updatedNodes);
  }, [tables, nodes.length, setNodes]);

  // Sync from joins to edges
  useEffect(() => {
    if (!joins.length) {
      setEdges([]);
      return;
    }

    // Make sure all nodes exist for these joins
    const nodeIds = new Set(nodes.map((node) => node.id));
    const validJoins = joins.filter((join) => nodeIds.has(join.sourceId) && nodeIds.has(join.targetId));

    const updatedEdges = validJoins.map((join) => ({
      id: join.id,
      source: join.sourceId,
      target: join.targetId,
      label: join.type.toUpperCase(),
      type: 'smoothstep',
      animated: true,
      style: {stroke: '#888'},
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
      },
      data: {
        conditions: join.conditions,
        joinType: join.type,
        onEditClick: (edgeId: string) => {
          // This is only triggered by clicking the edit button
          const selectedJoin = joins.find((j) => j.id === edgeId);
          if (selectedJoin) {
            setEditingJoin(selectedJoin);
            setIsEditorOpen(true);
          }
        },
      },
    }));

    setEdges(updatedEdges);
  }, [joins, setEdges, nodes]);

  // Update form state when an edge is selected
  useEffect(() => {
    if (selectedEdge) {
      const selectedJoin = joins.find((join) => join.id === selectedEdge);
      if (selectedJoin) {
        setFormState({
          leftTable: selectedJoin.sourceId,
          rightTable: selectedJoin.targetId,
          joinType: selectedJoin.type,
          conditions: selectedJoin.conditions.length
            ? [...selectedJoin.conditions]
            : [{leftColumn: '', operator: '=', rightColumn: ''}],
        });
        // Switch to form tab to edit the selected join
        setActiveTab('form');
      }
    }
  }, [selectedEdge, joins]);

  // Handle node position changes
  const onNodeDragStop: NodeDragHandler = useCallback(
    (event, node) => {
      // Persist node position changes
      setNodes((nds) => nds.map((n) => (n.id === node.id ? {...n, position: node.position} : n)));
    },
    [setNodes]
  );

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => {
      console.log('Connection params:', params);
      if (!params.source || !params.target) {
        console.warn('Missing source or target in connection params');
        return;
      }

      // Check if a connection already exists between these nodes (in either direction)
      const connectionExists = edges.some(
        (edge) =>
          (edge.source === params.source && edge.target === params.target) ||
          (edge.source === params.target && edge.target === params.source)
      );

      if (connectionExists) {
        toast({
          title: 'Connection exists',
          description: 'A connection already exists between these tables',
          variant: 'warning',
        });
        return;
      }

      // Find the tables
      const sourceTable = tables.find((t) => t.id === params.source);
      const targetTable = tables.find((t) => t.id === params.target);

      console.log('Source table:', sourceTable);
      console.log('Target table:', targetTable);

      if (!sourceTable || !targetTable) {
        toast({
          title: 'Error',
          description: 'Could not find source or target table',
          variant: 'destructive',
        });
        return;
      }

      // Make sure columns are properly loaded
      if (!sourceTable.columns.length || !targetTable.columns.length) {
        toast({
          title: 'Warning',
          description: 'One or both tables are missing column information. Creating default join.',
          variant: 'warning',
        });
      }

      // Default to first column if no id column exists
      const defaultLeftColumn =
        sourceTable.columns.find((c) => c.name.toLowerCase() === 'id')?.name ||
        sourceTable.columns.find((c) => c.name.toLowerCase().includes('id'))?.name ||
        sourceTable.columns[0]?.name ||
        'id';

      const defaultRightColumn =
        targetTable.columns.find((c) => c.name.toLowerCase() === 'id')?.name ||
        targetTable.columns.find((c) => c.name.toLowerCase().includes('id'))?.name ||
        targetTable.columns[0]?.name ||
        'id';

      // Create a new join when connection is made
      const newJoin: Join = {
        id: `join-${Date.now()}`,
        sourceId: params.source,
        targetId: params.target,
        type: 'inner',
        conditions: [
          {
            leftColumn: defaultLeftColumn,
            operator: '=',
            rightColumn: defaultRightColumn,
          },
        ],
      };

      toast({
        title: 'Join created',
        description: `Created join between ${sourceTable.name} and ${targetTable.name}`,
      });

      // Add the edge with proper styling
      const newEdge = {
        ...params,
        id: newJoin.id,
        type: 'joinEdge',
        animated: true,
        style: {stroke: '#666', strokeWidth: 2},
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        data: {
          conditions: newJoin.conditions,
          joinType: newJoin.type,
          onEditClick: (edgeId: string) => {
            // The edit button was clicked, so now we can open the editor
            const join = joins.find((j) => j.id === edgeId);
            if (join) {
              setEditingJoin(join);
              setIsEditorOpen(true);
            }
          },
        },
      };

      setEdges((eds) => addEdge(newEdge, eds));
      onJoinUpdate([...joins, newJoin]);
    },
    [setEdges, joins, onJoinUpdate, tables, edges]
  );

  // Handle selection change
  const onSelectionChange = useCallback(
    (params: OnSelectionChangeParams) => {
      if (params.edges && params.edges.length === 1) {
        const edgeId = params.edges[0].id;
        setSelectedEdge(edgeId);

        // Find the join but don't automatically open the editor
        const selectedJoin = joins.find((join) => join.id === edgeId);
        if (selectedJoin) {
          setEditingJoin(selectedJoin);
          // Don't auto-open the editor: setIsEditorOpen(true);
        }
      } else {
        setSelectedEdge(null);
      }
    },
    [joins]
  );

  // Handle edge removal
  const onEdgesDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      const updatedJoins = joins.filter((join) => !edgesToDelete.find((edge) => edge.id === join.id));
      onJoinUpdate(updatedJoins);
      setSelectedEdge(null);
    },
    [joins, onJoinUpdate]
  );

  // Form handlers
  const addJoinCondition = () => {
    setFormState((prev) => ({
      ...prev,
      conditions: [...prev.conditions, {leftColumn: '', operator: '=', rightColumn: ''}],
    }));
  };

  const removeJoinCondition = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  };

  const handleFormSubmit = () => {
    if (
      !formState.leftTable ||
      !formState.rightTable ||
      !formState.conditions[0].leftColumn ||
      !formState.conditions[0].rightColumn
    ) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Check if we're updating an existing join
    if (selectedEdge) {
      const updatedJoins = joins.map((join) =>
        join.id === selectedEdge
          ? {
              ...join,
              type: formState.joinType,
              conditions: formState.conditions,
            }
          : join
      );

      onJoinUpdate(updatedJoins);

      // Update the edge in the diagram
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === selectedEdge
            ? {
                ...edge,
                label: formState.joinType.toUpperCase(),
                data: {
                  joinType: formState.joinType,
                  conditions: formState.conditions,
                },
              }
            : edge
        )
      );

      toast({
        title: 'Success',
        description: 'Join updated successfully',
      });

      // Clear selection after update
      setSelectedEdge(null);
    } else {
      // Create a new join
      const newJoin: Join = {
        id: `join-${Date.now()}`,
        sourceId: formState.leftTable,
        targetId: formState.rightTable,
        type: formState.joinType,
        conditions: formState.conditions,
      };

      // Add new edge with proper styling
      const newEdge: Edge = {
        id: newJoin.id,
        source: newJoin.sourceId,
        target: newJoin.targetId,
        label: newJoin.type.toUpperCase(),
        type: 'smoothstep',
        animated: true,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        data: {
          conditions: newJoin.conditions,
          joinType: newJoin.type,
        },
      };

      setEdges((eds) => [...eds, newEdge]);
      onJoinUpdate([...joins, newJoin]);

      toast({
        title: 'Success',
        description: 'New join created successfully',
      });
    }

    // Reset form
    setFormState({
      leftTable: '',
      rightTable: '',
      joinType: 'inner',
      conditions: [{leftColumn: '', operator: '=', rightColumn: ''}],
    });
  };

  // Handle drop zone drag events
  const onDragEnter = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragCounter((prev) => prev + 1);
    setIsDraggingOver(true);
  }, []);

  const onDragLeave = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragCounter((prev) => prev - 1);
      if (dragCounter - 1 <= 0) {
        setIsDraggingOver(false);
        setDragCounter(0);
      }
    },
    [dragCounter]
  );

  // Drag and drop functionality
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDraggingOver(false);
      setDragCounter(0);

      if (!reactFlowWrapper.current || !reactFlowInstance) {
        toast({
          title: 'Error',
          description: 'Flow instance not initialized. Try refreshing the page.',
          variant: 'destructive',
        });
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const tableData = event.dataTransfer.getData('application/reactflow');

      if (!tableData) return;

      try {
        const table = JSON.parse(tableData) as Table;
        const existingNode = nodes.find((node) => node.id === table.id);
        if (existingNode) {
          const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
          });

          setNodes(nodes.map((node) => (node.id === table.id ? {...node, position} : node)));
          return;
        }

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const newNode: Node = {
          id: table.id,
          type: 'tableNode',
          position,
          data: table,
          connectable: true,
          draggable: true,
        };

        setNodes((nds) => [...nds, newNode]);
      } catch (error) {
        console.error('Error adding node:', error);
        toast({
          title: 'Error',
          description: 'Failed to add table to diagram',
          variant: 'destructive',
        });
      }
    },
    [reactFlowInstance, nodes, setNodes]
  );

  const autoLayout = useCallback(() => {
    if (!reactFlow) return;

    const centerX = 400;
    const centerY = 300;
    const radius = Math.max(150, nodes.length * 30);

    const updatedNodes = nodes.map((node, index) => {
      const angle = (index * 2 * Math.PI) / nodes.length;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      return {
        ...node,
        position: {x, y},
      };
    });

    setNodes(updatedNodes);

    setTimeout(() => {
      reactFlow.fitView({padding: 0.2});
    }, 50);
  }, [reactFlow, nodes, setNodes]);

  return (
    <Card className="p-4">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="diagram">Diagram Editor</TabsTrigger>
          <TabsTrigger value="form">Form Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <div className="space-y-6">
            {joins.length > 0 && (
              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="font-medium">Existing Joins</h3>
                <div className="space-y-4">
                  {joins.map((join) => {
                    const sourceTable = tables.find((t) => t.id === join.sourceId);
                    const targetTable = tables.find((t) => t.id === join.targetId);
                    const isSelected = join.id === selectedEdge;

                    if (!sourceTable || !targetTable) return null;

                    return (
                      <div
                        key={join.id}
                        className={`${
                          isSelected ? 'bg-primary/20' : 'bg-muted/50'
                        } rounded-lg p-4 space-y-2 cursor-pointer`}
                        onClick={() => setSelectedEdge(join.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{sourceTable.name}</span>
                            <span className="text-muted-foreground">{join.type.toUpperCase()} JOIN</span>
                            <span className="font-medium">{targetTable.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              const edgesToDelete = [{id: join.id}] as Edge[];
                              onEdgesDelete(edgesToDelete);
                            }}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-1">
                          {join.conditions.map((condition, idx) => (
                            <div
                              key={idx}
                              className="text-sm text-muted-foreground flex items-center gap-2"
                            >
                              <span>
                                {sourceTable.name}.{condition.leftColumn}
                              </span>
                              <span>{condition.operator}</span>
                              <span>
                                {targetTable.name}.{condition.rightColumn}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">{selectedEdge ? 'Edit Join' : 'Create New Join'}</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Select
                    value={formState.leftTable}
                    onValueChange={(value) => setFormState((prev) => ({...prev, leftTable: value}))}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select left table" />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.map((table) => (
                        <SelectItem
                          key={table.id}
                          value={table.id}
                        >
                          {table.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={formState.joinType}
                    onValueChange={(value: Join['type']) =>
                      setFormState((prev) => ({...prev, joinType: value}))
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select join type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inner">Inner Join</SelectItem>
                      <SelectItem value="left">Left Join</SelectItem>
                      <SelectItem value="right">Right Join</SelectItem>
                      <SelectItem value="full">Full Join</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={formState.rightTable}
                    onValueChange={(value) => setFormState((prev) => ({...prev, rightTable: value}))}
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select right table" />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.map((table) => (
                        <SelectItem
                          key={table.id}
                          value={table.id}
                        >
                          {table.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Join Conditions</h3>
                  {formState.conditions.map((condition, index) => {
                    const leftTable = tables.find((t) => t.id === formState.leftTable);
                    const rightTable = tables.find((t) => t.id === formState.rightTable);

                    return (
                      <div
                        key={index}
                        className="flex gap-4 items-center"
                      >
                        <Select
                          value={condition.leftColumn}
                          onValueChange={(value) =>
                            setFormState((prev) => ({
                              ...prev,
                              conditions: prev.conditions.map((c, i) =>
                                i === index ? {...c, leftColumn: value} : c
                              ),
                            }))
                          }
                          disabled={!formState.leftTable}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select left column" />
                          </SelectTrigger>
                          <SelectContent>
                            {leftTable?.columns.map((column) => (
                              <SelectItem
                                key={column.name}
                                value={column.name}
                              >
                                {column.name} ({column.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={condition.operator}
                          onValueChange={(value) =>
                            setFormState((prev) => ({
                              ...prev,
                              conditions: prev.conditions.map((c, i) =>
                                i === index ? {...c, operator: value} : c
                              ),
                            }))
                          }
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Operator" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="=">=</SelectItem>
                            <SelectItem value="!=">!=</SelectItem>
                            <SelectItem value=">">&gt;</SelectItem>
                            <SelectItem value=">=">&gt;=</SelectItem>
                            <SelectItem value="<">&lt;</SelectItem>
                            <SelectItem value="<=">&lt;=</SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={condition.rightColumn}
                          onValueChange={(value) =>
                            setFormState((prev) => ({
                              ...prev,
                              conditions: prev.conditions.map((c, i) =>
                                i === index ? {...c, rightColumn: value} : c
                              ),
                            }))
                          }
                          disabled={!formState.rightTable}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select right column" />
                          </SelectTrigger>
                          <SelectContent>
                            {rightTable?.columns.map((column) => (
                              <SelectItem
                                key={column.name}
                                value={column.name}
                              >
                                {column.name} ({column.type})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeJoinCondition(index)}
                          disabled={formState.conditions.length <= 1}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}

                  <Button
                    variant="outline"
                    onClick={addJoinCondition}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Condition
                  </Button>
                </div>

                <div className="flex gap-4">
                  {selectedEdge && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedEdge(null);
                        setFormState({
                          leftTable: '',
                          rightTable: '',
                          joinType: 'inner',
                          conditions: [{leftColumn: '', operator: '=', rightColumn: ''}],
                        });
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={handleFormSubmit}
                    disabled={
                      !formState.leftTable ||
                      !formState.rightTable ||
                      !formState.conditions[0].leftColumn ||
                      !formState.conditions[0].rightColumn
                    }
                    className="flex-1"
                  >
                    {selectedEdge ? 'Update Join' : 'Add Join'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="diagram"
          className="h-[600px]"
        >
          <div className="h-full flex flex-col">
            {/* Tables Panel */}
            <div className="border-b pb-3 mb-3">
              <h3 className="font-medium mb-2 text-sm">Available Tables</h3>
              <div className="flex flex-wrap gap-2">
                {tables.map((table) => (
                  <DraggableTableItem
                    key={table.id}
                    table={table}
                    onDrag={() => setActiveTab('diagram')}
                  />
                ))}
              </div>
            </div>

            {/* Flow Editor */}
            <div
              className={`flex-1 relative ${
                isDraggingOver ? 'bg-primary-foreground/20 border-2 border-dashed border-primary/50' : ''
              }`}
              ref={reactFlowWrapper}
              onDragEnter={onDragEnter}
              onDragLeave={onDragLeave}
              onDragOver={onDragOver}
              onDrop={onDrop}
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onInit={setReactFlowInstance}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onEdgesDelete={onEdgesDelete}
                onNodeDragStop={onNodeDragStop}
                onSelectionChange={onSelectionChange}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={{
                  type: 'joinEdge',
                  animated: true,
                  markerEnd: {
                    type: MarkerType.ArrowClosed,
                    width: 20,
                    height: 20,
                  },
                }}
                fitView
                fitViewOptions={{padding: 0.2}}
                connectionLineStyle={{stroke: '#2563eb', strokeWidth: 2}}
                connectionLineType={ConnectionLineType.SmoothStep}
                elevateEdgesOnSelect
                minZoom={0.2}
                maxZoom={2}
                defaultViewport={{x: 0, y: 0, zoom: 0.8}}
                connectionMode="strict"
                deleteKeyCode={['Backspace', 'Delete']}
                multiSelectionKeyCode={['Control', 'Meta']}
                selectionKeyCode={['Shift']}
                snapToGrid={true}
                snapGrid={[15, 15]}
              >
                <Background
                  color="#aaa"
                  gap={16}
                />
                <Controls />
                <Panel position="top-right">
                  <div className="flex space-x-2">
                    <Button
                      onClick={autoLayout}
                      size="sm"
                      variant="outline"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Auto Layout
                    </Button>
                  </div>
                </Panel>

                {/*<Panel position="top-left" className="bg-background/90 p-3 rounded-md border shadow-sm">*/}
                {/*  <div className="text-xs font-medium mb-2">How to connect tables:</div>*/}
                {/*  <ol className="text-xs list-decimal pl-4 space-y-1">*/}
                {/*    <li>Click and drag from a <span className="text-primary font-medium">connection handle</span> (the circle on either side of a table)</li>*/}
                {/*    <li>Drop on another table's handle to create a join</li>*/}
                {/*    <li>Click on connection lines to edit join properties</li>*/}
                {/*  </ol>*/}
                {/*</Panel>*/}

                {editingJoin && (
                  <InlineJoinEditor
                    open={isEditorOpen}
                    onClose={() => {
                      setIsEditorOpen(false);
                      setEditingJoin(null);
                    }}
                    join={editingJoin}
                    sourceTable={tables.find((t) => t.id === editingJoin.sourceId) || null}
                    targetTable={tables.find((t) => t.id === editingJoin.targetId) || null}
                    onSave={(updatedJoin) => {
                      // Update the join in the joins array
                      const updatedJoins = joins.map((join) =>
                        join.id === updatedJoin.id ? updatedJoin : join
                      );

                      // Update the edge in the diagram
                      setEdges((eds) =>
                        eds.map((edge) =>
                          edge.id === updatedJoin.id
                            ? {
                                ...edge,
                                data: {
                                  joinType: updatedJoin.type,
                                  conditions: updatedJoin.conditions,
                                },
                              }
                            : edge
                        )
                      );

                      // Update the joins via callback
                      onJoinUpdate(updatedJoins);

                      toast({
                        title: 'Success',
                        description: 'Join updated successfully',
                      });
                    }}
                  />
                )}

                {/* Empty state message */}
                {nodes.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-white/90 dark:bg-gray-800/90 p-6 rounded-lg text-center w-full">
                      <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No tables in diagram</h3>
                      <p className="text-muted-foreground">
                        Drag tables from the list above to add them to your diagram, or create joins using the
                        form editor.
                      </p>
                    </div>
                  </div>
                )}

                {/* Helper message for joining */}
                {nodes.length > 0 && nodes.length < 3 && (
                  <div className="absolute bottom-4 right-4 pointer-events-none">
                    <div className="bg-white/90 dark:bg-gray-800/90 p-4 rounded-lg text-center max-w-md shadow-lg border border-primary/20">
                      <h3 className="text-sm font-medium mb-1">How to join tables:</h3>
                      <p className="text-xs text-muted-foreground">
                        1. Add at least two tables to the diagram
                        <br />
                        2. Connect tables by clicking and dragging from the colored handles on the sides of
                        each table
                        <br />
                        3. Click on a connection line to edit join conditions
                      </p>
                    </div>
                  </div>
                )}
              </ReactFlow>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

// Export the wrapped component with ReactFlowProvider
export function VisualJoinEditor(props: VisualJoinEditorProps) {
  return (
    <ReactFlowProvider>
      <VisualJoinEditorContent {...props} />
    </ReactFlowProvider>
  );
}
