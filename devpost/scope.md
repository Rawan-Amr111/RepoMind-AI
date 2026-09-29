---
doc: scope
status: draft
---

# RepoMind AI

One line: An interactive architecture mapper that turns a project ZIP or folder into a visual developer-friendly code map with AI explanations and README export.

## The Unique Kernel
The distinctive thing is combining client-side project parsing with an interactive architecture graph and AI-powered node inspection. Instead of a flat folder tree, the app turns imports, exports, and code structure into a visual mental model that helps developers understand a codebase quickly.

## Who It's For
A frontend engineer, open-source contributor, or hackathon reviewer who needs to understand a project quickly before they can evaluate, debug, or explain it. Today they rely on folder trees, file names, and scattered docs; this tool gives them a visual architecture map in minutes.

## The Core Loop
They upload a ZIP or project folder, the app parses the JS/TS files in the browser, extracts relationships between modules, and renders a color-coded graph in React Flow. They can zoom, drag, filter categories, and click a node to inspect the component or module summary. Then they export the architecture as a Mermaid diagram for GitHub documentation.

## Inspiration & Identity
A sleek dark mode developer dashboard with glowing architecture nodes and clear visual hierarchy. The feel should be technical, fast, and credible—more like a code-inspection tool than a generic diagram app. The user is not looking for a toy demo; they want something that feels useful to engineers and judges.

## Why This Matters to the Learner
This project matters because it solves a real pain point: understanding a codebase quickly without reading every file. It’s useful for developers, it is easy to explain in a demo, and it has a visible wow factor when the graph appears and the AI summary explains a component.

## What "Working" Looks Like
The proof of concept is complete when a user can upload a sample project, see a graph of architecture relationships, toggle categories, inspect a node for a summary and code excerpt, and export the visual as Mermaid for README use. That moment is the clear demo win.

## The POC Boundary
In scope:
- browser upload of project ZIP or folder
- JS/TS parsing using JSZip
- import/export relationship extraction
- React Flow graph with clickable nodes
- category filtering for UI components, routes, hooks, state, utilities
- AI summary drawer using Gemini Flash API free tier
- Mermaid export for GitHub docs

Out of scope for this hackathon:
- backend or server-side repository processing
- deep semantic code understanding beyond visible import/export structure
- production-grade repo analysis for every framework
- user accounts, persistence, or multi-project dashboards

## Later
- richer dependency analysis beyond direct imports/exports
- persistent saved architecture sessions
- AI-generated README summaries for multiple project types
- broader support for non-JS ecosystems or monorepos

## Explicitly Cut
- Full repository intelligence engine: not needed for the initial proof of concept
- Backend processing pipeline: this would add complexity without improving the core demo
- User authentication and saved projects: not required for a focused hackathon app
- Full production-quality docs generation: the MVP only needs a useful Mermaid export and visual explanation
