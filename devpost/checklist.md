---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn

## Slices

- [ ] **1. App shell and empty-state dashboard**
  Becomes usable: The app opens as a polished dark-mode workspace with header, left panel, empty graph canvas, and empty inspector state.
  Why now: This establishes the project shell and the viewer experience first, so the upload and graph flow has a clear place to land.
  PRD ref: `prd.md > Screens and Layout`, `prd.md > Features and Behavior > Upload, Setup, and Demo Experience`
  Spec ref: `spec.md > Components`, `spec.md > File Structure`, `spec.md > Look and Feel`
  Build: Scaffold the Next.js app, add Tailwind styling, create the full 3-panel dashboard layout, implement the hero upload state and demo button, and add the empty node inspector placeholder.
  Verify (mechanical): Run the app locally and confirm the dashboard renders without runtime errors and the layout matches the intended screen structure.
  Learner check: Open the app and confirm the landing screen looks like a dark-mode developer workspace with the upload prompt and empty canvas.
  Commit: `Create dashboard shell and empty state`

- [ ] **2. Upload, demo load, and parsing state**
  Becomes usable: The user can upload a ZIP or folder and see a parsing/loading state, or click a demo button to simulate the project-loading flow.
  Why now: The app needs a real input path before the graph can be generated, and this slice proves the upload workflow is working.
  PRD ref: `prd.md > Features and Behavior > Upload, Setup, and Demo Experience`
  Spec ref: `spec.md > Components > Upload Drop Zone`, `spec.md > Data Model`
  Build: Add file upload handling, drag-and-drop drop zone, demo repo trigger, and parsing progress UI with a JSZip-based project scan flow.
  Verify (mechanical): Upload a sample archive and confirm the app reaches the parsing state and transitions to the graph-ready state without crashing.
  Learner check: Try the upload flow or demo button and confirm the app clearly communicates loading progress and loading completion.
  Commit: `Add upload flow and parser loading state`

- [ ] **3. Graph render and node/edge generation**
  Becomes usable: A visible architecture graph appears based on parsed project files, with color-coded nodes and edges.
  Why now: This is the unique kernel of the product and should appear early enough to be the wow moment of the demo.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Features and Behavior > Architecture Visualization`
  Spec ref: `spec.md > Components > Graph Canvas`, `spec.md > Data Model`
  Build: Build the graph model from parsed imports/exports, classify nodes into UI, state, API, and utilities, render them in React Flow, and display node/edge counts in the header.
  Verify (mechanical): Parse a sample project and confirm the graph renders with visible node and edge counts and no console errors.
  Learner check: Upload a project and confirm the graph appears as a clear architecture map rather than a blank canvas.
  Commit: `Render interactive architecture graph`

- [ ] **4. Graph filtering and node inspection**
  Becomes usable: The user can toggle layers and select a node to open the inspector drawer with metadata and a summary.
  Why now: This gives the user the main analytical value of the app and closes the core loop around understanding a project.
  PRD ref: `prd.md > Features and Behavior > Layer Filtering and Layout Controls`, `prd.md > Features and Behavior > Node Inspection`
  Spec ref: `spec.md > Components > Semantic Layer Filters`, `spec.md > Components > Node Inspector`
  Build: Add semantic layer toggles, graph layout switching, selected-node highlight logic, inspector panel content, and a short AI summary fallback path.
  Verify (mechanical): Select a node, confirm the inspector panel opens and the related node highlight and edge emphasis behave as intended.
  Learner check: Click a node and verify the selected item focuses and the inspector shows useful architecture information.
  Commit: `Add filtering and node inspector`

- [ ] **5. Mermaid export and final polish**
  Becomes usable: The export button works on a loaded graph and copies Mermaid code for GitHub README use.
  Why now: It completes the primary documentation workflow and makes the app demo-ready for a judges’ or user’s final review.
  PRD ref: `prd.md > Features and Behavior > Export to Mermaid`
  Spec ref: `spec.md > Components > Mermaid Export Module`, `spec.md > Important Failure Modes`
  Build: Generate Mermaid graph text from the current graph model, connect the export action to clipboard flow, and polish edge cases such as empty states and failed summaries.
  Verify (mechanical): Load a graph and confirm the Mermaid output is valid and visible in the UI, then copy it and confirm it is usable as Markdown.
  Learner check: Export the graph and confirm the output is valid and ready to paste into documentation.
  Commit: `Ship Mermaid export and polish demo flow`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 2 or slice 3, depending on user feedback
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
