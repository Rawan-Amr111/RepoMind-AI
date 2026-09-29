---
doc: spec
status: draft
---

# RepoMind AI — Technical Spec

## How This Works, In Plain Language
RepoMind AI is a browser-based tool for turning a codebase into a map. The user drops a ZIP or selects a folder. The app reads the JavaScript and TypeScript files in the browser, scans their imports and exports, and uses that structure to build a graph of modules and their relationships.

The graph sits in the center of the screen, and each node represents a part of the project such as a UI component, hook, route, or utility. The app highlights the selected node, shows which files connect to it, and gives a short AI-generated description of what that part of the system is doing. The user can then filter the graph, inspect a node, and export the overall architecture as Mermaid code for a GitHub README.

This shape keeps the project fast, low-cost, and good for a proof of concept. The important part is not building a complete code intelligence engine; it is proving that a developer can upload a project and immediately understand how it is assembled.

## The Core Journey Through the System
The PRD’s core journey flows through a simple path:

1. The user opens the app and sees the empty dashboard state.
2. They upload a ZIP or folder or click “Load Demo Repo.”
3. The client parses JS/TS files using JSZip and extracts import/export relationships.
4. The app transforms that graph data into node and edge objects for React Flow.
5. The graph renders in the center panel with color-coded nodes and dependency lines.
6. The user filters semantic layers or changes layout mode.
7. They click a node and the selected node focuses while related edges brighten.
8. The right panel opens and shows the file path, AI summary, relevant props/connections, and a short code snippet.
9. The user clicks “Export Mermaid,” copies the generated Markdown, and pastes it into a README.

PRD ref: `prd.md > The Core Journey`.

## Stack
- Next.js — app shell, routing, and a simple React-based UI
- React — component rendering and state management
- Tailwind CSS — styling for the dark developer dashboard and layout
- React Flow — interactive graph rendering, node interactions, and edge drawing
- JSZip — client-side ZIP parsing and file extraction
- Google Gemini Flash API — short, AI-powered architectural summaries for selected nodes
- Optional lightweight utility library for file parsing and sanitization if it reduces complexity

Why this stack fits the project:
- It keeps the app fast to build and easy to demo locally.
- It matches the learner’s stated zero-cost direction.
- It avoids introducing a backend unless a real limitation appears.
- It is sufficient for a small proof of concept focused on visual architecture mapping.

## Where It Runs and How Someone Tries It
Runtime: browser-based app, meant to run locally for the demo. Deployment is optional and not required for the proof of concept.

Environment requirements:
- Node.js 18+ or the project’s active LTS version
- A browser with local filesystem access for folder upload or ZIP import
- Gemini API key for the AI summary feature (or a proxy route if the app chooses not to call the API directly from the browser)

Startup flow:
1. Install dependencies: `npm install`
2. Start the app: `npm run dev`
3. Open the local app in the browser at the local Next.js URL
4. Upload a project ZIP or click “Load Demo Repo”
5. Record the demo as a short walkthrough of upload → graph render → node inspection → Mermaid export

Submission requirement: this app can be demonstrated locally with a short video and a public GitHub repo. Deployment is optional and can be added later if a public link is valuable.

## Look and Feel
The interface should feel like a polished developer tool, not a generic app. The styling should be:
- dark mode with subtle depth and panel separation
- cyan, purple, green, and slate node colors that stay readable against the dark background
- minimal but technical UI copy with clear hierarchy
- a compact layout with strong spacing and a subtle grid background in the canvas area

The experience should feel fast and focused. The graph must be visually impressive without overwhelming the user, and the inspector should open smoothly without feeling like a separate app.

## Components

### App Shell
The top-level application container owns the overall dashboard layout and keeps the header, left panel, center canvas, and right inspector pinned in a consistent developer workspace arrangement.
PRD ref: `prd.md > Screens and Layout`.

### Header Bar
Displays the app brand, the free-tier badge, the node/edge status display, and the export button. It reflects the loaded state of the project and disables export until graph data exists.
PRD ref: `prd.md > Screens and Layout` and `prd.md > Features and Behavior > Upload, Setup, and Demo Experience`.

### Workspace Left Panel
Holds the upload area, semantic filters, and layout selection controls. This panel is responsible for user input and graph configuration; it should not become the main content area once a project is loaded.
PRD ref: `prd.md > Screens and Layout` and `prd.md > Features and Behavior > Layer Filtering and Layout Controls`.

### Upload Drop Zone
Accepts project ZIP files or folder uploads and starts the parsing process. It shows a loading message while the project is being scanned and keeps the app approachable for first-time users.
PRD ref: `prd.md > Features and Behavior > Upload, Setup, and Demo Experience`.

### Graph Canvas
Holds the React Flow graph. It manages the render of nodes and edges, supports panning and zooming, and handles the focus state when a node is selected.
PRD ref: `prd.md > Features and Behavior > Architecture Visualization`.

