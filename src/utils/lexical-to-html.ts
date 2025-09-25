import DOMPurify from "dompurify";

export function lexicalToHtml(serializedState) {
    function getFormatStyle(format) {
        let style = "";
        if (!format) return style;
        // Lexical uses bit flags for format
        // 1: bold, 2: italic, 4: underline, 8: strikethrough, etc.
        if (format & 1) style += "font-weight:bold;";
        if (format & 2) style += "font-style:italic;";
        if (format & 4) style += "text-decoration:underline;";
        if (format & 8) style += "text-decoration:line-through;";
        return style;
    }

    function mergeStyles(style1, style2) {
        // Merge two style strings, style2 takes precedence
        const styleObj = {};
        for (const s of (style1 || "").split(";")) {
            const [k, v] = s.split(":").map(x => x && x.trim());
            if (k && v) styleObj[k] = v;
        }
        for (const s of (style2 || "").split(";")) {
            const [k, v] = s.split(":").map(x => x && x.trim());
            if (k && v) styleObj[k] = v;
        }
        return Object.entries(styleObj).map(([k, v]) => `${k}:${v}`).join(";");
    }

    function renderTextNode(textNode) {
        const formatStyle = getFormatStyle(textNode.format);
        const style = mergeStyles(formatStyle, textNode.style || '');
        let text = textNode.text || '';
        // Escape HTML special chars
        text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
        if (style) {
            return `<span style="${style}">${text}</span>`;
        } else {
            return text;
        }
    }

    function parseChildren(children) {
        let html = '';
        for (const node of children) {
            if (node.type === 'text') {
                html += renderTextNode(node);
            } else if (node.type === 'code-highlight') {
                // Handle new Lexical code highlighting nodes
                let text = node.text || '';
                const highlightType = node.highlightType;

                // Escape HTML special chars in the text
                text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

                if (highlightType) {
                    // Wrap in span with token class for syntax highlighting
                    html += `<span class="token ${highlightType}">${text}</span>`;
                } else {
                    // Plain text within code block
                    html += text;
                }
            } else if (node.type === 'linebreak') {
                // Handle line breaks in code blocks
                html += '\n';
            } else if (node.type === 'code') {
                let content = '';

                // For @lexical/code nodes with code-highlight children
                if (node.children && node.children.length > 0) {
                    // Recursively parse children to build the formatted code content
                    content = parseChildren(node.children);
                } else if (node.text) {
                    // Handle case where text is directly on the code node (fallback)
                    content = node.text
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#x27;');
                } else {
                    content = '';
                }

                const language = node.language || '';
                const languageClass = language ? ` class="language-${language}"` : '';
                html += `<pre class="editor-code-block"><code${languageClass}>${content}</code></pre>`;
            } else if (node.type === 'autolink' || node.type === 'link') {
                let content = node.children ? parseChildren(node.children) : '';
                let url = node.url || node.href || content || '#';
                let attrs = ` href="${url}" target="_blank" `;
                html += `<a ${attrs} >${content}</a>`;
            } else if (node.type === 'listitem') {
                let itemContent = node.children ? parseChildren(node.children) : '';
                html += `<li>${itemContent}</li>`;
            } else if (node.type === 'list') {
                const listTag = node.tag || (node.listType === 'number' ? 'ol' : 'ul');
                let listContent = node.children ? parseChildren(node.children) : '';
                html += `<${listTag}>${listContent}</${listTag}>`;
            } else if (node.type === 'heading') {
                let content = node.children ? parseChildren(node.children) : '';
                const tag = node.tag || 'h3';
                html += `<${tag}>${content}</${tag}>`;
            } else if (node.type === 'quote') {
                let content = node.children ? parseChildren(node.children) : '';
                html += `<blockquote>${content}</blockquote>`;
            } else if (node.type === 'paragraph') {
                let content = node.children ? parseChildren(node.children) : '';
                if (content.trim()) {
                    html += `<p>${content}</p>`;
                } else {
                    html += '<br>';
                }
            } else if (node.type === 'table') {
                let tableContent = node.children ? parseChildren(node.children) : '';
                html += `<table class="editor-table">${tableContent}</table>`;
            } else if (node.type === 'tablerow') {
                let rowContent = node.children ? parseChildren(node.children) : '';
                html += `<tr>${rowContent}</tr>`;
            } else if (node.type === 'tablecell') {
                let cellContent = node.children ? parseChildren(node.children) : '';
                const tag = node.headerState === 1 ? 'th' : 'td';
                let attrs = '';

                if (node.colSpan && node.colSpan > 1) {
                    attrs += ` colspan="${node.colSpan}"`;
                }
                if (node.rowSpan && node.rowSpan > 1) {
                    attrs += ` rowspan="${node.rowSpan}"`;
                }
                if (node.backgroundColor) {
                    attrs += ` style="background-color:${node.backgroundColor}"`;
                }

                html += `<${tag}${attrs}>${cellContent}</${tag}>`;
            }
        }
        return html;
    }

    // Defensive check for root and children
    if (
        !serializedState ||
        !serializedState.root ||
        !Array.isArray(serializedState.root.children)
    ) {
        return "";
    }

    // Sanitize output before returning
    return DOMPurify.sanitize(parseChildren(serializedState.root.children));
}