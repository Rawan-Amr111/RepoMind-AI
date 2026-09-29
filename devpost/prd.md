---
doc: prd
status: draft
---

# RepoMind AI — Product Requirements

One line: RepoMind AI is a dark-mode, developer-first architecture mapper that lets users upload a project ZIP or folder, visualize how components and modules connect, inspect a node with AI-generated context, and export the map as Mermaid for GitHub docs.
Source: `scope.md > The Unique Kernel`, `The Core Loop`, `What "Working" Looks Like`, and `The POC Boundary`.

## The Core Journey
1. The user opens the app and sees a sleek, dark-mode dashboard with a 3-panel layout: a left workspace panel, a center architecture canvas, and a right inspector panel.
2. On first load, the app shows a hero state with a clear prompt to upload a project ZIP or folder and an option to load a demo repo instantly for testing.
3. The user uploads a project or clicks the demo button. The left panel shows a parsing/loading state while the app reads JS/TS files, extracts import/export relationships, and prepares the graph.
4. After parsing, the center canvas animates in with a network of glowing, color-coded nodes and connecting dependency edges. The top bar updates with node and edge counts and a status indicator.
5. The user can zoom, drag, and filter layers so they can focus on specific parts of the architecture such as UI components, state/hook nodes, API routes, or utilities.
6. The user clicks a node such as an auth modal or a route handler. The selected node highlights, related edges brighten, and the right inspector panel opens.
7. In the inspector, the user reads a concise AI summary, sees relevant props or connections, and views a short code excerpt related to the selected file or component.
8. The user can export the graph as Mermaid Markdown to copy into a GitHub README without leaving the app.

## Screens and Layout
The app has three primary surfaces in a single layout:
- Top header spanning the width of the app with branding, a free-tier badge, status counters, and the export button.
- Left panel containing upload controls, semantic layer toggles, and layout view options.
- Center canvas with an empty-state prompt before upload and a graph view after parsing.
- Right side inspector panel that remains collapsed by default until a node is selected.

## Look and Feel
The app should feel technical, premium, and credible to developers. The aesthetic is dark mode with a developer-console vibe, strong contrast, subtle grid or panel framing, and a minimal but polished interface. Nodes should use clear, high-contrast colors:
- Cyan for UI Components
- Purple for Hooks & State
- Green for API Routes
- Slate for Utilities

The app should feel fast and informative without becoming visually noisy. A selected node should glow and draw attention while unrelated nodes dim slightly to clarify focus.

## Features and Behavior

### Upload, Setup, and Demo Experience
- The user can drop a project ZIP or folder into the left panel or use a drag-and-drop area.
- The app accepts project directories or ZIP archives as input and parses them entirely on the client.
- A loading indicator appears with the text: "Parsing JS/TS imports via JSZip..." while the graph is prepared.
- A demo repo button allows a user or judge to instantly test the app without preparing their own archive.
- Before a project is loaded, the export button is disabled.

### Architecture Visualization
- The graph is rendered with React Flow and animates into view after parsing completes.
- Nodes are labeled clearly and positioned in a readable layout.
- Edges show dependency direction and make it obvious which modules import or depend on one another.
- The top status indicator updates to show node and edge totals after the graph initializes.
- The user can reuse standard graph interactions such as zooming and dragging.

### Layer Filtering and Layout Controls
- Users can toggle semantic layers to hide or show classes of nodes, such as UI Components, State Stores & Hooks, API Routes, and Lib & Utilities.
- Users can choose a graph layout such as Force, DAG, or Radial view.
- Filtering changes the visible graph without reloading the project.

### Node Inspection
- Clicking a node selects it and highlights it with a focused border and brighter edges.
- The right inspector panel slides open smoothly and displays a concise architecture explanation.
- The inspector includes the component or module name, file path, and short AI-generated summary.
- The inspector shows relevant props, hooks, and API calls associated with the selected node.
- The inspector includes a short snippet of code showing the component signature and imports.

### Export to Mermaid
- When a graph is loaded, the export button becomes enabled.
- The user can click it to generate Mermaid chart markup based on the current architecture.
- The app copies valid Markdown chart code for immediate use in GitHub README files.

## States and Boundaries
- **Empty state** — app shows the upload prompt and demo button.
- **Loading state** — parsing progress is displayed while JS/TS imports are extracted.
- **Ready state** — graph renders with node and edge totals and the export action becomes active.
- **Node selected state** — the selected node focuses, related edges brighten, and the inspector opens.
- **Filtered state** — the graph updates to show only selected semantic categories.
- **Error state** — if parsing fails or no parseable files are found, the app should explain the issue without crashing.

## Product Decisions
- The learner wants a browser-only solution that avoids backend overhead and keeps the app free-tier friendly.
- The app should prioritize a fast proof of concept that demonstrates architecture mapping clearly, not a broad code intelligence platform.
- The demo button is a deliberate choice to keep the product immediately testable at hackathons and live demos.
- The app should keep the architecture summary focused and short to remain readable while still being useful to fast-moving developers.

## What We're Building
- A dark-mode developer dashboard with upload and demo actions
- A client-side parser for JS/TS files using JSZip
- A visual dependency graph using React Flow
- Semantic layer toggles and layout controls
- A node inspector with AI summary and code excerpt
- Mermaid export for GitHub-ready documentation

## Deferred From the POC
- Full backend processing or repository indexing
- Deep semantic analysis beyond imports and direct module relationships
- Full support for every language, package manager, or monorepo setup
- User accounts, persistence, and saved session history
- Advanced project-wide AI reasoning for large-scale enterprise repos

## Possible Later Enhancements
- More advanced dependency graph analysis beyond direct imports and exports
- Better categorization for hooks, state, API services, and utilities
- Saved architecture snapshots and shareable reports
- AI-generated README summaries alongside Mermaid export

## Non-Goals
- Building a general-purpose code intelligence platform for all repos and ecosystems
- Replacing source control or full project analysis tools
- Multi-user collaboration or authentication
- Full production-grade repository auditing for enterprise teams

## Open Questions
- Should the built-in demo repo be a lightweight example app included with the project, or a fetched public sample repository?
- Should the app support drag-and-drop uploads only, or also direct folder selection via file picker?
- Must the Mermaid export be copy-to-clipboard only, or should it also offer a downloadable .md file?

These can be answered before spec if they materially affect the build, but they do not block a strong proof-of-concept draft.
