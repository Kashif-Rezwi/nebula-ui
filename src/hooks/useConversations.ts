import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { conversationsApi } from '../lib/conversations';
import { ROUTES, MESSAGES } from '../constants';
import { toast } from '../utils/toast';
import type { Conversation, ConversationWithMessages } from '../types';

export function useConversations() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await conversationsApi.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  const createConversation = useCallback(async (title?: string) => {
    try {
      setCreating(true);
      const newConversation = await conversationsApi.createConversation(title || 'New Chat');
      await loadConversations();
      navigate(ROUTES.CHAT_WITH_ID(newConversation.id));
      return newConversation;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast.error('Failed to create conversation');
      throw error;
    } finally {
      setCreating(false);
    }
  }, [navigate, loadConversations]);

  const deleteConversation = useCallback(async (conversationId: string, currentConversationId?: string) => {
    if (!confirm(MESSAGES.ERRORS.DELETE_CONFIRM)) {
      return;
    }

    try {
      await conversationsApi.deleteConversation(conversationId);
      await loadConversations();
      
      if (conversationId === currentConversationId) {
        navigate(ROUTES.CHAT);
      }
      
      toast.success('Conversation deleted');
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast.error('Failed to delete conversation');
      throw error;
    }
  }, [navigate, loadConversations]);

  const getConversation = useCallback(async (conversationId: string): Promise<ConversationWithMessages | null> => {
    try {
      return await conversationsApi.getConversation(conversationId);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      toast.error('Failed to load conversation');
      return null;
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations,
    loading,
    creating,
    createConversation,
    deleteConversation,
    getConversation,
    refreshConversations: loadConversations,
  };
}