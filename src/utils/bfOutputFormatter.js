const ASCII_CONTROL_NAMES = [
    "NUL", "SOH", "STX", "ETX", "EOT", "ENQ", "ACK", "BEL",
    "BS", "HT", "LF", "VT", "FF", "CR", "SO", "SI",
    "DLE", "DC1", "DC2", "DC3", "DC4", "NAK", "SYN", "ETB",
    "CAN", "EM", "SUB", "ESC", "FS", "GS", "RS", "US",
];

/**
 * Format an invalid/unprintable character for display based on the selected mode.
 * @param {number} codePoint
 * @param {string} mode - One of: "corrupted", "code", "dec", "hex", "oct", "bin", "escaped", "named"
 * @returns {string}
 */
function formatInvalidChar(codePoint, mode) {
    switch (mode) {
        case "code":
            if (codePoint < 128) return `[CTRL ${codePoint}]`;
            return `[U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}]`;

        case "dec":
            return codePoint.toString(10);

        case "hex":
            return `0x${codePoint.toString(16).toUpperCase()}`;

        case "oct":
            return `0o${codePoint.toString(8)}`;

        case "bin":
            return `0b${codePoint.toString(2)}`;

        case "escaped":
            if (codePoint <= 0xFF) return `\\x${codePoint.toString(16).toUpperCase().padStart(2, "0")}`;
            if (codePoint <= 0xFFFF) return `\\u${codePoint.toString(16).toUpperCase().padStart(4, "0")}`;
            return `\\u{${codePoint.toString(16).toUpperCase()}}`;

        case "named":
            if (codePoint < 32) return `[${ASCII_CONTROL_NAMES[codePoint]}]`;
            if (codePoint === 127) return "[DEL]";
            return `[U+${codePoint.toString(16).toUpperCase().padStart(4, "0")}]`;

        case "corrupted":
        default:
            return "\uFFFD";
    }
}

/**
 * Convert a BF output integer to a terminal-safe string.
 * Returns { output: string, isInvalid: boolean }.
 */
export function formatBFOutput(outputInt, mode = "corrupted") {
    // Allow common control characters
    if (outputInt === 10) return { output: "\n", isInvalid: false };
    if (outputInt === 13) return { output: "\r", isInvalid: false };
    if (outputInt === 9) return { output: "\t", isInvalid: false };
    if (outputInt === 8) return { output: "\b", isInvalid: false };

    // Reject C0 controls
    if (outputInt < 32) {
        return { output: formatInvalidChar(outputInt, mode), isInvalid: true };
    }

    // Reject DEL and C1 controls
    if (outputInt === 127 || (outputInt >= 128 && outputInt <= 159)) {
        return { output: formatInvalidChar(outputInt, mode), isInvalid: true };
    }

    // Reject invalid Unicode scalars
    if (outputInt > 0x10FFFF || (outputInt >= 0xD800 && outputInt <= 0xDFFF)) {
        return { output: formatInvalidChar(outputInt, mode), isInvalid: true };
    }

    // Safe printable Unicode
    return { output: String.fromCodePoint(outputInt), isInvalid: false };
}

export const DISPLAY_MODES = [
    { value: "corrupted", label: "\uFFFD Corrupted" },
    { value: "code", label: "[CTRL] Code" },
    { value: "dec", label: "Dec" },
    { value: "hex", label: "Hex" },
    { value: "oct", label: "Oct" },
    { value: "bin", label: "Bin" },
    { value: "escaped", label: "\\x Escaped" },
    { value: "named", label: "[NUL] Named" },
];

export const INPUT_MODES = [
    { value: "keypress", label: "Key Press" },
    { value: "getchar", label: "getchar()" },
];
