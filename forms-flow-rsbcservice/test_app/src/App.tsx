import React, { useState, useRef, useCallback } from "react";
import RSBCImageWrapper, {
  RSBCImageWrapperRef,
} from "./components/RSBCImageWrapper";
import { sampleData, sampleComponentSettings } from "./sampleData";

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const S = {
  root: {
    fontFamily: "Arial, sans-serif",
    height: "100vh",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
    background: "#fff",
  },
  header: {
    background: "#003366",
    color: "#fff",
    padding: "10px 20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexShrink: 0,
  },
  headerTitle: { margin: 0, fontSize: "17px", fontWeight: 600 },
  body: { flex: 1, display: "flex", overflow: "hidden" },
  leftPanel: {
    width: "370px",
    minWidth: "320px",
    display: "flex",
    flexDirection: "column" as const,
    borderRight: "1px solid #ddd",
    padding: "14px",
    gap: "12px",
    overflowY: "auto" as const,
    background: "#f8f9fa",
    flexShrink: 0,
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
  },
  actionsBar: {
    display: "flex",
    gap: "8px",
    padding: "10px 14px",
    borderBottom: "1px solid #ddd",
    background: "#f0f0f0",
    flexWrap: "wrap" as const,
    alignItems: "center",
    flexShrink: 0,
  },
  actionsLabel: { fontSize: "12px", fontWeight: 600, color: "#555" },
  preview: { flex: 1, overflow: "auto", padding: "16px", background: "#fff" },
  outputPanel: {
    height: "160px",
    borderTop: "1px solid #ddd",
    padding: "8px 12px",
    background: "#1e1e1e",
    color: "#d4d4d4",
    fontFamily: "monospace",
    fontSize: "12px",
    overflowY: "auto" as const,
    whiteSpace: "pre" as const,
    flexShrink: 0,
  },
  section: { display: "flex", flexDirection: "column" as const, gap: "5px" },
  label: { fontSize: "12px", fontWeight: 600, color: "#333" },
  textarea: {
    width: "100%",
    fontFamily: "monospace",
    fontSize: "12px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    padding: "7px",
    resize: "vertical" as const,
    boxSizing: "border-box" as const,
  },
  select: {
    padding: "6px 8px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "13px",
    background: "#fff",
  },
  error: { color: "#c0392b", fontSize: "11px" },
  divider: { border: "none", borderTop: "1px solid #ddd", margin: "4px 0" },
  primaryBtn: {
    padding: "8px 14px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
    background: "#003366",
    color: "#fff",
  },
  secondaryBtn: {
    padding: "7px 12px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    background: "#fff",
    color: "#333",
  },
  ghostBtn: {
    padding: "7px 12px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    background: "transparent",
    color: "#888",
    marginLeft: "auto",
  },
};

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
export default function App() {
  const [dataJson, setDataJson] = useState(
    JSON.stringify(sampleData, null, 2)
  );
  const [settingsJson, setSettingsJson] = useState(
    JSON.stringify(sampleComponentSettings.rsbcImageSettings, null, 2)
  );
  const [stage, setStage] = useState<string>(
    sampleComponentSettings.stage ?? "stageOne"
  );
  const [builderMode, setBuilderMode] = useState(false);

  // Parsed & committed values actually passed to RSBCImageWrapper
  const [committedData, setCommittedData] = useState<any>(sampleData);
  const [committedComponent, setCommittedComponent] = useState<any>(
    sampleComponentSettings
  );
  const [committedBuilderMode, setCommittedBuilderMode] = useState(false);
  // Key changed to force re-mount of RSBCImageWrapper on each render
  const [renderKey, setRenderKey] = useState(0);

  const [dataError, setDataError] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [outputLog, setOutputLog] = useState<string>(
    "Output will appear here...\n"
  );

  const wrapperRef = useRef<RSBCImageWrapperRef>(null);

  const log = useCallback((msg: string) => {
    setOutputLog((prev) => `[${new Date().toLocaleTimeString()}] ${msg}\n${prev}`);
  }, []);

  // ---- Render ----
  const handleRender = () => {
    let parsedData: any;
    let parsedSettings: any;

    try {
      parsedData = JSON.parse(dataJson);
      setDataError(null);
    } catch {
      setDataError("Invalid JSON");
      return;
    }

    try {
      parsedSettings = JSON.parse(settingsJson);
      setSettingsError(null);
    } catch {
      setSettingsError("Invalid JSON");
      return;
    }

    const component = { stage, rsbcImageSettings: parsedSettings };
    setCommittedData(parsedData);
    setCommittedComponent(component);
    setCommittedBuilderMode(builderMode);
    setRenderKey((k) => k + 1);
    log("Rendering RSBCImage...");
  };

  // ---- Actions ----
  const handlePrint = () => {
    log("handlePrint() called");
    wrapperRef.current?.handlePrint();
  };

  const handleSubmissionPrint = () => {
    log("handleSubmissionPrint() called");
    wrapperRef.current?.handleSubmissionPrint();
  };

  const handleGetBase64 = async () => {
    log(`getBase64Images("${committedComponent.stage}") called...`);
    try {
      const images = await wrapperRef.current?.getBase64Images(
        committedComponent.stage
      );
      if (images && Object.keys(images).length > 0) {
        log(`Base64 images ready: ${Object.keys(images).join(", ")}`);
        console.log("Base64 Images:", images);
      } else {
        log("No base64 images returned (check form data keys).");
      }
    } catch (e: any) {
      log(`Error: ${e?.message ?? e}`);
    }
  };

  return (
    <div style={S.root}>
      {/* Header */}
      <div style={S.header}>
        <span style={{ fontSize: "18px" }}>🖼</span>
        <h1 style={S.headerTitle}>RSBCImage Test App</h1>
        <span style={{ fontSize: "11px", color: "#aaa", marginLeft: "auto" }}>
          forms-flow-rsbcservice
        </span>
      </div>

      <div style={S.body}>
        {/* ---- Left panel: configuration ---- */}
        <div style={S.leftPanel}>

          {/* Stage */}
          <div style={S.section}>
            <label style={S.label}>Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              style={S.select}
            >
              <option value="stageOne">Stage One</option>
              <option value="stageTwo">Stage Two</option>
            </select>
          </div>

          {/* Builder mode */}
          <div style={S.section}>
            <label style={{ ...S.label, display: "flex", gap: "6px", alignItems: "center", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={builderMode}
                onChange={(e) => setBuilderMode(e.target.checked)}
              />
              Builder / Preview Mode
            </label>
          </div>

          <hr style={S.divider} />

          {/* Form data */}
          <div style={S.section}>
            <label style={S.label}>Form Data (JSON)</label>
            <textarea
              value={dataJson}
              onChange={(e) => {
                setDataJson(e.target.value);
                setDataError(null);
              }}
              rows={14}
              style={S.textarea}
              spellCheck={false}
            />
            {dataError && <span style={S.error}>{dataError}</span>}
          </div>

          {/* RSBC Image Settings */}
          <div style={S.section}>
            <label style={S.label}>
              RSBC Image Settings (JSON)
            </label>
            <textarea
              value={settingsJson}
              onChange={(e) => {
                setSettingsJson(e.target.value);
                setSettingsError(null);
              }}
              rows={6}
              style={S.textarea}
              placeholder="null"
              spellCheck={false}
            />
            {settingsError && <span style={S.error}>{settingsError}</span>}
            <span style={{ fontSize: "11px", color: "#777" }}>
              Set to <code>null</code> to pass form data through unchanged.
            </span>
          </div>

          <button style={S.primaryBtn} onClick={handleRender}>
            ▶ Render Component
          </button>
        </div>

        {/* ---- Right panel: preview + actions + output ---- */}
        <div style={S.rightPanel}>
          {/* Actions bar */}
          <div style={S.actionsBar}>
            <span style={S.actionsLabel}>Actions:</span>
            <button style={S.secondaryBtn} onClick={handlePrint}>
              🖨 Print
            </button>
            <button style={S.secondaryBtn} onClick={handleSubmissionPrint}>
              📄 Submission Print
            </button>
            <button style={S.secondaryBtn} onClick={handleGetBase64}>
              🖼 Get Base64 Images
            </button>
            <button
              style={S.ghostBtn}
              onClick={() => setOutputLog("Output cleared.\n")}
            >
              Clear log
            </button>
          </div>

          {/* Preview area */}
          <div style={S.preview}>
            <RSBCImageWrapper
              key={renderKey}
              ref={wrapperRef}
              data={committedData}
              component={committedComponent}
              builderMode={committedBuilderMode}
            />
          </div>

          {/* Output log */}
          <div style={S.outputPanel}>{outputLog}</div>
        </div>
      </div>
    </div>
  );
}
