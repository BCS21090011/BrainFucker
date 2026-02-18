import { useMemo } from "react";

export default function CodeViewer({ bfExecuter, cIndex, strippedBFCode }) {
    const loopLevels = useMemo(() => {
        const code = bfExecuter?.BFCode || "";
        const levels = [];
        let level = 0;
        for (const char of code) {
            if (char === "[") { levels.push(level); level++; }
            else if (char === "]") { level--; levels.push(level); }
            else { levels.push(level); }
        }
        return levels;
    }, [strippedBFCode]);

    const loopLevelColors = ["yellow", "magenta", "cyan"];

    function charStyle(index) {
        if (!bfExecuter) return {};

        const style = {};
        const char = bfExecuter.BFCode[index];
        const loopPairs = bfExecuter.LoopPairs;
        const leftOutLoops = bfExecuter.LeftOutLoops;

        if (char === "[" || char === "]") {
            style.color = loopLevelColors[loopLevels[index] % loopLevelColors.length];
        }

        if (loopPairs[cIndex] === index) {
            style.border = "1px solid white";
        }

        if (leftOutLoops.includes(index)) {
            style.backgroundColor = "red";
            style.color = "white";
        }

        if (index === cIndex) {
            style.backgroundColor = "yellow";
            style.color = "black";
        }

        return style;
    }

    return (
        <div className="panel code-viewer">
            <div className="panel-header">Code Viewer</div>
            <div className="code-viewer-content">
                {bfExecuter?.BFCode.split("").map((char, index) => (
                    <span key={index} style={charStyle(index)} className="code-char">
                        {char}
                    </span>
                ))}
            </div>
        </div>
    );
}
