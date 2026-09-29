"use client";

import { useEffect, useState } from "react";
import type { Edge, Node } from "@xyflow/react";
import type { ArchitectureNodeData } from "@/lib/architecture";

type NodeInspectorProps = {
  node: Node<ArchitectureNodeData> | null;
  nodes: Node<ArchitectureNodeData>[];
  edges: Edge[];
  onClose: () => void;
};

function getPropNames(sourceCode: string) {
  const propsBlock = sourceCode.match(/(?:interface|type)\s+\w*Props\s*(?:=\s*)?\{([\s\S]*?)\}/)?.[1];
  if (!propsBlock) return [];
  return [...propsBlock.matchAll(/^\s*(\w+)\??\s*:/gm)].map((match) => match[1]);
}

function getApiEndpoints(sourceCode: string) {
  const matches = [...sourceCode.matchAll(/(?:fetch|axios\.(?:get|post|put|patch|delete))\s*\(\s*["'`]([^"'`]+)["'`]/g)];
  return [...new Set(matches.map((match) => match[1]))];
}

export default function NodeInspector({ node, nodes, edges, onClose }: NodeInspectorProps) {
  const [summaryResult, setSummaryResult] = useState<{
    nodeId: string;
    summary: string;
    source: "gemini" | "local";
  } | null>(null);

  useEffect(() => {
    if (!node) return;

    let cancelled = false;
    const fallback = `${node.data.label} is a ${node.data.category} file in ${node.data.filePath}. Its direct connections are shown on the architecture canvas.`;

    void (async () => {
      try {
        const response = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: node.data.label,
            filePath: node.data.filePath,
            category: node.data.category,
            sourceCode: node.data.sourceCode.slice(0, 12000),
          }),
        });
        if (!response.ok) throw new Error("Gemini summary unavailable");
        const result = (await response.json()) as { summary: string };
        if (!cancelled && result.summary) {
          setSummaryResult({ nodeId: node.id, summary: result.summary, source: "gemini" });
        }
      } catch {
        if (!cancelled) setSummaryResult({ nodeId: node.id, summary: fallback, source: "local" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [node]);

  if (!node) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-5 text-center text-sm text-slate-400">
        Click any node on the canvas to inspect component architecture, props, and AI summary.
      </div>
    );
  }

  const dependencies = edges
    .filter((edge) => edge.source === node.id)
    .map((edge) => nodes.find((item) => item.id === edge.target))
    .filter((item): item is Node<ArchitectureNodeData> => Boolean(item));
  const dependents = edges
    .filter((edge) => edge.target === node.id)
    .map((edge) => nodes.find((item) => item.id === edge.source))
    .filter((item): item is Node<ArchitectureNodeData> => Boolean(item));
  const props = getPropNames(node.data.sourceCode);
  const apiEndpoints = getApiEndpoints(node.data.sourceCode);
  const summary = summaryResult?.nodeId === node.id
    ? summaryResult.summary
    : `${node.data.label} is a ${node.data.category} file in ${node.data.filePath}. Its direct connections are shown on the architecture canvas.`;
  const summarySource = summaryResult?.nodeId === node.id ? summaryResult.source : "local";
  const isLoading = summaryResult?.nodeId !== node.id;

  return (
    <div className="h-full animate-inspector overflow-y-auto rounded-2xl border border-cyan-400/20 bg-slate-950/70 p-5 shadow-[0_0_32px_rgba(34,211,238,0.08)]">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: node.data.color }}>
            {node.data.category === "state" ? "Hooks & State" : node.data.category}
          </span>
          <h2 className="mt-1 truncate text-lg font-semibold text-white">{node.data.label}</h2>
          <p className="mt-1 break-all font-mono text-[10px] text-slate-400">{node.data.filePath}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close node inspector"
          title="Close inspector"
          className="rounded-lg border border-slate-700 px-2 py-1 text-slate-300 transition hover:border-cyan-400/50 hover:text-white"
        >
          ×
        </button>
      </div>

      <section className="border-t border-white/10 py-4">
        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          <h3>Architecture Summary</h3>
          <span className={summarySource === "gemini" ? "text-cyan-300" : "text-slate-500"}>
            {isLoading ? "Checking Gemini..." : summarySource === "gemini" ? "Gemini" : "Local summary"}
          </span>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-200">{summary}</p>
      </section>

      <section className="border-t border-white/10 py-4">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Props</h3>
        <p className="mt-2 text-xs text-slate-300">{props.length ? props.join(", ") : "No typed props detected."}</p>
      </section>

      <section className="border-t border-white/10 py-4">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Connections</h3>
        <div className="mt-2 space-y-3 text-xs">
          <div>
            <p className="mb-1 text-slate-500">Depends on</p>
            {dependencies.length ? dependencies.map((item) => <p key={item.id} className="truncate text-cyan-200">{item.data.label}</p>) : <p className="text-slate-500">No local imports detected.</p>}
          </div>
          <div>
            <p className="mb-1 text-slate-500">Used by</p>
            {dependents.length ? dependents.map((item) => <p key={item.id} className="truncate text-slate-200">{item.data.label}</p>) : <p className="text-slate-500">No importing files detected.</p>}
          </div>
        </div>
      </section>

      {apiEndpoints.length > 0 && (
        <section className="border-t border-white/10 py-4">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">API Requests</h3>
          <div className="mt-2 space-y-1 font-mono text-xs text-green-200">
            {apiEndpoints.map((endpoint) => <p key={endpoint} className="break-all">{endpoint}</p>)}
          </div>
        </section>
      )}

      <section className="border-t border-white/10 py-4">
        <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Source Excerpt</h3>
        <pre className="mt-2 max-h-56 overflow-auto rounded-lg border border-white/5 bg-black/30 p-3 text-[10px] leading-5 text-slate-300"><code>{node.data.sourceCode.slice(0, 1200)}</code></pre>
        {node.data.sourceCode.length > 1200 && <p className="mt-1 text-[10px] text-slate-500">Excerpt shortened to 1,200 characters.</p>}
      </section>
    </div>
  );
}