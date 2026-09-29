---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn

## Slices

- [x] **1. App shell and empty-state dashboard**
  Becomes usable: The app opens as a polished dark-mode workspace with header, left panel, empty graph canvas, and empty inspector state.
  Why now: This establishes the project shell and the viewer experience first, so the upload and graph flow has a clear place to land.
  PRD ref: `prd.md > Screens and Layout`, `prd.md > Features and Behavior > Upload, Setup, and Demo Experience`
  Spec ref: `spec.md > Components`, `spec.md > File Structure`, `spec.md > Look and Feel`
  Build: Scaffold the Next.js app, add Tailwind styling, create the full 3-panel dashboard layout, implement the hero upload state and demo button, and add the empty node inspector placeholder.
  Verify (mechanical): Run the app locally and confirm the dashboard renders without runtime errors and the layout matches the intended screen structure.
  Learner check: Open the app and confirm the landing screen looks like a dark-mode developer workspace with the upload prompt and empty canvas.
  Commit: `Create dashboard shell and empty state`

- [x] **2. Upload, demo load, and parsing state**
  Becomes usable: The user can upload a ZIP or folder and see a parsing/loading state, or click a demo button to simulate the project-loading flow.
  Why now: The app needs a real input path before the graph can be generated, and this slice proves the upload workflow is working.
  PRD ref: `prd.md > Features and Behavior > Upload, Setup, and Demo Experience`
  Spec ref: `spec.md > Components > Upload Drop Zone`, `spec.md > Data Model`
  Build: Add file upload handling, drag-and-drop drop zone, demo repo trigger, and parsing progress UI with a JSZip-based project scan flow.
  Verify (mechanical): Upload a sample archive and confirm the app reaches the parsing state and transitions to the graph-ready state without crashing.
  Learner check: Try the upload flow or demo button and confirm the app clearly communicates loading progress and loading completion.
  Commit: `Add upload flow and parser loading state`

- [x] **3. Graph render and node/edge generation**
  Becomes usable: A visible architecture graph appears based on parsed project files, with color-coded nodes and edges.
  Why now: This is the unique kernel of the product and should appear early enough to be the wow moment of the demo.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Features and Behavior > Architecture Visualization`
  Spec ref: `spec.md > Components > Graph Canvas`, `spec.md > Data Model`
  Build: Build the graph model from parsed imports/exports, classify nodes into UI, state, API, and utilities, render them in React Flow, and display node/edge counts in the header.
  Verify (mechanical): Parse a sample project and confirm the graph renders with visible node and edge counts and no console errors.
  Learner check: Upload a project and confirm the graph appears as a clear architecture map rather than a blank canvas.
  Commit: `Render interactive architecture graph`

- [ ] **4. Graph filtering, node inspection, and Mermaid export**
  Becomes usable: The user can filter the graph, inspect a selected node with an AI summary, and copy a Mermaid diagram of the architecture.
  Why now: Combining inspection and export completes the understanding-and-documentation journey in one integrated slice, as requested by the learner.
  PRD ref: `prd.md > Features and Behavior > Layer Filtering and Layout Controls`, `prd.md > Features and Behavior > Node Inspection`
  Spec ref: `spec.md > Components > Semantic Layer Filters`, `spec.md > Components > Node Inspector`, `spec.md > Components > Mermaid Export Module`
  Build: Add semantic layer toggles, layout switching, selected-node focus, inspector metadata/code/summary, Gemini-backed summary with a safe fallback, and Mermaid generation with copy action.
  Verify (mechanical): Filter the graph, select a node and check inspector content, then generate a Mermaid diagram and verify it includes the graph's nodes and edges.
  Learner check: Try filtering, inspect a node, and copy the architecture diagram; confirm each result is clear and useful.
  Commit: `Add graph inspection and Mermaid export`

- [ ] **5. Final demo polish and failure states**
  Becomes usable: Upload, parsing, and AI failures are explained clearly, and the full demo remains legible at the target screen size.
  Why now: Once all core behaviors are integrated, this final slice resolves the few failure cases that could derail a live demo.
  PRD ref: `prd.md > States and Boundaries`, `prd.md > What We're Building`
  Spec ref: `spec.md > Important Failure Modes`, `spec.md > Look and Feel`
  Build: Refine empty/error/loading messages, handle unavailable Gemini credentials or service failures gracefully, and correct any visual overflow found during the integrated review.
  Verify (mechanical): Run lint and production build; confirm invalid input and AI failure leave the graph usable and show a clear message.
  Learner check: Try an invalid project and review the complete demo at desktop and narrow viewport widths.
  Commit: `Polish demo states and layout`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 2 or slice 3, depending on user feedback
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: [what actually happened; real document/test/code references; unfinished work if interrupted]
Route and stops: [actual paths and symbols; guided stops completed, or reference-only route]
Edit outcome: [tried/kept/reverted/declined/not applicable; verification if changed]
Reflection: [offered/answered/declined/already covered — personal answer belongs only in the ignored profile]
Activity mode: [live app and editor, explicit static fallback, focused alternative, prior practice, or recap]

## Revisions

- Moved Mermaid export from Slice 5 into Slice 4 — the learner requested graph inspection and README export together as the next integrated capability, so the remaining final slice is focused on demo polish and failure handling.
- Gemini summaries use a Next.js server route rather than a browser-side key — Google’s current key guidance says client-side keys are extractable; without a configured key, inspection remains available with a local summary.