### Semantic Layer Filters
Expose toggles for UI components, state/hook nodes, API routes, and utilities. These controls change the visible graph without reprocessing the project.
PRD ref: `prd.md > Features and Behavior > Layer Filtering and Layout Controls`.

### Node Inspector
Responsible for displaying the selected node’s metadata, AI-generated summary, connected dependencies, props, and code excerpt. It opens on selection and remains in a collapsed state by default.
PRD ref: `prd.md > Features and Behavior > Node Inspection`.

### Mermaid Export Module
Creates Mermaid markdown from the current graph structure and copies it to the clipboard or exposes a downloadable markdown snippet. This is the documentation handoff for README use.
PRD ref: `prd.md > Features and Behavior > Export to Mermaid`.

## Data Model
The app’s data model can stay intentionally simple for the proof of concept.

### ProjectGraph
- id: unique project identifier
- nodes: array of graph node objects
- edges: array of graph edges
- fileIndex: mapping from file path to parsed metadata
- status: parsing state, such as idle, loading, parsed, or error

### GraphNode
- id: unique node id
- type: semantic node type such as ui, state, api, utility
- label: human-readable display name
- filePath: source file path
- imports: list of file paths or node ids this node depends on
- exports: list of exports or public symbols
- props: relevant prop names if the node is a component
- hooks: connected hooks or state subscriptions
- apiCalls: related API endpoints or requests
- codeExcerpt: short snippet for inspector display

### GraphEdge
- id: unique edge id
- source: source node id
- target: target node id
- label: optional import or relationship label
- strength: optional value for highlighting or weighting

### AI Summary Payload
- nodeId
- summary: concise 2-sentence explanation
- filePath
- relevantConnections
- confidence: quality or certainty indicator if used

This model is enough to support filtering, highlighting, node inspection, and Mermaid export without requiring a complex backend database.

## File Structure
```text
project/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── dashboard/
│   │   ├── HeaderBar.tsx
│   │   ├── WorkspacePanel.tsx
│   │   ├── GraphCanvas.tsx
│   │   └── NodeInspector.tsx
│   ├── graph/
│   │   ├── GraphNode.tsx
│   │   ├── GraphEdge.tsx
│   │   └── MermaidExportButton.tsx
│   └── ui/
│       └── Toggle.tsx
├── lib/
│   ├── parser/
│   │   ├── parseProject.ts
│   │   ├── extractImports.ts
│   │   └── classifyNode.ts
│   ├── graph/
│   │   ├── buildGraph.ts
│   │   └── layout.ts
│   ├── ai/
│   │   └── summarizeNode.ts
│   └── export/
│       └── generateMermaid.ts
├── public/
│   └── demo/
├── devpost/
│   ├── learner-profile.md
│   ├── scope.md
│   ├── prd.md
│   └── spec.md
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
├── README.md
└── .env.example
```

This structure is deliberate: parsing, graph construction, AI summary generation, and export logic are all separated so the build stays testable and understandable.

## External Services and Dependencies
- Gemini API — used to generate the selected node’s architectural summary
  - Endpoint: Gemini model endpoint for chat or generation calls
  - Auth: API key stored in environment variables
  - Risk: rate limits, prompt size limits, and model cost if usage grows
  - Fallback: use a simplified prompt with a short file excerpt and keep the summary length very short

- GitHub README export — no external service required; Mermaid code is generated locally and copied to the clipboard

- No database or backend service required for the proof-of-concept plan

## Important Failure Modes
- **Project parsing fails or yields no usable graph** → show a friendly empty-state error explaining that the uploaded archive did not contain parseable JS/TS files.
- **Gemini call fails or times out** → show a fallback summary message such as “Summary unavailable; imported file structure detected” and keep the graph interactive.
- **Too many nodes clutter the canvas** → filter controls and layout toggles should help the user reduce visual noise.

## What Was Simplified and Why
- **Browser-only parsing instead of a backend parser** — the product remains fast and free-tier friendly while still proving the core architecture-mapping concept.
- **Direct graph generation from import/export relationships instead of full semantic code analysis** — this is enough for the proof of concept and keeps the app understandable.
- **Optional Gemini route or browser call instead of a full backend API service** — the project can stay lean while maintaining the AI summary feature when the API is available.

## Decisions and Open Issues
Decisions made here:
- The app will stay browser-first and avoid a backend unless a real limitation appears.
- The primary MVP is a client-side JS/TS dependency graph with AI node summaries and Mermaid export.
- The app will prioritize a polished UI and a strong visual wow moment over deep semantic repository analysis.

One genuine uncertainty discussed:
- The default plan is to keep the app fully client-side, but the learner may choose a tiny proxy if Gemini access from the browser becomes blocked by CORS or key restrictions. This will be checked during the build if needed.

Open questions still worth resolving before the build is locked in:
- Should the demo repo be bundled locally, or will the app fetch a public sample repository when the demo button is clicked?
- Should the Mermaid export copy directly to the clipboard only, or also offer a downloadable markdown file?

These are implementation-level decisions, not blockers for the proof-of-concept draft.
