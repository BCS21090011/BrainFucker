import { forwardRef, useRef, useEffect, useImperativeHandle } from "react";
import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";

const TerminalPanel = forwardRef(function TerminalPanel(
    { onData, inputBuffer, onInputBufferChange, showInputBuffer },
    ref
) {
    const containerRef = useRef(null);
    const terminalRef = useRef(null);
    const onDataRef = useRef(onData);

    // Always keep the latest onData callback
    useEffect(() => {
        onDataRef.current = onData;
    });

    useImperativeHandle(ref, () => ({
        write: (text) => terminalRef.current?.write(text),
        reset: () => terminalRef.current?.reset(),
        setCursorBlink: (val) => {
            if (terminalRef.current) terminalRef.current.options.cursorBlink = val;
        },
        focus: () => containerRef.current?.focus(),
    }));

    useEffect(() => {
        const terminal = new Terminal();
        terminal.open(containerRef.current);
        terminal.options.cursorBlink = false;
        terminal.options.autoWrap = true;
        terminal.onData((data) => onDataRef.current(data));
        terminalRef.current = terminal;

        return () => terminal.dispose();
    }, []);

    return (
        <div className="panel terminal-panel">
            <div className="panel-header">Terminal</div>
            <div className="terminal-wrapper" ref={containerRef} />
            {showInputBuffer && (
                <div className="input-buffer-container">
                    <label className="control-label">Input Buffer</label>
                    <textarea
                        className="input-buffer-textarea"
                        value={inputBuffer}
                        onChange={(e) => onInputBufferChange(e.target.value)}
                        placeholder="Pre-load input characters..."
                        rows={2}
                    />
                </div>
            )}
        </div>
    );
});

export default TerminalPanel;
