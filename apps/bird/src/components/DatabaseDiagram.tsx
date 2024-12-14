import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Connection,
  ConnectionLineType,
  Controls,
  Node,
  Panel,
  ReactFlow,
  Edge as ReactFlowEdge,
  Node as ReactFlowNode,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import React, { useCallback, useState } from "react";
import ColumnSelectionModal from "./ColumnSelectionModal";
import CustomEdge from "./CustomEdge";
import DatabaseTableNode from "./DatabaseTableNode";

type CustomNode = ReactFlowNode<Record<string, unknown>>;
type CustomEdge = ReactFlowEdge<any>;

interface DatabaseDiagramProps {
  nodes: CustomNode[];
  edges: CustomEdge[];
  loading: boolean;
  onReset: () => void;
  selectedDatasetVersions: any[];
  onSelectionChange: (selectedVersions: any[]) => void;
  setNodes: React.Dispatch<React.SetStateAction<CustomNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<CustomEdge[]>>;
  getLayoutedElements: (
    nodes: CustomNode[],
    edges: CustomEdge[]
  ) => Promise<{ nodes: CustomNode[]; edges: CustomEdge[] }>;
  onNodeInfoLog: (node: CustomNode) => void;
}

const nodeTypes = {
  databaseTable: DatabaseTableNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

export default function DatabaseDiagram({
  nodes,
  edges,
  loading,
  setNodes,
  onReset,
  setEdges,
  getLayoutedElements,
  onNodeInfoLog,
}: DatabaseDiagramProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(
    null
  );

  const onConnect = useCallback((params: Connection) => {
    setPendingConnection(params);
    setIsModalOpen(true);
  }, []);
  // const onConnect = useCallback(
  //   (params: Connection) =>
  //     setEdges((eds) =>
  //       addEdge({ ...params, type: "custom", animated: true }, eds)
  //     ),
  //   [setEdges]
  // );

  const handleColumnSelection = useCallback(
    (
      sourceColumn: string,
      targetColumn: string,
      sourceCardinality: string,
      targetCardinality: string
    ) => {
      if (pendingConnection) {
        const sourceNode = nodes.find((n) => n.id === pendingConnection.source);
        const targetNode = nodes.find((n) => n.id === pendingConnection.target);

        if (sourceNode && targetNode) {
          const newEdge = {
            ...pendingConnection,
            type: "custom",
            animated: true,
            data: {
              label: `${sourceColumn} -> ${targetColumn}`,
              sourceCardinality,
              targetCardinality,
            },
          };
          setEdges((eds) => addEdge(newEdge, eds));
        }
      }
      setIsModalOpen(false);
      setPendingConnection(null);
    },
    [pendingConnection, setEdges, nodes]
  );
  const onLayout = useCallback(async () => {
    const { nodes: layoutedNodes, edges: layoutedEdges } =
      await getLayoutedElements(nodes, edges);
    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [nodes, edges, setNodes, setEdges, getLayoutedElements]);

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // Only log table information
      onNodeInfoLog(node as any);
    },
    [onNodeInfoLog]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[800px]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "800px" }}>
      <ReactFlow
        nodes={nodes as any}
        edges={edges}
        onNodesChange={(changes) =>
          setNodes((nds: any) => applyNodeChanges(changes, nds) as any)
        }
        onEdgesChange={(changes) =>
          setEdges((eds) => applyEdgeChanges(changes, eds) as CustomEdge[])
        }
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <Panel position="top-right" className="flex gap-2">
          <button
            onClick={onLayout}
            className="px-4 py-2 font-semibold text-sm bg-primary text-white rounded-lg shadow-sm"
          >
            Layout
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 font-semibold text-sm bg-red-500 text-white rounded-lg shadow-sm"
          >
            Reset
          </button>
        </Panel>
        {isModalOpen && pendingConnection && (
          <ColumnSelectionModal
            sourceNode={
              nodes.find((n) => n.id === pendingConnection.source) as any
            }
            targetNode={
              nodes.find((n) => n.id === pendingConnection.target) as any
            }
            onClose={() => setIsModalOpen(false)}
            onSelect={handleColumnSelection}
          />
        )}
      </ReactFlow>
    </div>
  );
}
