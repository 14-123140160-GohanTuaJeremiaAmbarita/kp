import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownMessageProps {
  content: string;
  theme?: 'light' | 'dark';
}

export default function MarkdownMessage({ content, theme }: MarkdownMessageProps) {
  const isDark = theme === 'dark';

  return (
    <div className={`prose prose-sm max-w-none text-xs leading-relaxed space-y-1.5 ${
      isDark ? 'prose-invert text-slate-200' : 'text-slate-800'
    }`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="mb-0.5">{children}</li>,
          code: ({ children }) => (
            <code className={`px-1.5 py-0.5 rounded font-mono text-[11px] ${
              isDark ? 'bg-slate-800 text-blue-300' : 'bg-slate-100 text-blue-700'
            }`}>
              {children}
            </code>
          ),
          strong: ({ children }) => <strong className="font-semibold text-blue-500">{children}</strong>,
          h1: ({ children }) => <h1 className="text-base font-bold mt-3 mb-1.5">{children}</h1>,
          h2: ({ children }) => <h2 className="text-sm font-bold mt-2 mb-1">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xs font-bold mt-1.5 mb-1">{children}</h3>,
          table: ({ children }) => (
            <div className="overflow-x-auto my-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-sm bg-transparent">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800/80 text-left text-xs">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className={`${isDark ? 'bg-slate-800/80 text-slate-300' : 'bg-slate-50 text-slate-600'} font-bold`}>
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-100 dark:divide-slate-900 bg-transparent">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2.5 font-bold text-slate-900 dark:text-slate-100">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 text-slate-750 dark:text-slate-200">
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

