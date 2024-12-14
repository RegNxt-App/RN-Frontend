import { EdgeProps, getBezierPath } from "@xyflow/react";
import React from "react";

const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  markerEnd,
}) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const cardinalityLabel = `${data?.sourceCardinality || ""} : ${
    data?.targetCardinality || ""
  }`;

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <text>
        <textPath
          href={`#${id}`}
          style={{ fontSize: 12 }}
          startOffset="50%"
          textAnchor="middle"
        >
          {data?.label as any}
        </textPath>
      </text>
      <text>
        <textPath
          href={`#${id}`}
          style={{ fontSize: 10, fill: "blue" }}
          startOffset="75%"
          textAnchor="middle"
        >
          {cardinalityLabel}
        </textPath>
      </text>
    </>
  );
};

export default CustomEdge;
