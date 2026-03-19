export type CssVariables = Record<string, string>;
export type ThemeUpdates = { light?: CssVariables; dark?: CssVariables };

/**
 * Updates CSS custom properties in a shadcn-style CSS file.
 * - light → :root block
 * - dark  → .dark block
 * Adds missing variables, preserves all formatting and indentation.
 */
export function updateCssVariables(css: string, updates: ThemeUpdates): string {
    let result = css;
    if (updates.light) result = updateBlock(result, ':root', updates.light);
    if (updates.dark) result = updateBlock(result, '.dark', updates.dark);
    return result;
}

// ─── Internal ────────────────────────────────────────────────────────────────

function updateBlock(css: string, selector: string, vars: CssVariables): string {
    const { start, openBrace, closeBrace } = findTopLevelBlock(css, selector);

    // Block doesn't exist → append it
    if (start === -1) {
        const indent = detectIndent(css);
        const lines = Object.entries(vars)
            .map(([k, v]) => `${indent}${k}: ${v};`)
            .join('\n');
        const suffix = css.endsWith('\n') ? '' : '\n';
        return `${css}${suffix}\n${selector} {\n${lines}\n}\n`;
    }

    const inner = css.slice(openBrace + 1, closeBrace);
    const updatedInner = updateBlockContent(inner, vars);

    return css.slice(0, openBrace + 1) + updatedInner + css.slice(closeBrace);
}

function updateBlockContent(content: string, vars: CssVariables): string {
    const pending = { ...vars };

    // Replace existing variables, preserving indent + colon spacing + inline comments
    //   captures: (indent)(--name)(colon+spaces)(value)(trailing: ; and optional comment)
    const varRe =
        /(^[ \t]*)(--[\w-]+)([ \t]*:[ \t]*)([^;]+?)([ \t]*;[ \t]*(?:\/\*[^*]*\*+(?:[^/*][^*]*\*+)*\/)?[ \t]*$)/gm;

    let result = content.replace(varRe, (match, indent, name, colon, _value, tail) => {
        if (name in pending) {
            const newValue = pending[name];
            delete pending[name];
            return `${indent}${name}${colon}${newValue}${tail}`;
        }
        return match;
    });

    // Append missing variables — detect indent from existing vars or fall back
    if (Object.keys(pending).length > 0) {
        const indent = detectBlockIndent(content);
        const newLines = Object.entries(pending)
            .map(([k, v]) => `${indent}${k}: ${v};`)
            .join('\n');

        // Insert before the final newline so the closing `}` stays on its own line
        if (result.endsWith('\n')) {
            result = `${result}${newLines}\n`;
        } else {
            result = `${result}\n${newLines}\n`;
        }
    }

    return result;
}

/**
 * Finds a top-level CSS block by selector.
 * "Top-level" means not nested inside another block (e.g. not inside @theme).
 */
function findTopLevelBlock(
    css: string,
    selector: string,
): { start: number; openBrace: number; closeBrace: number } {
    const NOT_FOUND = { start: -1, openBrace: -1, closeBrace: -1 };

    // Match `selector` followed by optional whitespace/comments then `{`
    // The selector could be `:root` or `.dark` — escape for regex
    const selectorRe = new RegExp(
        `(?:^|[^\\w-])(${escapeRegex(selector)})(\\s*(?:\\/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)*\\/\\s*)*)\\{`,
        'gm',
    );

    let m: RegExpExecArray | null;
    while ((m = selectorRe.exec(css)) !== null) {
        const matchStart = m.index + (css[m.index] === selector[0] ? 0 : 1); // skip leading non-word char

        // Ensure this selector is at top level: equal open/close braces before it
        const before = css.slice(0, m.index);
        const depth = braceDepth(before);
        if (depth !== 0) continue;

        // Find the opening brace position
        const openBrace = css.indexOf('{', m.index + m[1]!.length);

        // Walk forward to find the matching closing brace
        let d = 0;
        let closeBrace = -1;
        for (let i = openBrace; i < css.length; i++) {
            const ch = css[i];
            // Skip strings (unlikely in CSS vars block but be safe)
            if (ch === '"' || ch === "'") {
                i = skipString(css, i);
                continue;
            }
            // Skip comments
            if (ch === '/' && css[i + 1] === '*') {
                i = skipComment(css, i);
                continue;
            }
            if (ch === '{') d++;
            else if (ch === '}') {
                d--;
                if (d === 0) {
                    closeBrace = i;
                    break;
                }
            }
        }

        if (closeBrace === -1) return NOT_FOUND; // malformed
        return { start: matchStart, openBrace, closeBrace };
    }

    return NOT_FOUND;
}

function braceDepth(s: string): number {
    let depth = 0;
    let i = 0;
    while (i < s.length) {
        if (s[i] === '/' && s[i + 1] === '*') {
            i = skipComment(s, i) + 1;
            continue;
        }
        if (s[i] === '"' || s[i] === "'") {
            i = skipString(s, i) + 1;
            continue;
        }
        if (s[i] === '{') depth++;
        else if (s[i] === '}') depth--;
        i++;
    }
    return depth;
}

function skipComment(css: string, i: number): number {
    const end = css.indexOf('*/', i + 2);
    return end === -1 ? css.length : end + 1;
}

function skipString(css: string, i: number): number {
    const quote = css[i];
    i++;
    while (i < css.length) {
        if (css[i] === '\\') {
            i += 2;
            continue;
        }
        if (css[i] === quote) return i;
        i++;
    }
    return i;
}

/** Detect indent used inside a block by looking at existing var lines */
function detectBlockIndent(content: string): string {
    const m = content.match(/^([ \t]+)--/m);
    return m ? m[1]! : '    ';
}

/** Detect indent used in the overall file */
function detectIndent(css: string): string {
    const m = css.match(/^([ \t]+)--/m);
    return m ? m[1]! : '    ';
}

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
