export interface Conversation {
  ConversationID: string;
  Title: string;
  CreatedBy: string;
  CreatedDate: string;
  IsPinned: boolean;
  IsArchived: boolean;
}

export interface Message {
  MessageID: string;
  ConversationID: string;
  Sender: 'User' | 'AI';
  MessageText: string;
  SqlQuery?: string;
  SqlResult?: string; // JSON string
  TokenUsage?: number;
  CreatedDate: string;
}
