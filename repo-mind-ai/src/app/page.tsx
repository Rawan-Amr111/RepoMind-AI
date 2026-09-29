"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import GraphCanvas from "@/components/GraphCanvas";
import { buildArchitectureGraph, type ArchitectureGraph } from "@/lib/architecture";
import { parseProjectFiles } from "@/lib/parseProject";

const layerOptions = [
  "UI Components",
  "State Stores & Hooks",
  "API Routes",
  "Lib & Utilities",
];

const layoutOptions = ["Force", "DAG", "Radial"];

export default function Home() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [statusText, setStatusText] = useState("Waiting for project upload");
  const [projectName, setProjectName] = useState("No project loaded");
  const [progress, setProgress] = useState(0);
  const [graph, setGraph] = useState<ArchitectureGraph>({ nodes: [], edges: [] });

  const startParsing = async (label: string, files: File[]) => {
    setIsParsing(true);
    setStatusText("Parsing JS/TS imports via JSZip...");
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

      setProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 350));
      setStatusText("Project parsed successfully");
    } catch (error) {
      setStatusText(
        error instanceof Error ? error.message : "The project could not be parsed.",
      );
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

  return (
    <div className="min-h-screen bg-[#050b14] text-slate-100">
      <div className="mx-auto flex h-screen max-w-[1800px] flex-col">
        <header className="flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/30 bg-cyan-500/10 text-sm font-bold text-cyan-300 shadow-[0_0_24px_rgba(34,211,238,0.25)]">
              RM
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold tracking-tight text-white">
                RepoMind AI
              </span>
              <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200">
                FREE TIER
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200">
              Nodes: {graph.nodes.length} | Edges: {graph.edges.length}
            </div>
            <button
              type="button"
              disabled
              className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-200 opacity-50 shadow-[0_0_18px_rgba(34,211,238,0.15)] transition disabled:cursor-not-allowed"
            >
              Export to Mermaid
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 overflow-hidden border-t border-white/10">
          <aside className="w-[330px] border-r border-white/10 bg-[#0a1220] p-5">
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
                      key={item}
                      className="flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-slate-900/60 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400/30 hover:bg-slate-800/80"
                    >
                      <span>{item}</span>
                      <input
                        type="checkbox"
                        defaultChecked
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
                      key={option}
                      type="button"
                      className="rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-cyan-400/40 hover:text-cyan-200"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/60 p-3 text-xs text-slate-300">
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Project</div>
              <div className="mt-2 font-medium text-slate-100">{projectName}</div>
              <div className="mt-1 text-slate-400">{statusText}</div>
            </div>
          </aside>

          <main className="relative flex-1 overflow-hidden bg-[#070d18]">
            <div className="app-grid absolute inset-0 opacity-80" />
            {graph.nodes.length > 0 ? (
              <GraphCanvas nodes={graph.nodes} edges={graph.edges} />
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

          <aside className="w-[330px] border-l border-white/10 bg-[#0a1220] p-5">
            <div className="flex h-full items-start justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-5 text-center text-sm text-slate-400">
              Click any node on the canvas to inspect component architecture, props, and AI summary.
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
