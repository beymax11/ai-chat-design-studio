import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Conversation, Message, FileAttachment } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';
import { detectLanguageRequest } from '@/lib/languageDetection';
import { translateText, LanguageCode } from '@/contexts/TranslationContext';

export interface Project {
  id: string;
  name: string;
  conversationIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  selectedModel: string;
  setSelectedModel: (modelId: string) => void;
  createNewChat: () => void;
  switchConversation: (id: string) => void;
  sendMessage: (content: string, model?: string, attachments?: FileAttachment[]) => Promise<void>;
  regenerateResponse: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteConversation: (id: string) => void;
  clearAllConversations: () => void;
  isTyping: boolean;
  projects: Project[];
  createProject: (name: string) => void;
  deleteProject: (id: string) => void;
  addConversationToProject: (projectId: string, conversationId: string) => void;
  removeConversationFromProject: (projectId: string, conversationId: string) => void;
}

const MODEL_STORAGE_KEY = 'chatbox-selected-model';
const PROJECTS_STORAGE_KEY = 'chatbox-projects';
const CONVERSATIONS_STORAGE_KEY = 'chatbox-conversations';
const CURRENT_CONVERSATION_ID_KEY = 'chatbox-current-conversation-id';
const DEFAULT_MODEL = 'gpt-smart';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize conversations from localStorage
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return parsed.map((conv: any) => ({
            ...conv,
            createdAt: new Date(conv.createdAt),
            updatedAt: new Date(conv.updatedAt),
            messages: conv.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })),
          }));
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  // Initialize currentConversation from localStorage (if conversations exist)
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
      const currentId = localStorage.getItem(CURRENT_CONVERSATION_ID_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.length > 0) {
            // Try to find the conversation with the saved ID, otherwise use the first one
            const targetConv = currentId 
              ? parsed.find((c: any) => c.id === currentId) || parsed[0]
              : parsed[0];
            
            return {
              ...targetConv,
              createdAt: new Date(targetConv.createdAt),
              updatedAt: new Date(targetConv.updatedAt),
              messages: targetConv.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp),
              })),
            };
          }
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [isTyping, setIsTyping] = useState(false);
  
  // Persist conversations to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined' && conversations.length > 0) {
      localStorage.setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify(conversations));
    }
  }, [conversations]);

  // Persist current conversation ID to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && currentConversation) {
      localStorage.setItem(CURRENT_CONVERSATION_ID_KEY, currentConversation.id);
    }
  }, [currentConversation]);
  
  // Initialize projects from localStorage
  const [projects, setProjects] = useState<Project[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return parsed.map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
            updatedAt: new Date(p.updatedAt),
          }));
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  // Persist projects to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
    }
  }, [projects]);
  
  // Initialize model from localStorage or use default
  const [selectedModel, setSelectedModelState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(MODEL_STORAGE_KEY);
      return stored || DEFAULT_MODEL;
    }
    return DEFAULT_MODEL;
  });

  // Persist model selection to localStorage
  const setSelectedModel = useCallback((modelId: string) => {
    setSelectedModelState(modelId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(MODEL_STORAGE_KEY, modelId);
    }
  }, []);

  // Load model from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(MODEL_STORAGE_KEY);
      if (stored) {
        setSelectedModelState(stored);
      }
    }
  }, []);

  const generateTitle = (firstMessage: string): string => {
    return firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
  };

  const simulateAIResponse = async (userMessage: string, model?: string, conversationHistory?: Message[]): Promise<string> => {
    // Detect if user requested a specific language
    const requestedLanguage = detectLanguageRequest(userMessage);
    
    try {
      // Get API key from environment
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;
      
      if (!apiKey) {
        throw new Error('Groq API key not found. Get free API key at https://console.groq.com/keys');
      }

      // Map model IDs to Groq model names
      // Updated with currently available models (as of 2024)
      const modelMap: Record<string, { name: string; maxTokens: number }> = {
        'gpt-fast': { name: 'llama-3.1-8b-instant', maxTokens: 8192 },
        'gpt-smart': { name: 'llama-3.1-70b-versatile', maxTokens: 8192 },
        'gpt-ultra': { name: 'llama-3.3-70b-versatile', maxTokens: 8192 }, // Updated: mixtral-8x7b-32768 was deprecated
      };

      const modelConfig = modelMap[model || selectedModel] || modelMap['gpt-fast'];
      const groqModel = modelConfig.name;
      const maxTokens = Math.min(modelConfig.maxTokens, 2000); // Use 2000 or model limit, whichever is lower
      
      // Validate model name
      if (!groqModel) {
        throw new Error('Invalid model selected. Please select a valid model.');
      }

      // Build conversation history for context
      const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Provide clear, detailed, and accurate responses to user questions.'
        }
      ];

      // Add conversation history if available
      if (conversationHistory && conversationHistory.length > 0) {
        conversationHistory.forEach(msg => {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        });
      }

      // Add current user message
      messages.push({
        role: 'user',
        content: userMessage
      });

      // Helper function to make API call with retry logic
      const makeApiCall = async (model: string, modelMaxTokens: number, retryCount = 0): Promise<Response> => {
        // Validate messages array
        if (!messages || messages.length === 0) {
          throw new Error('No messages to send. Please provide at least one message.');
        }

        // Validate each message has required fields
        for (const msg of messages) {
          if (!msg.role || !msg.content) {
            throw new Error('Invalid message format. Each message must have role and content.');
          }
          if (typeof msg.content !== 'string') {
            throw new Error('Invalid message format. Content must be a string.');
          }
        }

        const requestBody = {
          model: model,
          messages: messages,
          temperature: 0.7,
          max_tokens: Math.min(modelMaxTokens, 2000), // Cap at 2000 for consistency
        };

        // Log request for debugging (remove in production)
        if (retryCount === 0) {
          console.log('Groq API Request:', {
            model: model,
            messageCount: messages.length,
            hasSystemMessage: messages.some(m => m.role === 'system')
          });
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify(requestBody)
        });

        // Handle rate limiting (429) with retry
        if (response.status === 429 && retryCount < 3) {
          const retryAfter = response.headers.get('retry-after');
          
          // Use retry-after header if available, otherwise use exponential backoff
          let waitTime: number;
          if (retryAfter) {
            waitTime = parseInt(retryAfter) * 1000;
          } else {
            // Exponential backoff: 2s, 5s, 10s (Groq is usually faster)
            waitTime = [2000, 5000, 10000][retryCount] || 10000;
          }
          
          console.warn(`Rate limited. Retrying after ${waitTime / 1000} seconds... (Attempt ${retryCount + 1}/3)`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return makeApiCall(model, modelMaxTokens, retryCount + 1);
        }

        return response;
      };

      // Try with selected model first
      let response = await makeApiCall(groqModel, maxTokens);

      // If model doesn't exist or no access, fallback to default model
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || '';
        
        // Handle quota/billing errors
        if (errorMessage.includes('quota') || errorMessage.includes('billing') || errorMessage.includes('exceeded') || errorMessage.includes('rate limit')) {
          throw new Error('Groq API rate limit reached. Free tier allows 14,400 requests/day. Please wait a moment or check your usage at https://console.groq.com/usage');
        }
        
        // Handle authentication errors
        if (response.status === 401 || errorMessage.includes('Invalid API key') || errorMessage.includes('Incorrect API key') || errorMessage.includes('Unauthorized')) {
          throw new Error('Invalid Groq API key. Please check your VITE_GROQ_API_KEY in .env file. Get free API key at https://console.groq.com/keys');
        }
        
        // Check if it's a model access error (404 or model_not_found)
        if (response.status === 404 || errorMessage.includes('does not exist') || errorMessage.includes('not have access') || errorMessage.includes('model_not_found')) {
          // Only fallback if it's not already the default model
          if (groqModel !== 'llama-3.1-8b-instant') {
            console.warn(`Model ${groqModel} not available, falling back to llama-3.1-8b-instant`);
            
            // Retry with default model
            const defaultModelConfig = modelMap['gpt-fast'];
            response = await makeApiCall(defaultModelConfig.name, defaultModelConfig.maxTokens);
          }
        }
        
        // If still not ok after fallback, throw error with user-friendly message
        if (!response.ok) {
          // Try to get error response as text first, then as JSON
          let fallbackErrorData: any = {};
          const responseText = await response.text().catch(() => '');
          
          try {
            fallbackErrorData = JSON.parse(responseText);
          } catch {
            // If not JSON, use the text as error message
            if (responseText) {
              fallbackErrorData = { message: responseText };
            }
          }
          
          // Better error message extraction - check multiple possible formats
          let finalErrorMessage = '';
          
          // Check various error response formats
          if (fallbackErrorData.error) {
            if (typeof fallbackErrorData.error === 'string') {
              finalErrorMessage = fallbackErrorData.error;
            } else if (fallbackErrorData.error.message) {
              finalErrorMessage = fallbackErrorData.error.message;
            } else if (fallbackErrorData.error.type) {
              finalErrorMessage = fallbackErrorData.error.type;
            } else {
              finalErrorMessage = JSON.stringify(fallbackErrorData.error);
            }
          } else if (fallbackErrorData.message) {
            finalErrorMessage = fallbackErrorData.message;
          } else if (fallbackErrorData.detail) {
            finalErrorMessage = fallbackErrorData.detail;
          } else if (responseText) {
            finalErrorMessage = responseText;
          } else {
            finalErrorMessage = `API error: ${response.statusText}`;
          }
          
          // Log full error for debugging
          console.error('Groq API Error Details:', {
            status: response.status,
            statusText: response.statusText,
            errorData: fallbackErrorData,
            responseText: responseText,
            model: groqModel,
            requestBody: {
              model: groqModel,
              messageCount: messages.length
            }
          });
          
          // Provide user-friendly error messages
          if (response.status === 400) {
            // Better error message for 400 errors
            let errorMsg = finalErrorMessage || 'Invalid request format.';
            
            // Check common 400 error causes
            if (errorMsg.toLowerCase().includes('model') || errorMsg.toLowerCase().includes('invalid model')) {
              errorMsg = `Invalid model name: ${groqModel}. Please check available models at https://console.groq.com/docs/models`;
            } else if (errorMsg.toLowerCase().includes('messages') || errorMsg.toLowerCase().includes('message')) {
              errorMsg += ' Please check the message format.';
            } else if (errorMsg.toLowerCase().includes('api key') || errorMsg.toLowerCase().includes('key') || errorMsg.toLowerCase().includes('unauthorized')) {
              errorMsg = 'Invalid or missing API key. Please check your VITE_GROQ_API_KEY in .env file. Get free API key at https://console.groq.com/keys';
            } else if (errorMsg.toLowerCase().includes('token') || errorMsg.toLowerCase().includes('max_tokens')) {
              errorMsg += ' Please reduce max_tokens or message length.';
            } else if (!errorMsg || errorMsg.trim() === '' || errorMsg === 'API error: ') {
              errorMsg = `Bad request (400). Model "${groqModel}" may not be available. Try using "llama-3.1-8b-instant" or check available models at https://console.groq.com/docs/models`;
            }
            
            // If model error and not already using default, suggest fallback
            if (errorMsg.toLowerCase().includes('model') && groqModel !== 'llama-3.1-8b-instant') {
              console.warn(`Model ${groqModel} failed, you may want to try: llama-3.1-8b-instant`);
            }
            
            throw new Error(`Bad request: ${errorMsg}`);
          } else if (response.status === 429) {
            const retryAfter = response.headers.get('retry-after');
            const waitSeconds = retryAfter ? parseInt(retryAfter) : 10;
            throw new Error(`Rate limit exceeded. Please wait ${waitSeconds} seconds before trying again. Free tier: 14,400 requests/day`);
          } else if (response.status === 500 || response.status === 503) {
            throw new Error('Groq service is temporarily unavailable. Please try again later.');
          } else {
            throw new Error(finalErrorMessage || `API error (${response.status}): ${response.statusText}`);
          }
        }
      }

      const data = await response.json();
      let aiResponse = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    
    // If user requested a specific language, translate the response
    if (requestedLanguage && requestedLanguage !== 'auto-detect') {
      try {
          aiResponse = await translateText(aiResponse, requestedLanguage as LanguageCode);
      } catch (error) {
        console.error('Failed to translate AI response:', error);
        // Return original response if translation fails
      }
    }
    
      return aiResponse;
    } catch (error) {
      console.error('AI API Error:', error);
      // Fallback to a helpful error message
      return `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Get free Groq API key at https://console.groq.com/keys`;
    }
  };

  const createNewChat = useCallback(() => {
    const newConversation: Conversation = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      model: selectedModel,
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversation(newConversation);
  }, [selectedModel]);

  const switchConversation = useCallback((id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  }, [conversations]);

  const sendMessage = useCallback(async (content: string, model?: string, attachments?: FileAttachment[]) => {
    if (!currentConversation) return;

    const modelToUse = model || selectedModel;

    // Save conversation history BEFORE adding the user message
    const conversationHistory = currentConversation.messages;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
      model: modelToUse,
      attachments: attachments && attachments.length > 0 ? attachments : undefined,
    };

    // Update conversation with user message and model
    setConversations(prev => prev.map(conv => 
      conv.id === currentConversation.id
        ? {
            ...conv,
            messages: [...conv.messages, userMessage],
            title: conv.messages.length === 0 ? generateTitle(content) : conv.title,
            updatedAt: new Date(),
            model: modelToUse,
          }
        : conv
    ));

    setCurrentConversation(prev => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage],
      title: prev.messages.length === 0 ? generateTitle(content) : prev.title,
      model: modelToUse,
    } : null);

    // Call real AI API with conversation history (before adding user message)
    setIsTyping(true);
    try {
      const aiResponse = await simulateAIResponse(content, modelToUse, conversationHistory);
    setIsTyping(false);

    const assistantMessage: Message = {
      id: uuidv4(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
      model: modelToUse,
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
    } catch (error) {
      setIsTyping(false);
      console.error('Error sending message:', error);
      // Show error message to user
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key configuration or try again later.`,
        timestamp: new Date(),
        model: modelToUse,
      };

      setConversations(prev => prev.map(conv => 
        conv.id === currentConversation.id
          ? {
              ...conv,
              messages: [...conv.messages, errorMessage],
              updatedAt: new Date(),
            }
          : conv
      ));

      setCurrentConversation(prev => prev ? {
        ...prev,
        messages: [...prev.messages, errorMessage],
      } : null);
    }
  }, [currentConversation, selectedModel]);

  const regenerateResponse = useCallback(async (messageId: string) => {
    if (!currentConversation) return;

    const messageIndex = currentConversation.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1 || currentConversation.messages[messageIndex].role !== 'assistant') return;

    // Get the user message before this assistant message
    const userMessageIndex = messageIndex - 1;
    if (userMessageIndex < 0) return;

    const userMessage = currentConversation.messages[userMessageIndex];
    const modelToUse = userMessage.model || currentConversation.model || selectedModel;

    // Get conversation history up to the user message
    const conversationHistory = currentConversation.messages.slice(0, userMessageIndex);

    setIsTyping(true);
    try {
      const newResponse = await simulateAIResponse(userMessage.content, modelToUse, conversationHistory);
    setIsTyping(false);

    const updatedMessage: Message = {
      ...currentConversation.messages[messageIndex],
      content: newResponse,
      timestamp: new Date(),
      model: modelToUse,
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
    } catch (error) {
      setIsTyping(false);
      console.error('Error regenerating response:', error);
    }
  }, [currentConversation, selectedModel]);

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
      const modelToUse = currentConversation.model || selectedModel;
      // Get conversation history up to the edited message (excluding the edited message itself)
      const conversationHistory = newMessages.slice(0, -1);
      
      setIsTyping(true);
      try {
        const aiResponse = await simulateAIResponse(newContent, modelToUse, conversationHistory);
      setIsTyping(false);

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        model: modelToUse,
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
      } catch (error) {
        setIsTyping(false);
        console.error('Error generating response:', error);
      }
    }
  }, [currentConversation, selectedModel]);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    // Remove conversation from all projects
    setProjects(prev => prev.map(project => ({
      ...project,
      conversationIds: project.conversationIds.filter(convId => convId !== id),
      updatedAt: new Date(),
    })));
    if (currentConversation?.id === id) {
      setCurrentConversation(conversations[0] || null);
    }
  }, [currentConversation, conversations]);

  const clearAllConversations = useCallback(() => {
    // Clear from localStorage first
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CONVERSATIONS_STORAGE_KEY);
      localStorage.removeItem(CURRENT_CONVERSATION_ID_KEY);
    }
    // Clear all projects' conversation references
    setProjects(prev => prev.map(project => ({
      ...project,
      conversationIds: [],
      updatedAt: new Date(),
    })));
    // Create a new chat and set it as current
    const newConversation: Conversation = {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      model: selectedModel,
    };
    setConversations([newConversation]);
    setCurrentConversation(newConversation);
  }, [selectedModel]);

  const createProject = useCallback((name: string) => {
    const newProject: Project = {
      id: uuidv4(),
      name,
      conversationIds: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setProjects(prev => [newProject, ...prev]);
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  const addConversationToProject = useCallback((projectId: string, conversationId: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId && !project.conversationIds.includes(conversationId)
        ? {
            ...project,
            conversationIds: [...project.conversationIds, conversationId],
            updatedAt: new Date(),
          }
        : project
    ));
  }, []);

  const removeConversationFromProject = useCallback((projectId: string, conversationId: string) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId
        ? {
            ...project,
            conversationIds: project.conversationIds.filter(id => id !== conversationId),
            updatedAt: new Date(),
          }
        : project
    ));
  }, []);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        currentConversation,
        selectedModel,
        setSelectedModel,
        createNewChat,
        switchConversation,
        sendMessage,
        regenerateResponse,
        editMessage,
        deleteConversation,
        clearAllConversations,
        isTyping,
        projects,
        createProject,
        deleteProject,
        addConversationToProject,
        removeConversationFromProject,
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
