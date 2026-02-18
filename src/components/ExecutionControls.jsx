import { DISPLAY_MODES, INPUT_MODES } from "../utils/bfOutputFormatter";

function clampInt(value, min, max, fallback) {
    const num = parseInt(value, 10);
    if (isNaN(num)) return fallback;
    return Math.max(min, Math.min(max, num));
}

export default function ExecutionControls({
    isBFRunning,
    isBFPaused,
    onRunStop,
    onContinuePause,
    onStepOnce,
    onReset,
    codeExecIntervalMS,
    setCodeExecIntervalMS,
    bfMemorySize,
    setBFMemorySize,
    maxMemorySize,
    inputMode,
    setInputMode,
    displayMode,
    setDisplayMode,
    executionCount,
}) {
    return (
        <div className="panel execution-controls">
            <div className="controls-row controls-buttons">
                <button onClick={onRunStop} className={isBFRunning ? "btn-danger" : "btn-primary"}>
                    {isBFRunning ? "■ Stop" : "▶ Run"}
                </button>
                <button onClick={onContinuePause} disabled={!isBFRunning}
                    className={isBFPaused ? "btn-success" : "btn-warning"}>
                    {isBFPaused ? "▶ Continue" : "⏸ Pause"}
                </button>
                <button onClick={onStepOnce} className="btn-secondary">
                    ⏭ Step
                </button>
                <button onClick={onReset} disabled={!isBFPaused && isBFRunning} className="btn-secondary">
                    ↺ Reset
                </button>
                <span className="exec-counter" title="Execution Count">
                    Steps: {executionCount}
                </span>
            </div>

            <div className="controls-row controls-settings">
                <label className="control-group">
                    <span className="control-label">Interval (ms)</span>
                    <input
                        type="number"
                        className="control-input"
                        value={codeExecIntervalMS}
                        min={1}
                        max={10000}
                        onChange={(e) => setCodeExecIntervalMS(e.target.value)}
                        onBlur={(e) => setCodeExecIntervalMS(clampInt(e.target.value, 1, 10000, 10))}
                    />
                </label>

                <label className="control-group">
                    <span className="control-label">Memory Size</span>
                    <input
                        type="number"
                        className="control-input"
                        value={bfMemorySize}
                        min={1}
                        max={maxMemorySize}
                        disabled={isBFRunning}
                        onChange={(e) => setBFMemorySize(e.target.value)}
                        onBlur={(e) => setBFMemorySize(clampInt(e.target.value, 1, maxMemorySize, 3000))}
                    />
                </label>

                <label className="control-group">
                    <span className="control-label">Input Mode</span>
                    <select
                        className="control-select"
                        value={inputMode}
                        onChange={(e) => setInputMode(e.target.value)}
                        disabled={isBFRunning}
                    >
                        {INPUT_MODES.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </label>

                <label className="control-group">
                    <span className="control-label">Display Mode</span>
                    <select
                        className="control-select"
                        value={displayMode}
                        onChange={(e) => setDisplayMode(e.target.value)}
                        disabled={isBFRunning}
                    >
                        {DISPLAY_MODES.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </label>
            </div>
        </div>
    );
}
