import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; 
import rehypeHighlight from 'rehype-highlight';
// import 'highlight.js/styles/atom-one-dark.css';
import 'highlight.js/styles/github.css';
interface MarkdownRendererProps {
    content: string;
}


const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
        >
            {content}
        </ReactMarkdown>

    );
};
export default MarkdownRenderer;
