import React, {useCallback} from 'react';

import {CustomNode} from '@/components/workflows/CustomNode';
import {NodeData} from '@/types/databaseTypes';
import {
  Background,
  Connection,
  Controls,
  Edge,
  Node,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';

interface FlowCanvasProps {
  className?: string;
}

export const FlowCanvas: React.FC<FlowCanvasProps> = ({className}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const taskData = JSON.parse(event.dataTransfer.getData('application/json'));
      const position = {
        x: event.clientX - event.currentTarget.getBoundingClientRect().left,
        y: event.clientY - event.currentTarget.getBoundingClientRect().top,
      };

      const newNode: Node<NodeData> = {
        id: Date.now().toString(),
        type: 'custom',
        position,
        data: {
          label: taskData.label,
          type: taskData.task_type_id,
          language: taskData.task_language,
        },
      };

      setNodes((nds: Node<NodeData>[]) => [...nds, newNode]);
    },
    [setNodes]
  );

  return (
    <div className={`flex-1 border rounded-lg ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={{custom: CustomNode}}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};
