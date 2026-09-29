import type { Edge, Node } from "@xyflow/react";

export type NodeCategory = "ui" | "state" | "api" | "utility";

export type ArchitectureNodeData = {
  label: string;
  filePath: string;
  category: NodeCategory;
  color: string;
  sourceCode: string;
};

export type ParsedSourceFile = {
  path: string;
  content: string;
};

export type ArchitectureGraph = {
  nodes: Node<ArchitectureNodeData>[];
  edges: Edge[];
};

const categoryColors: Record<NodeCategory, string> = {
  ui: "#22d3ee",
  state: "#c084fc",
  api: "#4ade80",
  utility: "#94a3b8",
};

const importPattern = /^\s*(?:import|export)\s+(?:type\s+)?(?:[^'"\n]*?\s+from\s*)?["']([^"']+)["']/gm;
const dynamicImportPattern = /\bimport\(\s*["']([^"']+)["']\s*\)/g;

function normalizePath(filePath: string) {
  const segments: string[] = [];

  for (const segment of filePath.replaceAll("\\", "/").split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") segments.pop();
    else segments.push(segment);
  }

  return segments.join("/");
}

function classifyFile(file: ParsedSourceFile): NodeCategory {
  const lowerPath = file.path.toLowerCase();
  const fileName = lowerPath.split("/").pop() ?? lowerPath;

  if (/(^|\/)(api|routes?)(\/|$)/.test(lowerPath) || /^route\.(ts|js)$/.test(fileName)) {
    return "api";
  }

  if (
    /(^|\/)(hooks?|stores?|state)(\/|$)/.test(lowerPath) ||
    /^use[A-Z]/.test(file.path.split("/").pop() ?? "")
  ) {
    return "state";
  }

  if (/(^|\/)(components?|ui)(\/|$)/.test(lowerPath) || /\.(tsx|jsx)$/i.test(file.path)) {
    return "ui";
  }

  return "utility";
}

function resolveLocalImport(sourcePath: string, importPath: string, knownPaths: Set<string>) {
  if (!importPath.startsWith(".") && !importPath.startsWith("@/")) return undefined;

  const basePath = importPath.startsWith("@/")
    ? normalizePath(`src/${importPath.slice(2)}`)
    : normalizePath(`${sourcePath.split("/").slice(0, -1).join("/")}/${importPath}`);
  const candidates = /\.(tsx?|jsx?)$/i.test(basePath)
    ? [basePath]
    : [
        basePath,
        `${basePath}.tsx`,
        `${basePath}.ts`,
        `${basePath}.jsx`,
        `${basePath}.js`,
        `${basePath}/index.tsx`,
        `${basePath}/index.ts`,
        `${basePath}/index.jsx`,
        `${basePath}/index.js`,
      ];

  return candidates.find((candidate) => knownPaths.has(candidate));
}

export function buildArchitectureGraph(files: ParsedSourceFile[]): ArchitectureGraph {
  const knownPaths = new Set(files.map((file) => normalizePath(file.path)));
  const nodes = files.map((file, index): Node<ArchitectureNodeData> => {
    const category = classifyFile(file);
    const fileName = file.path.split("/").pop() ?? file.path;

    return {
      id: normalizePath(file.path),
      type: "architecture",
      position: { x: 100 + (index % 4) * 280, y: 90 + Math.floor(index / 4) * 190 },
      data: {
        label: fileName.replace(/\.(tsx?|jsx?)$/i, ""),
        filePath: file.path,
        category,
        color: categoryColors[category],
        sourceCode: file.content,
      },
    };
  });

  const edges: Edge[] = [];

  for (const file of files) {
    const imports = new Set<string>();
    for (const pattern of [importPattern, dynamicImportPattern]) {
      pattern.lastIndex = 0;
      for (const match of file.content.matchAll(pattern)) imports.add(match[1]);
    }

    for (const importPath of imports) {
      const targetPath = resolveLocalImport(file.path, importPath, knownPaths);
      if (!targetPath) continue;

      edges.push({
        id: `${normalizePath(file.path)}->${targetPath}`,
        source: normalizePath(file.path),
        target: targetPath,
        type: "smoothstep",
        animated: true,
        style: { stroke: "#67e8f9", strokeWidth: 2 },
      });
    }
  }

  return { nodes, edges };
}