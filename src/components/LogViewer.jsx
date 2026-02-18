import { useRef, useEffect, useMemo } from "react";
import { FixedSizeList } from "react-window";

function LogRow({ index, style, data }) {
    const log = data[index];
    return (
        <div style={{ ...style, color: log.textColor }} className="log-row">
            <span className="log-timestamp">{log.timestamp.toTimeString().slice(0, 8)}</span>
            <span className="log-type">{log.type}</span>
            <span className="log-text">{log.text}</span>
        </div>
    );
}

export default function LogViewer({
    logTexts,
    logShowLog, setLogShowLog,
    logShowWarning, setLogShowWarning,
    logShowError, setLogShowError,
}) {
    const listRef = useRef(null);
    const containerRef = useRef(null);

    const filteredLogs = useMemo(() => {
        return logTexts.filter((log) => {
            if (log.type === "Log" && !logShowLog) return false;
            if (log.type === "Warning" && !logShowWarning) return false;
            if (log.type === "Error" && !logShowError) return false;
            return true;
        });
    }, [logTexts, logShowLog, logShowWarning, logShowError]);

    // Auto-scroll to bottom on new entries
    useEffect(() => {
        if (listRef.current && filteredLogs.length > 0) {
            listRef.current.scrollToItem(filteredLogs.length - 1);
        }
    }, [filteredLogs.length]);

    return (
        <div className="panel log-viewer">
            <div className="panel-header">
                Logs
                <span className="log-count">({filteredLogs.length})</span>
            </div>
            <div className="log-filters">
                <label className="log-filter-label">
                    <input type="checkbox" checked={logShowLog}
                        onChange={(e) => setLogShowLog(e.target.checked)} />
                    <span style={{ color: "white" }}>Log</span>
                </label>
                <label className="log-filter-label">
                    <input type="checkbox" checked={logShowWarning}
                        onChange={(e) => setLogShowWarning(e.target.checked)} />
                    <span style={{ color: "yellow" }}>Warn</span>
                </label>
                <label className="log-filter-label">
                    <input type="checkbox" checked={logShowError}
                        onChange={(e) => setLogShowError(e.target.checked)} />
                    <span style={{ color: "#ff6b6b" }}>Error</span>
                </label>
            </div>
            <div className="log-list-container" ref={containerRef}>
                <FixedSizeList
                    ref={listRef}
                    height={300}
                    width="100%"
                    itemCount={filteredLogs.length}
                    itemSize={24}
                    itemData={filteredLogs}
                >
                    {LogRow}
                </FixedSizeList>
            </div>
        </div>
    );
}
