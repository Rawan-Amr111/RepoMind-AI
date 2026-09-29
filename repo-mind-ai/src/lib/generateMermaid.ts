import type { Edge, Node } from "@xyflow/react";
import type { ArchitectureNodeData } from "./architecture";

export function generateMermaid(nodes: Node<ArchitectureNodeData>[], edges: Edge[]) {
  const nodeIds = new Map(nodes.map((node, index) => [node.id, `node${index + 1}`]));
  const lines = ["flowchart TD"];

  for (const node of nodes) {
    const mermaidId = nodeIds.get(node.id);
    const label = `${node.data.label} (${node.data.category})`.replace(/["<>]/g, "");
    lines.push(`  ${mermaidId}["${label}"]`);
  }

  for (const edge of edges) {
    const source = nodeIds.get(edge.source);
    const target = nodeIds.get(edge.target);
    if (source && target) lines.push(`  ${source} --> ${target}`);
  }

  return `\`\`\`mermaid\n${lines.join("\n")}\n\`\`\``;
}