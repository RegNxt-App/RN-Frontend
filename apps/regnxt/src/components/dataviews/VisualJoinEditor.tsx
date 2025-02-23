'use client';

import {useCallback, useEffect, useState} from 'react';

import {
  Background,
  Connection,
  ConnectionMode,
  Controls,
  Edge,
  MarkerType,
  Node,
  Position,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import {Button} from '@/components/ui/button';
import {Card} from '@/components/ui/card';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Plus, X} from 'lucide-react';

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

// Custom node component for tables
function TableNode({data}: {data: Table}) {
  return (
    <div className="px-4 py-2 shadow-lg rounded-md bg-background border min-w-[200px]">
      <div className="font-bold border-b pb-2 text-lg">{data.name}</div>
      <div className="mt-2">
        {data.columns.map((column) => (
          <div
            key={column.name}
            className="flex justify-between py-1 text-sm"
          >
            <span>{column.name}</span>
            <span className="text-muted-foreground ml-4">{column.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const nodeTypes = {
  tableNode: TableNode,
};

export function VisualJoinEditor({tables, joins, onJoinUpdate}: VisualJoinEditorProps) {
  // Initialize nodes from tables with proper spacing
  const initialNodes: Node[] = tables.map((table, index) => ({
    id: table.id,
    type: 'tableNode',
    position: {x: 250 * index, y: 100},
    data: table,
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
  }));

  // Initialize edges from joins with proper styling
  const initialEdges: Edge[] = joins.map((join) => ({
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
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [formState, setFormState] = useState({
    leftTable: '',
    rightTable: '',
    joinType: 'inner' as Join['type'],
    conditions: [{leftColumn: '', operator: '=', rightColumn: ''}],
  });

  useEffect(() => {
    setNodes(
      tables.map((table, index) => ({
        id: table.id,
        type: 'tableNode',
        position: {x: 250 * index, y: 100},
        data: table,
        sourcePosition: Position.Right,
        targetPosition: Position.Left,
      }))
    );
  }, [tables, setNodes]);

  useEffect(() => {
    setEdges(
      joins.map((join) => ({
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
      }))
    );
  }, [joins, setEdges]);

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => {
      // Create a new join when connection is made
      const newJoin: Join = {
        id: `join-${Date.now()}`,
        sourceId: params.source || '',
        targetId: params.target || '',
        type: 'inner',
        conditions: [
          {
            leftColumn: 'id', // Default to id column
            operator: '=',
            rightColumn: 'id',
          },
        ],
      };

      // Add the edge with proper styling
      const newEdge = {
        ...params,
        id: newJoin.id,
        type: 'smoothstep',
        animated: true,
        label: 'INNER JOIN',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
      };

      setEdges((eds) => addEdge(newEdge, eds));
      onJoinUpdate([...joins, newJoin]);
    },
    [setEdges, joins, onJoinUpdate]
  );

  // Handle edge updates (e.g., when join type changes)
  const updateJoinType = (joinId: string, type: Join['type']) => {
    const updatedJoins = joins.map((join) => (join.id === joinId ? {...join, type} : join));
    onJoinUpdate(updatedJoins);

    setEdges((eds) => eds.map((edge) => (edge.id === joinId ? {...edge, label: type.toUpperCase()} : edge)));
  };

  // Handle edge removal
  const onEdgesDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      const updatedJoins = joins.filter((join) => !edgesToDelete.find((edge) => edge.id === join.id));
      onJoinUpdate(updatedJoins);
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
    };

    setEdges((eds) => [...eds, newEdge]);
    onJoinUpdate([...joins, newJoin]);

    // Reset form
    setFormState({
      leftTable: '',
      rightTable: '',
      joinType: 'inner',
      conditions: [{leftColumn: '', operator: '=', rightColumn: ''}],
    });
  };

  return (
    <Card className="p-4">
      <Tabs
        defaultValue="form"
        className="w-full"
      >
        <TabsList className="mb-4">
          <TabsTrigger
            disabled
            value="diagram"
          >
            Diagram Editor
          </TabsTrigger>
          <TabsTrigger value="form">Form Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <div className="space-y-6">
            {/* Existing Joins */}
            {joins.length > 0 && (
              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="font-medium">Existing Joins</h3>
                <div className="space-y-4">
                  {joins.map((join) => {
                    const sourceTable = tables.find((t) => t.id === join.sourceId);
                    const targetTable = tables.find((t) => t.id === join.targetId);

                    return (
                      <div
                        key={join.id}
                        className="bg-muted/50 rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{sourceTable?.name}</span>
                            <span className="text-muted-foreground">{join.type.toUpperCase()} JOIN</span>
                            <span className="font-medium">{targetTable?.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdgesDelete([{id: join.id}])}
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
                                {sourceTable?.name}.{condition.leftColumn}
                              </span>
                              <span>{condition.operator}</span>
                              <span>
                                {targetTable?.name}.{condition.rightColumn}
                              </span>
                            </div>
                          ))}
                        </div>

                        <Select
                          value={join.type}
                          onValueChange={(value: Join['type']) => updateJoinType(join.id, value)}
                        >
                          <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Join type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inner">Inner Join</SelectItem>
                            <SelectItem value="left">Left Join</SelectItem>
                            <SelectItem value="right">Right Join</SelectItem>
                            <SelectItem value="full">Full Join</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Create New Join Form */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Create New Join</h3>
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
                  {formState.conditions.map((condition, index) => (
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
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select left column" />
                        </SelectTrigger>
                        <SelectContent>
                          {tables
                            .find((t) => t.id === formState.leftTable)
                            ?.columns.map((column) => (
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
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select right column" />
                        </SelectTrigger>
                        <SelectContent>
                          {tables
                            .find((t) => t.id === formState.rightTable)
                            ?.columns.map((column) => (
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
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addJoinCondition}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Condition
                  </Button>
                </div>

                <Button
                  onClick={handleFormSubmit}
                  disabled={
                    !formState.leftTable ||
                    !formState.rightTable ||
                    !formState.conditions[0].leftColumn ||
                    !formState.conditions[0].rightColumn
                  }
                  className="w-full"
                >
                  Add Join
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="diagram"
          className="h-[600px]"
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onEdgesDelete={onEdgesDelete}
            nodeTypes={nodeTypes}
            connectionMode={ConnectionMode.Loose}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 20,
                height: 20,
              },
            }}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
