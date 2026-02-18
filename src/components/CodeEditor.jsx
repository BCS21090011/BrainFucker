export default function CodeEditor({ bfCode, onCodeChange, disabled }) {
    return (
        <div className="panel code-editor">
            <div className="panel-header">Code Editor</div>
            <textarea
                className="code-textarea"
                placeholder="Enter Brainfuck code here..."
                value={bfCode}
                onChange={(e) => onCodeChange(e.target.value)}
                disabled={disabled}
                spellCheck={false}
            />
        </div>
    );
}
