import "@/styles/editor-styles.css";
import { lexicalToHtml } from './lexical-to-html';
import { useEffect, useRef } from 'react';

const lexicalToHtmlWithLinks = (parsedContent) => {
    let html = lexicalToHtml(parsedContent);
    // Fallback: If the output still contains autolink/link nodes as plain text, patch them
    // (This is a simple post-process for missed links)
    // If lexicalToHtml already supports them, this will have no effect
    // Try to find URLs and wrap them in <a> tags
    html = html.replace(/(https?:\/\/[\w\-._~:/?#[\]@!$&'()*+,;=%]+)(?![^<]*>)/g, (url) => {
        // Avoid double-wrapping if already inside an <a>
        if (/<a [^>]*?>.*$/.test(url)) return url;
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
    return html;
};

const TextEditorDesc = ({ content }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        // Add copy button functionality with better event delegation
        const handleCopyClick = async (event) => {
            // Check if the clicked element is a copy button
            if (!event.target.closest('.code-copy-btn')) return;

            event.preventDefault();
            const button = event.target.closest('.code-copy-btn');
            const codeWrapper = button.closest('.code-block-wrapper');
            const codeBlock = codeWrapper?.querySelector('code');

            if (codeBlock && navigator.clipboard) {
                try {
                    // Extract text from code block, handling nested spans for syntax highlighting
                    const extractText = (element) => {
                        let text = '';
                        for (const child of element.childNodes) {
                            if (child.nodeType === Node.TEXT_NODE) {
                                text += child.textContent;
                            } else if (child.nodeType === Node.ELEMENT_NODE) {
                                if (child.tagName === 'BR') {
                                    text += '\n';
                                } else {
                                    text += extractText(child);
                                }
                            }
                        }
                        return text;
                    };

                    // Extract text and remove trailing newlines and <br> tags
                    let textContent = extractText(codeBlock);
                    // Remove trailing <br> tags first, then trailing newlines and spaces
                    textContent = textContent
                        .replace(/(<br\s*\/?>|\n|\r\n|\r|\s)*$/gi, '')
                        .replace(/^(\s|\n|\r\n|\r)*/, ''); // Also clean leading whitespace
                    await navigator.clipboard.writeText(textContent);

                    // Visual feedback
                    const originalText = button.innerHTML;
                    button.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                        Copied!
                    `;
                    button.style.color = '#059669';

                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.style.color = '';
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy text: ', err);

                    // Fallback visual feedback for error
                    const originalText = button.innerHTML;
                    button.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" fill="none"/>
                        </svg>
                        Error!
                    `;
                    button.style.color = '#dc2626';

                    setTimeout(() => {
                        button.innerHTML = originalText;
                        button.style.color = '';
                    }, 2000);
                }
            }
        };

        if (containerRef.current) {
            // Use event delegation for better performance and reliability
            containerRef.current.addEventListener('click', handleCopyClick);

            return () => {
                if (containerRef.current) {
                    containerRef.current.removeEventListener('click', handleCopyClick);
                }
            };
        }
    }, [content]);

    if (!content) return null;

    const isLexicalJSON = (value) => {
        try {
            const parsed = JSON.parse(value);
            return parsed && parsed.root && parsed.root.type === "root";
        } catch {
            return false;
        }
    };

    const isHTML = (value) => {
        return typeof value === 'string' && value.includes('<') && value.includes('>');
    };

    // Enhanced HTML processing with proper code formatting preservation
    const processCodeBlocks = (html) => {
        return html.replace(
            /<pre class="editor-code-block"><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g,
            (match, attrs, code) => {
                const languageMatch = attrs.match(/class="language-(\w+)"/);
                const language = languageMatch ? languageMatch[1] : 'plaintext';

                // Don't decode if the code already contains syntax highlighting spans
                let processedCode = code;
                if (!code.includes('<span class="token')) {
                    // Only decode HTML entities if not already highlighted
                    processedCode = code
                        .replace(/&amp;/g, '&')
                        .replace(/&lt;/g, '<')
                        .replace(/&gt;/g, '>')
                        .replace(/&quot;/g, '"')
                        .replace(/&#x27;/g, "'");
                }

                return `
                    <div class="code-block-wrapper" data-language="${language}">
                        <div class="code-block-header">
                            <span class="code-language">${language}</span>
                            <div class="code-actions">
                                <button class="code-copy-btn" type="button" title="Copy Code" data-code-copy>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2" fill="none"/>
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2" fill="none"/>
                                    </svg>
                                    Copy
                                </button>
                            </div>
                        </div>
                        <pre class="language-${language}"><code class="language-${language}">${processedCode}</code></pre>
                    </div>
                `;
            }
        );
    };

    let htmlContent = '';

    try {
        if (isLexicalJSON(content)) {
            // Convert Lexical JSON to HTML
            const parsedContent = JSON.parse(content);
            htmlContent = lexicalToHtmlWithLinks(parsedContent);
        } else if (isHTML(content)) {
            // Already HTML, use as is
            htmlContent = content;
        } else {
            // Plain text, wrap in paragraph
            htmlContent = `<p>${content}</p>`;
        }

        // Process code blocks for enhanced styling
        htmlContent = processCodeBlocks(htmlContent);

        // Remove trailing <br> tags from the final HTML content (only at the end)
        htmlContent = htmlContent.replace(/(<br\s*\/?>)+$/gi, '').trim();
    } catch (error) {
        console.error('Error processing content:', error);
        // Fallback to plain text
        htmlContent = `<p>${content}</p>`;
    }

    return (
        <div
            ref={containerRef}
            className="prose prose-sm max-w-none text-editor-content editor-content"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    );
};

// New function to extract plain text from editor content
export const extractTextFromContent = (content) => {
    if (!content) return '';

    const isLexicalJSON = (value) => {
        try {
            const parsed = JSON.parse(value);
            return parsed && parsed.root && parsed.root.type === "root";
        } catch {
            return false;
        }
    };

    const isHTML = (value) => {
        return typeof value === 'string' && value.includes('<') && value.includes('>');
    };

    try {
        if (isLexicalJSON(content)) {
            // Extract text from Lexical JSON
            const parsedContent = JSON.parse(content);
            const extractTextFromNode = (node) => {
                if (!node) return '';

                if (node.type === 'text') {
                    return node.text || '';
                }

                if (node.children && Array.isArray(node.children)) {
                    return node.children.map(extractTextFromNode).join(' ');
                }

                return '';
            };

            return extractTextFromNode(parsedContent.root);
        } else if (isHTML(content)) {
            // Strip HTML tags
            return content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        } else {
            // Already plain text
            return content.trim();
        }
    } catch (error) {
        console.error('Error extracting text from content:', error);
        return content ? content.toString().trim() : '';
    }
};

export default TextEditorDesc;