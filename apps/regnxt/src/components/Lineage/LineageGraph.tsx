import React, {useCallback, useEffect, useMemo} from 'react';

import {
  Background,
  Controls,
  Edge,
  MarkerType,
  Node,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import dagre from 'dagre';

import '@xyflow/react/dist/style.css';

import {LineageConnection, LineageDirection} from '@/types/databaseTypes';

import DatasetNodeComponent from './DatasetNode';

export interface LineageGraphProps {
  lineageData: LineageConnection[];
  direction: LineageDirection;
  onEdgeClick: (ruleId: string) => void;
  selectedTransformationId: string | null;
}

const nodeTypes = {
  datasetNode: DatasetNodeComponent,
};
const NODE_WIDTH = 180;
const NODE_HEIGHT = 100;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction: LineageDirection) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: 'LR',
    nodesep: 80,
    ranksep: 200,
    marginx: 50,
    marginy: 50,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, {width: NODE_WIDTH, height: NODE_HEIGHT});
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const dagreNode = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: dagreNode.x - NODE_WIDTH / 2,
        y: dagreNode.y - NODE_HEIGHT / 2,
      },
    };
  });

  return {nodes: layoutedNodes, edges};
};

const LineageGraphContent: React.FC<LineageGraphProps> = ({
  lineageData,
  direction,
  onEdgeClick,
  selectedTransformationId,
}) => {
  const {fitView} = useReactFlow();

  const datasets = useMemo(() => {
    const uniqueDatasets = new Set<string>();
    lineageData.forEach((connection) => {
      uniqueDatasets.add(connection.source_dataset);
      uniqueDatasets.add(connection.destination_dataset);
    });
    return Array.from(uniqueDatasets);
  }, [lineageData]);

  const initialNodes = useMemo(() => {
    const sourceDatasets = new Set(lineageData.map((c) => c.source_dataset));
    const destinationDatasets = new Set(lineageData.map((c) => c.destination_dataset));

    return datasets.map((dataset) => {
      let nodeType = 'unknown';
      if (sourceDatasets.has(dataset) && !destinationDatasets.has(dataset)) {
        nodeType = 'source';
      } else if (!sourceDatasets.has(dataset) && destinationDatasets.has(dataset)) {
        nodeType = 'destination';
      } else {
        nodeType = 'intermediate';
      }

      return {
        id: dataset,
        type: 'datasetNode',
        data: {
          label: dataset,
          type: nodeType,
        },
        position: {x: 0, y: 0},
      };
    });
  }, [datasets, lineageData]);

  const initialEdges: Edge<any>[] = useMemo(() => {
    return lineageData.map((connection) => {
      const isSelected = connection.logical_transformation_rule_id === selectedTransformationId;
      const edgeId = `${connection.source_dataset}-${connection.destination_dataset}-${connection.logical_transformation_rule_id}`;

      return {
        id: edgeId,
        source: connection.source_dataset,
        target: connection.destination_dataset,
        data: {
          transformationId: connection.logical_transformation_rule_id,
        },
        animated: false,
        type: 'default',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 15,
          height: 15,
          color: isSelected ? '#0091ff' : '#64748b',
        },
        style: {
          strokeWidth: isSelected ? 3 : 1.5,
          stroke: isSelected ? '#0091ff' : '#64748b',
          cursor: 'pointer',
        },
        label: connection.logical_transformation_rule_id.substring(0, 8) + '...',
        labelBgPadding: [4, 2],
        labelBgBorderRadius: 4,
        labelStyle: {fontSize: 10},
        labelBgStyle: {fill: '#f8fafc', fillOpacity: 0.8},
      };
    });
  }, [lineageData, selectedTransformationId]);

  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);

  useEffect(() => {
    if (initialNodes.length > 0) {
      const {nodes: newNodes, edges: newEdges} = getLayoutedElements(initialNodes, initialEdges, direction);
      setNodes(newNodes);
      setEdges(newEdges);

      setTimeout(() => {
        fitView({padding: 0.2});
      }, 50);
    }
  }, [initialNodes, initialEdges, direction, setNodes, setEdges, fitView]);

  const handleEdgeClick = useCallback(
    (evt: React.MouseEvent, edge: Edge) => {
      evt.preventDefault();
      evt.stopPropagation();

      const transformationId = edge.data?.transformationId;
      if (transformationId) {
        document.body.style.cursor = 'wait';
        onEdgeClick(transformationId as string);
        setTimeout(() => {
          document.body.style.cursor = 'default';
        }, 150);
      }
    },
    [onEdgeClick]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onEdgeClick={handleEdgeClick}
      nodeTypes={nodeTypes}
      fitView
      minZoom={0.1}
      attributionPosition="bottom-right"
      className="bg-muted/20"
    >
      <Background />
      <Controls showInteractive={false} />
    </ReactFlow>
  );
};

const LineageGraph: React.FC<LineageGraphProps> = (props) => {
  return (
    <ReactFlowProvider>
      <div className="w-full h-full">
        <LineageGraphContent {...props} />
      </div>
    </ReactFlowProvider>
  );
};

export default LineageGraph;
