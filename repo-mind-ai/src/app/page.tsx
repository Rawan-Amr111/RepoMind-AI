"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import GraphCanvas from "@/components/GraphCanvas";
import NodeInspector from "@/components/NodeInspector";
import { buildArchitectureGraph, type ArchitectureGraph } from "@/lib/architecture";
import { generateMermaid } from "@/lib/generateMermaid";
import { type LayoutMode } from "@/lib/layoutGraph";
import { parseProjectFiles } from "@/lib/parseProject";

const layerOptions = [
  { label: "UI Components", category: "ui" },
  { label: "State Stores & Hooks", category: "state" },
  { label: "API Routes", category: "api" },
  { label: "Lib & Utilities", category: "utility" },
] as const;
const layoutOptions: { label: string; mode: LayoutMode }[] = [
  { label: "Force", mode: "force" },
  { label: "DAG", mode: "dag" },
  { label: "Radial", mode: "radial" },
];

export default function Home() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [statusText, setStatusText] = useState("Waiting for project upload");
  const [errorMessage, setErrorMessage] = useState("");
  const [projectName, setProjectName] = useState("No project loaded");
  const [progress, setProgress] = useState(0);
  const [graph, setGraph] = useState<ArchitectureGraph>({ nodes: [], edges: [] });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("force");
  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>({
    ui: true,
    state: true,
    api: true,
    utility: true,
  });
  const [exportState, setExportState] = useState<"idle" | "copied" | "downloaded">("idle");

  const startParsing = async (label: string, files: File[]) => {
    setIsParsing(true);
    setStatusText("Parsing JS/TS imports via JSZip...");
    setErrorMessage("");
    setProjectName(label);
    setProgress(10);
    setGraph({ nodes: [], edges: [] });

    const timer = setInterval(() => {
      setProgress((current) => Math.min(current + 14, 95));
    }, 170);

    try {
      const sourceFiles = await parseProjectFiles(files);
      const parsedGraph = buildArchitectureGraph(sourceFiles);
      setGraph(parsedGraph);
      setSelectedNodeId(null);

      setProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 350));
      setStatusText("Project parsed successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "The project could not be parsed.";
      setStatusText(message);
      setErrorMessage(message);
    } finally {
      if (timer) clearInterval(timer);
      setIsParsing(false);
    }
  };

  const handleFiles = async (incomingFiles: FileList | File[]) => {
    const files = Array.from(incomingFiles);
    if (!files.length) return;
    await startParsing(files[0]?.name ?? "Uploaded project", files);
  };

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      await handleFiles(event.target.files);
      event.target.value = "";
    }
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files.length) {
      await handleFiles(event.dataTransfer.files);
    }
  };

  const handleDemoRepo = async () => {
    const demoFiles = [
      new File(["import { TopBar } from '../components/TopBar';\nexport default function Page() { return <TopBar />; }"], "page.tsx"),
      new File(["import { useProject } from '../hooks/useProject';\nexport function TopBar() { useProject(); return <header>RepoMind</header>; }"], "TopBar.tsx"),
      new File(["export function useProject() { return { name: 'Demo Repo' }; }"], "useProject.ts"),
    ];
    const paths = ["src/app/page.tsx", "src/components/TopBar.tsx", "src/hooks/useProject.ts"];
    demoFiles.forEach((file, index) => {
      Object.defineProperty(file, "webkitRelativePath", { value: paths[index] });
    });

    await startParsing("Demo Repo", demoFiles);
  };

  const visibleNodes = graph.nodes.filter((node) => visibleLayers[node.data.category] !== false);
  const visibleNodeIds = new Set(visibleNodes.map((node) => node.id));
  const visibleEdges = graph.edges.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));
  const selectedNode = graph.nodes.find((node) => node.id === selectedNodeId) ?? null;

  const handleMermaidExport = async () => {
    const markdown = generateMermaid(visibleNodes, visibleEdges);
    try {
      await navigator.clipboard.writeText(markdown);
      setExportState("copied");
    } catch {
      const blob = new Blob([markdown], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "repomind-architecture.md";
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setExportState("downloaded");
    }
    window.setTimeout(() => setExportState("idle"), 2400);
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1800px] flex-col lg:h-screen">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-sm sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-sm font-bold text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.25)]">
              RM
            </div>
            <div className="flex items-center gap-3">
              <span className="text-base font-semibold tracking-tight text-white sm:text-lg">
                RepoMind AI
              </span>
              <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                FREE TIER
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200">
              Nodes: {graph.nodes.length} | Edges: {graph.edges.length}
            </div>
            <button
              type="button"
              disabled={!graph.nodes.length}
              onClick={handleMermaidExport}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.15)] transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exportState === "copied" ? <Check size={15} aria-hidden="true" /> : exportState === "downloaded" ? <Download size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
              {exportState === "copied" ? "Mermaid copied" : exportState === "downloaded" ? "Markdown downloaded" : "Export to Mermaid"}
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden border-t border-white/10 max-lg:flex-col max-lg:overflow-y-auto">
          <aside className="w-full shrink-0 border-b border-white/10 bg-[#0a1220] p-4 sm:p-5 lg:w-[330px] lg:border-b-0 lg:border-r">
            <div
              onDrop={handleDrop}
              onDragOver={(event) => event.preventDefault()}
              className="rounded-2xl border border-dashed border-slate-600 bg-slate-900/60 p-4 text-center shadow-[inset_0_0_0_1px_rgba(148,163,184,0.08)] transition hover:border-cyan-400/40 hover:bg-slate-800/70"
            >
              <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleChange}
                accept=".zip,.js,.jsx,.ts,.tsx"
              />
              <input
                ref={folderInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleChange}
                {...{ webkitdirectory: "" }}
              />

              {isParsing ? (
                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-cyan-200">
                    <span>Parsing</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 transition-[width] duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-sm text-slate-300">{statusText}</div>
                </div>
              ) : (
                <>
                  <div className="mb-3 text-lg font-medium text-slate-200">
                    Drop repository .zip or files here
                  </div>
                  <button
                    type="button"
                    className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-sm font-medium text-cyan-200 transition hover:bg-cyan-500/20"
                    onClick={() => inputRef.current?.click()}
                  >
                    Browse files
                  </button>
                  <button
                    type="button"
                    className="ml-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm font-medium text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200"
                    onClick={() => folderInputRef.current?.click()}
                  >
                    Browse folder
                  </button>
                </>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Semantic Layers
                </div>
                <div className="space-y-2">
                  {layerOptions.map((item) => (
                    <label
                      key={item.category}
                      className="flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400/30 hover:bg-slate-800/80"
                    >
                      <span>{item.label}</span>
                      <input
                        type="checkbox"
                        checked={visibleLayers[item.category] !== false}
                        onChange={(event) => {
                          setVisibleLayers((current) => ({ ...current, [item.category]: event.target.checked }));
                          setSelectedNodeId(null);
                        }}
                        className="h-4 w-4 accent-cyan-400"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Layout Controls
                </div>
                <div className="flex flex-wrap gap-2">
                  {layoutOptions.map((option) => (
                    <button
                      key={option.mode}
                      type="button"
                      onClick={() => setLayoutMode(option.mode)}
                      aria-pressed={layoutMode === option.mode}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition ${layoutMode === option.mode ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-100" : "border-slate-700 bg-slate-900/80 text-slate-200 hover:border-cyan-400/40 hover:text-cyan-200"}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/60 p-3 text-xs text-slate-300">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Project</div>
              <div className="mt-2 font-medium text-slate-100">{projectName}</div>
              <div className="mt-1 text-slate-400">{statusText}</div>
              {errorMessage && <p role="alert" className="mt-2 text-xs text-rose-300">{errorMessage}</p>}
            </div>
          </aside>

          <main className="relative min-h-[420px] min-w-0 flex-1 overflow-hidden bg-[#070d18] lg:min-h-0">
            <div className="app-grid absolute inset-0 opacity-80" />
            {graph.nodes.length > 0 && visibleNodes.length > 0 ? (
              <GraphCanvas
                nodes={visibleNodes}
                edges={visibleEdges}
                selectedNodeId={selectedNodeId}
                layoutMode={layoutMode}
                onNodeSelect={setSelectedNodeId}
              />
            ) : graph.nodes.length > 0 ? (
              <div className="relative z-10 flex h-full min-h-[420px] items-center justify-center p-6 text-center">
                <p className="max-w-sm text-sm text-slate-400">All architecture layers are hidden. Turn on a layer in the workspace panel to show nodes.</p>
              </div>
            ) : (
              <div className="relative z-10 flex h-full items-center justify-center p-8">
                <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-950/70 p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.7)] backdrop-blur-sm">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-500/10 text-cyan-200 shadow-[0_0_28px_rgba(34,211,238,0.25)]">
                  <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current" aria-hidden="true">
                    <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm1 15h-2v-2h2Zm0-4h-2V7h2Z" />
                  </svg>
                </div>

                <p className="text-base text-slate-300">
                  Upload a project ZIP or folder to generate your interactive code architecture map.
                </p>

                <button
                  type="button"
                  onClick={handleDemoRepo}
                  className="mt-6 inline-flex items-center justify-center rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_0_24px_rgba(34,211,238,0.4)] transition hover:bg-cyan-300"
                >
                  Load Demo Repo
                </button>
                </div>
              </div>
            )}
          </main>

          <aside className={`w-full shrink-0 border-t border-white/10 bg-[#0a1220] p-4 transition-[width] duration-300 sm:p-5 lg:w-[360px] lg:border-l lg:border-t-0 ${selectedNode ? "translate-x-0" : ""}`}>
            <NodeInspector
              node={selectedNode}
              nodes={graph.nodes}
              edges={graph.edges}
              onClose={() => setSelectedNodeId(null)}
            />
          </aside>
        </div>
      </div>
    </div>
  );
}
