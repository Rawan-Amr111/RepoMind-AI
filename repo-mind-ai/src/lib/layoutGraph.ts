import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import type { Edge, Node } from "@xyflow/react";
import type { ArchitectureNodeData } from "./architecture";

export type LayoutMode = "force" | "dag" | "radial";

type LayoutNode = Node<ArchitectureNodeData> & SimulationNodeDatum;

function radialLayout(nodes: Node<ArchitectureNodeData>[]) {
  const radius = Math.max(220, nodes.length * 45);

  return nodes.map((node, index) => {
    const angle = (2 * Math.PI * index) / Math.max(nodes.length, 1);
    return {
      ...node,
      position: {
        x: 450 + Math.cos(angle) * radius,
        y: 340 + Math.sin(angle) * radius,
      },
    };
  });
}

function dagLayout(nodes: Node<ArchitectureNodeData>[], edges: Edge[]) {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const depth = new Map(nodes.map((node) => [node.id, 0]));
  const incoming = new Map(nodes.map((node) => [node.id, 0]));
  const outgoing = new Map(nodes.map((node) => [node.id, [] as string[]]));

  for (const edge of edges) {
    if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) continue;
    incoming.set(edge.target, (incoming.get(edge.target) ?? 0) + 1);
    outgoing.get(edge.source)?.push(edge.target);
  }

  const queue = nodes.filter((node) => incoming.get(node.id) === 0).map((node) => node.id);
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const source = queue[cursor];
    for (const target of outgoing.get(source) ?? []) {
      depth.set(target, Math.max(depth.get(target) ?? 0, (depth.get(source) ?? 0) + 1));
      incoming.set(target, (incoming.get(target) ?? 1) - 1);
      if (incoming.get(target) === 0) queue.push(target);
    }
  }

  const byDepth = new Map<number, Node<ArchitectureNodeData>[]>();
  for (const node of nodes) {
    const column = depth.get(node.id) ?? 0;
    const columnNodes = byDepth.get(column) ?? [];
    columnNodes.push(node);
    byDepth.set(column, columnNodes);
  }

  return nodes.map((node) => {
    const column = depth.get(node.id) ?? 0;
    const row = byDepth.get(column)?.indexOf(node) ?? 0;
    return { ...node, position: { x: 110 + column * 320, y: 100 + row * 180 } };
  });
}

function forceLayout(nodes: Node<ArchitectureNodeData>[], edges: Edge[]) {
  const simulationNodes: LayoutNode[] = nodes.map((node) => ({
    ...node,
    x: node.position.x,
    y: node.position.y,
  }));
  const simulationLinks: SimulationLinkDatum<LayoutNode>[] = edges
    .filter((edge) => nodes.some((node) => node.id === edge.source) && nodes.some((node) => node.id === edge.target))
    .map((edge) => ({ source: edge.source, target: edge.target }));
  const simulation = forceSimulation(simulationNodes)
    .force("link", forceLink<LayoutNode, SimulationLinkDatum<LayoutNode>>(simulationLinks).id((node) => node.id).distance(190))
    .force("charge", forceManyBody<LayoutNode>().strength(-650))
    .force("center", forceCenter<LayoutNode>(520, 340))
    .force("collide", forceCollide<LayoutNode>(155))
    .stop();

  for (let tick = 0; tick < 120; tick += 1) simulation.tick();

  return simulationNodes.map((node) => ({
    ...node,
    position: { x: node.x ?? 0, y: node.y ?? 0 },
  }));
}

export function layoutGraph(
  nodes: Node<ArchitectureNodeData>[],
  edges: Edge[],
  mode: LayoutMode,
) {
  if (mode === "radial") return radialLayout(nodes);
  if (mode === "dag") return dagLayout(nodes, edges);
  return forceLayout(nodes, edges);
}