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

function ArchitectureNode({ data }: NodeProps<Node<ArchitectureNodeData>>) {
  const categoryLabel = {
    ui: "UI Component",
    state: "Hooks & State",
    api: "API Route",
    utility: "Utility",
  }[data.category];

  return (
    <div
      className="min-w-48 rounded-xl border bg-slate-950/95 px-4 py-3 shadow-[0_0_24px_var(--node-glow)]"
      style={{
        borderColor: `${data.color}88`,
        "--node-glow": `${data.color}24`,
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
};

export default function GraphCanvas({ nodes, edges }: GraphCanvasProps) {
  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(nodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(edges);

  useEffect(() => {
    setFlowNodes(nodes);
    setFlowEdges(edges);
  }, [edges, nodes, setFlowEdges, setFlowNodes]);

  return (
    <div className="absolute inset-0">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
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