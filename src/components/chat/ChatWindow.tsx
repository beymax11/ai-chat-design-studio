import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { MessageBubble } from './MessageBubble';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';
import { ModelSelector } from './ModelSelector';
import { InputBar } from './InputBar';
import { Button } from '@/components/ui/button';
import { LoginModal } from './LoginModal';
import { SignUpModal } from './SignUpModal';

export const ChatWindow = () => {
  const { currentConversation, isTyping, selectedModel, setSelectedModel } = useChat();
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const setInputRef = useRef<((value: string) => void) | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  useEffect(() => {
    // Auto-scroll to bottom when new messages are added (to show newest at bottom)
    if (scrollContainerRef.current && currentConversation?.messages.length > 0) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [currentConversation?.messages]);

  useEffect(() => {
    // Auto-scroll to bottom when AI is typing (to show typing indicator at bottom)
    if (scrollContainerRef.current && isTyping) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [isTyping]);

  if (!currentConversation) {
    return (
      <div className="flex-1 flex flex-col bg-background">
        {/* Header with Model Selector */}
        <div className="p-4 flex items-center justify-between">
          <ModelSelector
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
          {!user && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setIsLoginOpen(true)}>
                Login
              </Button>
              <Button size="sm" onClick={() => setIsSignUpOpen(true)}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Bot className="w-8 h-8 text-accent-foreground" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold mb-3"
            >
              Welcome to AI Chat
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-lg"
            >
              Start a new conversation to begin chatting with AI
            </motion.p>
          </div>
        </div>

        <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} />
        <SignUpModal open={isSignUpOpen} onOpenChange={setIsSignUpOpen} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Header with Model Selector */}
      <div className="p-4 flex-shrink-0 flex items-center justify-between">
        <ModelSelector
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
        />
        {!user && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setIsLoginOpen(true)}>
              Login
            </Button>
            <Button size="sm" onClick={() => setIsSignUpOpen(true)}>
              Sign Up
            </Button>
          </div>
        )}
      </div>
      
      {currentConversation.messages.length === 0 ? (
        <div className="flex-1 flex flex-col">
          <div className="flex items-start justify-center pt-32">
            <div className="w-full max-w-3xl px-4">
              <div className="text-center mb-8 max-w-md mx-auto">
                <h2 className="text-xl font-semibold mb-2">How can I help you today?</h2>
                <p className="text-muted-foreground">
                  Ask me anything and I'll do my best to provide helpful, detailed responses.
                </p>
              </div>
              <InputBar onSetInputRef={(setInput) => { setInputRef.current = setInput; }} />
              
              {/* Recommendations */}
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {[
                  'Create an image',
                  'Recommend a product',
                  'Improve writing',
                  'Write a first draft',
                  'Simplify a topic',
                  'Improve communication',
                  'Get advice',
                  'Draft an email',
                ].map((recommendation) => (
                  <Button
                    key={recommendation}
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs"
                    onClick={() => {
                      if (setInputRef.current) {
                        setInputRef.current(recommendation);
                      }
                    }}
                  >
                    {recommendation}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto overflow-x-hidden min-h-0"
          >
            <div className="py-4 pt-16">
              {currentConversation.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-6 px-4"
                >
                  <div className="max-w-3xl mx-auto flex">
                    <div className="flex-1 min-w-0 flex items-start flex-col">
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
                          className="w-2 h-2 bg-muted-foreground rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                          className="w-2 h-2 bg-muted-foreground rounded-full"
                        />
                        <motion.div
                          animate={{ opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                          className="w-2 h-2 bg-muted-foreground rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={scrollRef} />
            </div>
          </div>
          <div className="flex-shrink-0">
            <InputBar />
          </div>
        </>
      )}

      <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      <SignUpModal open={isSignUpOpen} onOpenChange={setIsSignUpOpen} />
    </div>
  );
};
