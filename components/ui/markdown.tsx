'use client';

import React, { FC, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { Copy, Check } from 'lucide-react';

// 添加类型声明
interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface MarkdownProps {
  content: string;
  className?: string;
}

// 定制的代码高亮样式
const customCodeStyle = {
  ...vscDarkPlus,
  'pre[class*="language-"]': {
    ...vscDarkPlus['pre[class*="language-"]'],
    backgroundColor: 'var(--code-bg)',
    padding: '1rem',
    margin: '0',
    overflow: 'auto',
    borderRadius: '0.375rem',
  },
  'code[class*="language-"]': {
    ...vscDarkPlus['code[class*="language-"]'],
    backgroundColor: 'transparent',
    fontSize: 'var(--code-font-size)',
    lineHeight: 'var(--code-line-height)',
    padding: 0,
    borderRadius: 0,
    border: 'none',
  },
};

export const Markdown: FC<MarkdownProps> = ({ content, className = '' }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <ReactMarkdown
      className={`markdown-body ${className}`}
      components={{
        code(props: CodeProps) {
          const { inline, className, children, ...rest } = props;
          const match = /language-(\w+)/.exec(className || '');
          const code = String(children).replace(/\n$/, '');
          
          return !inline && match ? (
            <div className="relative group">
              <button
                onClick={() => handleCopyCode(code)}
                className="absolute right-2 top-2 p-1.5 rounded-md bg-background/10 hover:bg-background/20 text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                aria-label="复制代码"
                title="复制代码"
              >
                {copiedCode === code ? <Check size={14} /> : <Copy size={14} />}
              </button>
              <SyntaxHighlighter
                style={customCodeStyle}
                language={match[1]}
                PreTag="div"
                {...rest}
                wrapLongLines={true}
                customStyle={{
                  backgroundColor: 'var(--code-bg)',
                  margin: 0,
                }}
              >
                {code}
              </SyntaxHighlighter>
            </div>
          ) : (
            <code className="bg-muted/60 px-1.5 py-0.5 rounded-md font-mono" style={{ fontSize: 'var(--code-font-size)' }} {...rest}>
              {children}
            </code>
          );
        },
        // 添加其他自定义Markdown组件样式
        p: ({ children }) => <p className="leading-relaxed">{children}</p>,
        h1: ({ children }) => <h1 className="text-2xl font-bold my-4">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-bold my-3">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-bold my-2">{children}</h3>,
        ul: ({ children }) => <ul className="list-disc list-outside mb-4 pl-5">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal list-outside mb-4 pl-5">{children}</ol>,
        li: ({ children }) => <li className="mb-1.5">{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-primary/40 pl-4 italic my-4 text-foreground/80 bg-muted/30 py-2 rounded-r-md">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto mb-4 rounded-md border border-border">
            <table className="min-w-full">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
        tbody: ({ children }) => <tbody>{children}</tbody>,
        tr: ({ children }) => <tr className="border-b border-border hover:bg-muted/20 transition-colors">{children}</tr>,
        th: ({ children }) => <th className="px-4 py-3 text-left font-medium text-foreground/90">{children}</th>,
        td: ({ children }) => <td className="px-4 py-3">{children}</td>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}; 