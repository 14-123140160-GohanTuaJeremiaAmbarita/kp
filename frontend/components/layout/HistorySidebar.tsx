import React from 'react';
import { MessageSquare, Pin, PinOff, Trash2 } from 'lucide-react';
import { Conversation } from '../../types/chat';

interface ConversationItemProps {
  conv: Conversation;
  activeId: string;
  onClick: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent<HTMLButtonElement>) => void;
  onPin: (id: string, e: React.MouseEvent<HTMLButtonElement>) => void;
}

function ConversationItem({ conv, activeId, onClick, onDelete, onPin }: ConversationItemProps) {
  const isActive = conv.ConversationID === activeId;
  return (
    <div 
      onClick={() => onClick(conv.ConversationID)}
      className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs transition duration-150 cursor-pointer ${
        isActive 
          ? 'bg-slate-800/80 text-white border border-slate-700/50 shadow shadow-slate-950' 
          : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
      }`}
    >
      <div className="flex items-center space-x-2.5 overflow-hidden">
        <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
        <span className="truncate pr-1 font-medium">{conv.Title}</span>
      </div>

      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 shrink-0">
        <button 
          onClick={(e) => onPin(conv.ConversationID, e)}
          className={`p-1 rounded hover:bg-slate-800 transition cursor-pointer ${conv.IsPinned ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
          title={conv.IsPinned ? 'Lepas Pin' : 'Sematkan Percakapan'}
        >
          {conv.IsPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
        </button>
        <button 
          onClick={(e) => onDelete(conv.ConversationID, e)}
          className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition cursor-pointer"
          title="Hapus Percakapan"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

interface HistorySidebarProps {
  conversations: Conversation[];
  activeConvId: string;
  setActiveConvId: (id: string) => void;
  onDeleteConversation: (id: string, e: React.MouseEvent<HTMLButtonElement>) => void;
  onPinConversation: (id: string, e: React.MouseEvent<HTMLButtonElement>) => void;
}

export default function HistorySidebar({
  conversations,
  activeConvId,
  setActiveConvId,
  onDeleteConversation,
  onPinConversation,
}: HistorySidebarProps) {
  const getGroupedConversations = () => {
    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const older: Conversation[] = [];

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

    const list = Array.isArray(conversations) ? conversations : [];
    const sorted = [...list].sort((a, b) => {
      const timeA = a.CreatedDate ? new Date(a.CreatedDate).getTime() : 0;
      const timeB = b.CreatedDate ? new Date(b.CreatedDate).getTime() : 0;
      if (a.IsPinned && !b.IsPinned) return -1;
      if (!a.IsPinned && b.IsPinned) return 1;
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    });

    for (const c of sorted) {
      if (!c.CreatedDate) {
        older.push(c);
        continue;
      }
      const t = new Date(c.CreatedDate).getTime();
      if (isNaN(t)) {
        older.push(c);
        continue;
      }
      if (t >= startOfToday) {
        today.push(c);
      } else if (t >= startOfYesterday) {
        yesterday.push(c);
      } else {
        older.push(c);
      }
    }

    return { today, yesterday, older };
  };

  const { today, yesterday, older } = getGroupedConversations();

  return (
    <div className="flex-1 overflow-y-auto px-3 space-y-4 py-3 custom-scrollbar">
      {/* TODAY */}
      {today.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase font-bold text-slate-500 px-2 tracking-widest">History - Hari Ini</p>
          {today.map(c => (
            <ConversationItem 
              key={c.ConversationID} 
              conv={c} 
              activeId={activeConvId}
              onClick={setActiveConvId}
              onDelete={onDeleteConversation}
              onPin={onPinConversation}
            />
          ))}
        </div>
      )}

      {/* YESTERDAY */}
      {yesterday.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase font-bold text-slate-500 px-2 tracking-widest">Kemarin</p>
          {yesterday.map(c => (
            <ConversationItem 
              key={c.ConversationID} 
              conv={c} 
              activeId={activeConvId}
              onClick={setActiveConvId}
              onDelete={onDeleteConversation}
              onPin={onPinConversation}
            />
          ))}
        </div>
      )}

      {/* OLDER */}
      {older.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase font-bold text-slate-500 px-2 tracking-widest">Sebelumnya</p>
          {older.map(c => (
            <ConversationItem 
              key={c.ConversationID} 
              conv={c} 
              activeId={activeConvId}
              onClick={setActiveConvId}
              onDelete={onDeleteConversation}
              onPin={onPinConversation}
            />
          ))}
        </div>
      )}

      {conversations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500">
          <MessageSquare className="h-8 w-8 stroke-1 mb-2 text-slate-600" />
          <p className="text-xs">Belum ada riwayat</p>
        </div>
      )}
    </div>
  );
}
export { ConversationItem };
