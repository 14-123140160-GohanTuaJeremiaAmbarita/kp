import api from './axios';
import { Message } from '../types/chat';

export const sendMessageApi = async (conversationId: string, messageText: string, model: string) => {
  const response = await api.post('/chat', { conversationId, messageText, model });
  return response.data;
};

export const submitFeedbackApi = async (
  messageId: string,
  score: number,
  question: string,
  sqlQuery: string,
  answerText: string
) => {
  const response = await api.post('/feedback', {
    messageId,
    score,
    question,
    sqlQuery,
    answerText,
  });
  return response.data;
};

export const exportExcelApi = async (sql: string): Promise<Blob> => {
  const response = await api.post('/export', { sql }, { responseType: 'blob' });
  return response.data;
};
