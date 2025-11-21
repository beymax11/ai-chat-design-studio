import React, { createContext, useContext, useState, useCallback } from 'react';
import { Conversation, Message } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  createNewChat: () => void;
  switchConversation: (id: string) => void;
  sendMessage: (content: string) => Promise<void>;
  regenerateResponse: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteConversation: (id: string) => void;
  isTyping: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const generateTitle = (firstMessage: string): string => {
    return firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
  };

  const simulateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Generate contextual responses
    const responses = [
      `I understand you're asking about "${userMessage}". Let me provide a detailed response.\n\nHere's what I can help you with:\n\n1. **First point**: This is an important aspect to consider.\n2. **Second point**: Another crucial element.\n3. **Third point**: Finally, this completes the picture.\n\nWould you like me to elaborate on any of these points?`,
      `That's a great question! Based on what you've asked, I can provide the following insights:\n\n\`\`\`javascript\n// Here's a code example\nconst example = () => {\n  console.log("This demonstrates the concept");\n  return true;\n};\n\`\`\`\n\nThis should help clarify things. Is there anything else you'd like to know?`,
      `I appreciate your question about "${userMessage}". Let me break this down:\n\n- **Key Concept 1**: Understanding the fundamentals\n- **Key Concept 2**: Practical applications\n- **Key Concept 3**: Best practices\n\nFeel free to ask follow-up questions!`,
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const createNewChat = useCallback(() => {
    const newConversation: Conversation = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
  }, []);

  const switchConversation = useCallback((id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  }, [conversations]);

  const sendMessage = useCallback(async (content: string) => {
    if (!currentConversation) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // Update conversation with user message
    setConversations(prev => prev.map(conv => 
      conv.id === currentConversation.id
        ? {
            ...conv,
            messages: [...conv.messages, userMessage],
            title: conv.messages.length === 0 ? generateTitle(content) : conv.title,
            updatedAt: new Date(),
          }
        : conv
    ));

    setCurrentConversation(prev => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage],
      title: prev.messages.length === 0 ? generateTitle(content) : prev.title,
    } : null);

    // Simulate AI response
    setIsTyping(true);
    const aiResponse = await simulateAIResponse(content);
    setIsTyping(false);

    const assistantMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    };

    setConversations(prev => prev.map(conv => 
      conv.id === currentConversation.id
        ? {
            ...conv,
            messages: [...conv.messages, assistantMessage],
            updatedAt: new Date(),
          }
        : conv
    ));

    setCurrentConversation(prev => prev ? {
      ...prev,
      messages: [...prev.messages, assistantMessage],
    } : null);
  }, [currentConversation]);

  const regenerateResponse = useCallback(async (messageId: string) => {
    if (!currentConversation) return;

    const messageIndex = currentConversation.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1 || currentConversation.messages[messageIndex].role !== 'assistant') return;

    // Get the user message before this assistant message
    const userMessageIndex = messageIndex - 1;
    if (userMessageIndex < 0) return;

    const userMessage = currentConversation.messages[userMessageIndex];

    setIsTyping(true);
    const newResponse = await simulateAIResponse(userMessage.content);
    setIsTyping(false);

    const updatedMessage: Message = {
      ...currentConversation.messages[messageIndex],
      content: newResponse,
      timestamp: new Date(),
    };

    setConversations(prev => prev.map(conv => 
      conv.id === currentConversation.id
        ? {
            ...conv,
            messages: conv.messages.map(m => m.id === messageId ? updatedMessage : m),
            updatedAt: new Date(),
          }
        : conv
    ));

    setCurrentConversation(prev => prev ? {
      ...prev,
      messages: prev.messages.map(m => m.id === messageId ? updatedMessage : m),
    } : null);
  }, [currentConversation]);

  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!currentConversation) return;

    const messageIndex = currentConversation.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    // Update the message
    const updatedMessages = [...currentConversation.messages];
    updatedMessages[messageIndex] = {
      ...updatedMessages[messageIndex],
      content: newContent,
      timestamp: new Date(),
    };

    // Remove all messages after this one
    const newMessages = updatedMessages.slice(0, messageIndex + 1);

    setConversations(prev => prev.map(conv => 
      conv.id === currentConversation.id
        ? {
            ...conv,
            messages: newMessages,
            updatedAt: new Date(),
          }
        : conv
    ));

    setCurrentConversation(prev => prev ? {
      ...prev,
      messages: newMessages,
    } : null);

    // If it was a user message, generate new AI response
    if (currentConversation.messages[messageIndex].role === 'user') {
      setIsTyping(true);
      const aiResponse = await simulateAIResponse(newContent);
      setIsTyping(false);

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setConversations(prev => prev.map(conv => 
        conv.id === currentConversation.id
          ? {
              ...conv,
              messages: [...newMessages, assistantMessage],
              updatedAt: new Date(),
            }
          : conv
      ));

      setCurrentConversation(prev => prev ? {
        ...prev,
        messages: [...newMessages, assistantMessage],
      } : null);
    }
  }, [currentConversation]);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (currentConversation?.id === id) {
      setCurrentConversation(conversations[0] || null);
    }
  }, [currentConversation, conversations]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        createNewChat,
        switchConversation,
        sendMessage,
        regenerateResponse,
        editMessage,
        deleteConversation,
        isTyping,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};
