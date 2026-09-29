"use client";

import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { useEffect, type CSSProperties } from "react";
import type { ArchitectureNodeData } from "@/lib/architecture";
import { layoutGraph, type LayoutMode } from "@/lib/layoutGraph";

function ArchitectureNode({ data, selected }: NodeProps<Node<ArchitectureNodeData>>) {
  const categoryLabel = {
    ui: "UI Component",
    state: "Hooks & State",
    api: "API Route",
    utility: "Utility",
  }[data.category];

  return (
    <div
      className={`min-w-48 rounded-xl border bg-slate-950/95 px-4 py-3 transition-shadow ${selected ? "ring-1 ring-cyan-300" : ""}`}
      style={{
        borderColor: selected ? "#22d3ee" : `${data.color}88`,
        boxShadow: selected ? "0 0 32px rgba(34, 211, 238, 0.5)" : `0 0 24px ${data.color}24`,
      } as CSSProperties}
    >
      <Handle type="target" position={Position.Left} className="!border-0 !bg-cyan-200" />
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: data.color }}>
        {categoryLabel}
      </div>
      <div className="max-w-56 truncate text-sm font-semibold text-slate-100">{data.label}</div>
      <div className="mt-1 max-w-56 truncate font-mono text-[10px] text-slate-400">{data.filePath}</div>
      <Handle type="source" position={Position.Right} className="!border-0 !bg-cyan-200" />
    </div>
  );
}

const nodeTypes = { architecture: ArchitectureNode };

type GraphCanvasProps = {
  nodes: Node<ArchitectureNodeData>[];
  edges: Edge[];
  selectedNodeId: string | null;
  layoutMode: LayoutMode;
  onNodeSelect: (nodeId: string | null) => void;
};

export default function GraphCanvas({ nodes, edges, selectedNodeId, layoutMode, onNodeSelect }: GraphCanvasProps) {
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

  useEffect(() => {
    setFlowNodes(layoutGraph(nodes, edges, layoutMode));
    setFlowEdges(edges);
  }, [edges, layoutMode, nodes, setFlowEdges, setFlowNodes]);

  const connectedNodeIds = new Set(
    edges
      .filter((edge) => edge.source === selectedNodeId || edge.target === selectedNodeId)
      .flatMap((edge) => [edge.source, edge.target]),
  );
  const displayNodes = flowNodes.map((node) => ({
    ...node,
    selected: node.id === selectedNodeId,
    style: {
      ...node.style,
      opacity: selectedNodeId && node.id !== selectedNodeId && !connectedNodeIds.has(node.id) ? 0.24 : 1,
    },
  }));
  const displayEdges = flowEdges.map((edge) => {
    const isConnected = edge.source === selectedNodeId || edge.target === selectedNodeId;
    return {
      ...edge,
      style: {
        ...edge.style,
        stroke: selectedNodeId && isConnected ? "#22d3ee" : "#67e8f9",
        strokeWidth: selectedNodeId && isConnected ? 3 : 2,
        opacity: selectedNodeId && !isConnected ? 0.12 : 0.9,
      },
    };
  });

  return (
    <div className="absolute inset-0">
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => onNodeSelect(node.id)}
        onPaneClick={() => onNodeSelect(null)}
        fitView
        minZoom={0.15}
        maxZoom={1.8}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1} color="#334155" />
        <Controls position="bottom-left" />
      </ReactFlow>
    </div>
  );
}