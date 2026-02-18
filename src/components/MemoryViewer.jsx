function clampInt(value, min, max, fallback) {
    const num = parseInt(value, 10);
    if (isNaN(num)) return fallback;
    return Math.max(min, Math.min(max, num));
}

export default function MemoryViewer({
    bfMemoryChunk,
    memPage,
    setMemPage,
    bfMemoryChunkSize,
    setBFMemoryChunkSize,
    memPtr,
    memSize,
    isBFRunning,
}) {
    const maxPage = Math.max(0, Math.ceil(memSize / bfMemoryChunkSize) - 1);

    function handlePrevPage() {
        setMemPage((prev) => Math.max(0, prev - 1));
    }

    function handleNextPage() {
        setMemPage((prev) => Math.min(maxPage, prev + 1));
    }

    return (
        <div className="panel memory-viewer">
            <div className="panel-header">Memory</div>

            <div className="memory-controls">
                <label className="control-group">
                    <span className="control-label">Chunk</span>
                    <input
                        type="number"
                        className="control-input control-input-sm"
                        value={bfMemoryChunkSize}
                        min={1}
                        max={500}
                        disabled={isBFRunning}
                        onChange={(e) => setBFMemoryChunkSize(e.target.value)}
                        onBlur={(e) => setBFMemoryChunkSize(clampInt(e.target.value, 1, 500, 30))}
                    />
                </label>

                <div className="memory-pagination">
                    <button onClick={handlePrevPage} disabled={memPage <= 0} className="btn-sm">◀</button>
                    <input
                        type="number"
                        className="control-input control-input-sm"
                        value={memPage}
                        min={0}
                        max={maxPage}
                        onChange={(e) => setMemPage(e.target.value)}
                        onBlur={(e) => setMemPage(clampInt(e.target.value, 0, maxPage, 0))}
                    />
                    <span className="page-info">/ {maxPage}</span>
                    <button onClick={handleNextPage} disabled={memPage >= maxPage} className="btn-sm">▶</button>
                </div>
            </div>

            <div className="memory-grid">
                {bfMemoryChunk.map((cell, index) => {
                    const globalIndex = index + memPage * bfMemoryChunkSize;
                    const isActive = globalIndex === memPtr;
                    return (
                        <div
                            key={index}
                            className={`memory-cell ${isActive ? "active" : ""}`}
                            title={`[${globalIndex}]`}
                        >
                            {cell}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
