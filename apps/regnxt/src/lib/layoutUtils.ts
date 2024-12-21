// Create a separate file: layoutUtils.ts
import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

export const getLayoutedElements = async (nodes: any[], edges: any[]) => {
  const elkNodes = nodes.map((node) => ({
    id: node.id,
    width: node.width,
    height: node.height,
  }));

  const elkEdges = edges.map((edge: any) => ({
    id: edge.id,
    sources: [edge.source],
    targets: [edge.target],
  }));

  const elkGraph = await elk.layout({
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'RIGHT',
      'elk.spacing.nodeNode': '50',
      'elk.layered.spacing.nodeNodeBetweenLayers': '100',
      'elk.padding': '[top=50,left=50,bottom=50,right=50]',
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
    },
    children: elkNodes,
    edges: elkEdges,
  });

  return {
    nodes: nodes.map((node) => {
      const elkNode = elkGraph.children?.find((n) => n.id === node.id);
      return {
        ...node,
        position: {x: elkNode?.x || 0, y: elkNode?.y || 0},
      };
    }),
    edges,
  };
};

export const calculateNodeDimensions = (columns: any[]) => {
  const baseHeight = 40;
  const rowHeight = 24;
  const width = 250;
  const height = baseHeight + columns.length * rowHeight;
  return {width, height};
};
