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
  SqlResult?: string;
  TokenUsage?: number;
  CreatedDate: string;
}

export interface Feedback {
  FeedbackID: string;
  MessageID: string;
  Question: string;
  SqlQuery: string;
  AnswerText: string;
  Score: number;
  CreatedDate: string;
}

export interface Memory {
  MemoryID: string;
  UserNIK: string;
  ConversationID?: string;
  FactText: string;
  CreatedDate: string;
}
