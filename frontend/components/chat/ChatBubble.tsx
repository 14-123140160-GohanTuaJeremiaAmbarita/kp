import React from 'react';
import { motion } from 'motion/react';
import { Check, Copy, Database, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Message } from '../../types/chat';
import MarkdownMessage from './MarkdownMessage';
import SqlCard from './SqlCard';

interface ChatBubbleProps {
  message: Message;
  theme?: 'light' | 'dark';
  copiedId: string;
  onCopyText: (text: string, id: string) => void;
  expandedSqlMsgId: string | null;
  setExpandedSqlMsgId: (id: string | null) => void;
  feedbackStatus: Record<string, 'up' | 'down'>;
  onFeedback: (msgId: string, score: number, question: string, sqlQuery: string, answerText: string) => void;
  userQuestion: string;
  onExportExcel: (sql: string) => void;
  onExportPDF: (sql: string, result: string, userQuestion?: string) => void;
}

export default function ChatBubble({
  message,
  theme,
  copiedId,
  onCopyText,
  expandedSqlMsgId,
  setExpandedSqlMsgId,
  feedbackStatus,
  onFeedback,
  userQuestion,
  onExportExcel,
  onExportPDF,
}: ChatBubbleProps) {
  const isUser = message.Sender === 'User';
  const isDark = theme === 'dark';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex space-x-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {/* Avatar on the left for AI */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-200/50 text-white font-bold text-xs border border-blue-500">
          AI
        </div>
      )}

      {/* Content block */}
      <div className="max-w-[85%] space-y-2">
        {/* Bubble itself */}
        <div className={`rounded-2xl px-4 py-3 text-xs leading-relaxed border shadow-sm ${
          isUser 
            ? 'bg-blue-600 text-white border-blue-500' 
            : (isDark 
              ? 'bg-slate-900 text-slate-200 border-slate-800 space-y-2.5 p-5 shadow shadow-slate-950/40' 
              : 'bg-white text-slate-750 border-slate-200 space-y-2.5 p-5')
        }`}>
          {!isUser && (
            <div className={`flex items-center gap-2 pb-2 mb-2 border-b ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}>
              <div className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider border ${
                isDark 
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900/40' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-100'
              }`}>SQL Safe Execution</div>
              <div className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider border ${
                isDark 
                  ? 'bg-blue-950/40 text-blue-300 border-blue-900/40' 
                  : 'bg-blue-50 text-blue-700 border-blue-100'
              }`}>Source: ITOpr</div>
            </div>
          )}
          {/* Main Text with Markdown support */}
          <div className="select-text selection:bg-blue-500/30 selection:text-slate-850">
            {isUser ? (
              <div className="whitespace-pre-wrap">{message.MessageText}</div>
            ) : (
              <MarkdownMessage content={message.MessageText} theme={theme} />
            )}
          </div>
        </div>

        {/* SQL Code Block Toggle & Feedback Buttons below AI reply */}
        {!isUser && (
          <div className="flex flex-col space-y-2">
            {/* Actions bar (Copy, SQL, Feedback) */}
            <div className={`flex items-center space-x-3 text-[11px] px-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {/* Copy Button */}
              <button 
                onClick={() => onCopyText(message.MessageText, message.MessageID)}
                className="flex items-center space-x-1 hover:text-slate-600 transition cursor-pointer"
              >
                {copiedId === message.MessageID ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-semibold">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>

              {/* SQL Query Inspector Toggle (if present) */}
              {message.SqlQuery && (
                <button 
                  onClick={() => setExpandedSqlMsgId(expandedSqlMsgId === message.MessageID ? null : message.MessageID)}
                  className="flex items-center space-x-1 hover:text-blue-600 text-blue-500 font-semibold transition cursor-pointer"
                >
                  <Database className="h-3.5 w-3.5" />
                  <span>{expandedSqlMsgId === message.MessageID ? 'Sembunyikan SQL' : 'Lihat Kueri SQL'}</span>
                </button>
              )}

              {/* Thumbs Up/Down for self-learning */}
              <div className={`flex items-center space-x-2 pl-2 border-l ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <button 
                  onClick={() => onFeedback(message.MessageID, 1, userQuestion, message.SqlQuery || '', message.MessageText)}
                  className={`p-1 rounded transition cursor-pointer ${
                    feedbackStatus[message.MessageID] === 'up' 
                      ? 'text-emerald-600 bg-emerald-50 border border-emerald-100 font-bold' 
                      : (isDark ? 'hover:text-slate-300 text-slate-500' : 'hover:text-slate-700 text-slate-400')
                  }`}
                  title="Upvote - AI akan mempelajari pola ini"
                  disabled={!!feedbackStatus[message.MessageID]}
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                </button>
                <button 
                  onClick={() => onFeedback(message.MessageID, -1, userQuestion, message.SqlQuery || '', message.MessageText)}
                  className={`p-1 rounded transition cursor-pointer ${
                    feedbackStatus[message.MessageID] === 'down' 
                      ? 'text-rose-600 bg-rose-50 border border-rose-100 font-bold' 
                      : (isDark ? 'hover:text-slate-300 text-slate-500' : 'hover:text-slate-700 text-slate-400')
                  }`}
                  title="Downvote"
                  disabled={!!feedbackStatus[message.MessageID]}
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Collapsible SQL Query & Results */}
            {message.SqlQuery && expandedSqlMsgId === message.MessageID && (
              <SqlCard
                sqlQuery={message.SqlQuery}
                sqlResult={message.SqlResult}
                onExportExcel={onExportExcel}
                onExportPDF={onExportPDF}
                userQuestion={userQuestion}
                theme={theme}
              />
            )}
          </div>
        )}
      </div>

      {/* Avatar on the right for User */}
      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 border border-slate-150 text-slate-700 font-bold text-xs shadow-sm">
          G
        </div>
      )}
    </motion.div>
  );
}
