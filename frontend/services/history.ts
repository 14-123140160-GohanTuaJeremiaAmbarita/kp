import api from './axios';
import { Conversation, Message } from '../types/chat';

export const fetchConversationsApi = async (): Promise<Conversation[]> => {
  const response = await api.get('/conversations');
  return response.data.conversations || [];
};

export const fetchMessagesApi = async (conversationId: string): Promise<Message[]> => {
  const response = await api.get(`/conversations/${conversationId}/messages`);
  return response.data.messages || [];
};

export const createConversationApi = async (title: string = 'New Chat'): Promise<Conversation> => {
  const response = await api.post('/conversations', { title });
  return response.data.conversation;
};

export const deleteConversationApi = async (conversationId: string) => {
  const response = await api.delete(`/conversations/${conversationId}`);
  return response.data;
};

export const pinConversationApi = async (conversationId: string): Promise<Conversation> => {
  const response = await api.post(`/conversations/${conversationId}/pin`);
  return response.data.conversation;
};
