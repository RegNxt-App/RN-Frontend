import React, {useCallback} from 'react';

import {
  Background,
  Connection,
  Controls,
  Edge,
  Node,
  NodeProps,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

import {NodeData} from '@/types/databaseTypes';

import {CustomNode} from './CustomNode';
import {TasksList} from './TasksList';

type CustomNodeType = Node<NodeData>;

export const WorkflowEditor: React.FC<{className?: string}> = ({className}) => {
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

  const handleDragStart = (event: React.DragEvent, nodeData: any) => {
    event.dataTransfer.setData('application/json', JSON.stringify(nodeData));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={className}>
      <div className="flex h-[600px] gap-4">
        <div className="w-64 overflow-y-auto">
          <h3 className="font-semibold mb-4">Available Tasks</h3>
          <TasksList onDragStart={handleDragStart} />
        </div>
        <div className="flex-1 border rounded-lg">
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
      </div>
    </div>
  );
};
