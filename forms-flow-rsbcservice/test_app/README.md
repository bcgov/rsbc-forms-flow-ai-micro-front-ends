# RSBCImage Test App

A minimal standalone React app for testing the `RSBCImage` form.io custom component.

## Prerequisites

The parent package `forms-flow-rsbcservice` must have its node_modules installed,
because the test app resolves most dependencies (React, lodash, moment, etc.) from
the parent directory to avoid version conflicts.

```bash
# From forms-flow-rsbcservice/
npm install
```

## Setup & Run

```bash
cd test_app
npm install       # installs webpack, babel, and loaders locally
npm start         # starts dev server on http://localhost:3001
```

The browser opens automatically at `http://localhost:3001`.

## Build (production bundle)

```bash
npm run build     # outputs to test_app/dist/
```

## What the app does

| Panel | Purpose |
|-------|---------|
| Left — Stage | Select `stageOne` or `stageTwo` |
| Left — Builder Mode | Toggles `builderMode` (preview panel simulation) |
| Left — Form Data | Editable JSON that becomes `RSBCImage.data` |
| Left — RSBC Image Settings | Editable JSON for `component.rsbcImageSettings` (field-mapping config). Set to `null` to pass form data through unchanged. |
| **Render Component** button | Commits settings and re-mounts `RSBCImage` via `attachReact()` |
| Actions bar — **Print** | Calls `RSBCImage.handlePrint()` (shows confirmation dialog) |
| Actions bar — **Submission Print** | Calls `RSBCImage.handleSubmissionPrint()` (no dialog) |
| Actions bar — **Get Base64 Images** | Calls `RSBCImage.getBase64Images()` and logs keys to the output panel and browser console |
| Output log | Timestamped action log |

## Mocked dependencies

| Module | Reason |
|--------|--------|
| `@aot-technologies/formio-react` | Provides a lightweight `ReactComponent` base class; avoids formio runtime initialisation |
| `@aot-technologies/formiojs` | Only used by the builder settings form, not needed for rendering |
| `formsflow-rsbcservices` | `OfflineFetchService.fetchStaticDataFromTable` returns `[]` instead of querying IndexedDB |

## Project structure

```
test_app/
├── index.html
├── package.json
├── webpack.config.js
├── tsconfig.json
└── src/
    ├── index.tsx               # React entry point
    ├── App.tsx                 # Main UI (left config panel + right preview)
    ├── sampleData.ts           # Default form data and component settings
    ├── components/
    │   └── RSBCImageWrapper.tsx  # Instantiates RSBCImage and wires up DOM ref
    └── mocks/
        ├── formio-react.ts     # Mock ReactComponent base class
        ├── formiojs.ts         # Mock baseEditForm
        └── rsbcServices.ts     # Mock OfflineFetchService
```
