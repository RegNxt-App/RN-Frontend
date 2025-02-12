import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {useWorkflow} from '@/contexts/WorkflowContext';
import {toast} from '@/hooks/use-toast';
import {
  Background,
  Connection,
  Controls,
  Edge,
  MarkerType,
  Node,
  ReactFlow,
  addEdge,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import dagre from 'dagre';
import {Loader2, Save} from 'lucide-react';
import useSWR from 'swr';

import {Button} from '@rn/ui/components/ui/button';

import CustomEdge from '../CustomEdge';
import {CustomNode} from './CustomNode';

import '../../css/workflow.css';

import {useBackend} from '@/contexts/BackendContext';
import {AxiosError} from 'axios';

interface NodeData extends Record<string, unknown> {
  label: string;
  type: number;
  language: string | null;
  task_code: string | null;
  task_id: number;
  upstreamTasks: number[] | null;
}

interface WorkflowComponent {
  task_id: number;
  task_code: string | null;
  task_type_id: number;
  label: string;
  task_language: string | null;
  upstream_tasks: number | null;
}

interface FlowCanvasProps {
  className?: string;
  workflow: any;
  onSave?: (tasks: any[]) => Promise<void>;
}

export const FlowCanvas: React.FC<FlowCanvasProps> = ({className, workflow: workflowProp, onSave}) => {
  const {backendInstance} = useBackend();

  const {workflow: workflowContext} = useWorkflow();
  const currentWorkflow = workflowProp || workflowContext;
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<NodeData>>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropZoneActive, setIsDropZoneActive] = useState(false);

  const WORKFLOW_COMPONENTS_ENDPOINT = (workflowId: number) => `/api/v1/workflows/${workflowId}/components/`;

  const {
    data: components,
    error,
    mutate: mutateComponents,
  } = useSWR<WorkflowComponent[]>(
    workflowContext?.workflow_id ? WORKFLOW_COMPONENTS_ENDPOINT(workflowContext.workflow_id) : null,
    (url: string) => backendInstance.get(url).then((r) => r.data)
  );

  const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({rankdir: direction, ranksep: 100, nodesep: 100});

    const nodeWidth = 200;
    const nodeHeight = 100;

    nodes.forEach((node) => {
      dagreGraph.setNode(node.id, {width: nodeWidth, height: nodeHeight});
    });

    edges.forEach((edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    return nodes.map((node) => {
      const dagreNode = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: dagreNode.x - nodeWidth / 2,
          y: dagreNode.y - nodeHeight / 2,
        },
        data: node.data as NodeData,
      };
    });
  };
  useMemo(() => {
    if (!components) return;

    const newNodes: Node<NodeData>[] = components.map((comp) => ({
      id: comp.task_id.toString(),
      type: 'custom',
      position: {x: 0, y: 0},
      data: {
        label: comp.label,
        type: comp.task_type_id,
        language: comp.task_language,
        task_code: comp.task_code,
        task_id: comp.task_id,
        upstreamTasks: comp.upstream_tasks ? [comp.upstream_tasks] : null,
      },
    }));

    const newEdges: Edge[] = components
      .filter((comp): comp is WorkflowComponent & {upstream_tasks: number} => comp.upstream_tasks !== null)
      .map((comp) => ({
        id: `edge-${comp.upstream_tasks}-${comp.task_id}`,
        source: comp.upstream_tasks.toString(),
        target: comp.task_id.toString(),
      }));

    const layoutedNodes = getLayoutedElements(newNodes, newEdges);

    setNodes(layoutedNodes);
    setEdges(newEdges);
  }, [components]);

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      const edgeSet = new Set(edges.map((edge) => `${edge.source}-${edge.target}`));
      const newEdgeKey = `${params.source}-${params.target}`;

      if (edgeSet.has(newEdgeKey)) {
        toast({
          title: 'Error',
          description: 'Connection already exists',
          variant: 'destructive',
        });
        return;
      }

      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges, edges]
  );

  const handleSave = async () => {
    if (!onSave && !currentWorkflow?.workflow_id) return;
    setIsSaving(true);

    try {
      const tasks = nodes.map((node) => ({
        task_id: node.data.task_id,
        upstream_tasks: edges
          .filter((edge) => edge.target === node.id)
          .map((edge) => nodes.find((n) => n.id === edge.source)?.data.task_id || null)
          .filter(Boolean),
      }));

      if (onSave) {
        await onSave(tasks);
      } else {
        await backendInstance.put(`/api/v1/workflows/${currentWorkflow.workflow_id}/dag/`, {tasks});
        await mutateComponents();
        toast({title: 'Success', description: 'Workflow saved successfully'});
      }
    } catch (error) {
      const errorMessage =
        error instanceof AxiosError
          ? error.response?.data?.error || 'Failed to save workflow'
          : 'An unknown error occurred';
      toast({title: 'Error', description: errorMessage, variant: 'destructive'});
    } finally {
      setIsSaving(false);
    }
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDropZoneActive(true);
  }, []);
  const onDragLeave = useCallback(() => {
    setIsDropZoneActive(false);
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
        id: taskData.task_id.toString(),
        type: 'custom',
        position,
        data: {
          label: taskData.label,
          type: taskData.task_type_id,
          language: taskData.task_language,
          task_code: taskData.task_code,
          task_id: taskData.task_id,
          upstreamTasks: [],
        },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [nodes]
  );
  const edgeTypes = useMemo(
    () => ({
      custom: CustomEdge,
    }),
    []
  );

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'custom',
      style: {stroke: '#6419e6'},
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: '#6419e6',
      },
      animated: true,
    }),
    []
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-end mb-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2 mx-6"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>
      <div
        className={`
          flex-1 border rounded-lg h-[500px] 
          ${className}
          ${isDropZoneActive ? 'border-blue-500 border-2 bg-blue-50/50' : ''}
          relative
        `}
      >
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
            <div className="text-center">
              <div className="text-2xl mb-2">📦</div>
              <div>Drag and drop tasks here to build your workflow</div>
            </div>
          </div>
        )}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onDropCapture={() => setIsDropZoneActive(false)}
          nodeTypes={{custom: CustomNode}}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};
