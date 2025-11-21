import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { MessageBubble } from './MessageBubble';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, Menu } from 'lucide-react';
import { ModelSelector } from './ModelSelector';
import { InputBar } from './InputBar';
import { Button } from '@/components/ui/button';
import { LoginModal } from './LoginModal';
import { SignUpModal } from './SignUpModal';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatWindowProps {
  onMenuClick?: () => void;
}

export const ChatWindow = ({ onMenuClick }: ChatWindowProps = {}) => {
  const { currentConversation, isTyping, selectedModel, setSelectedModel } = useChat();
  const { user } = useAuth();
  const isMobile = useIsMobile();
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
        <div className="p-3 sm:p-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isMobile && user && onMenuClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="h-9 w-9 shrink-0"
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <div className="min-w-0 flex-1">
              <ModelSelector
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
              />
            </div>
          </div>
          {!user && (
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <Button variant="ghost" size="sm" onClick={() => setIsLoginOpen(true)} className="text-xs sm:text-sm">
                Login
              </Button>
              <Button size="sm" onClick={() => setIsSignUpOpen(true)} className="text-xs sm:text-sm">
                Sign Up
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md w-full">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="w-12 h-12 sm:w-16 sm:h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6"
            >
              <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-accent-foreground" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3"
            >
              Welcome to AI Chat
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-base sm:text-lg"
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
      <div className="p-3 sm:p-4 flex-shrink-0 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isMobile && user && onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="h-9 w-9 shrink-0"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <div className="min-w-0 flex-1">
            <ModelSelector
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
            />
          </div>
        </div>
        {!user && (
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setIsLoginOpen(true)} className="text-xs sm:text-sm">
              Login
            </Button>
            <Button size="sm" onClick={() => setIsSignUpOpen(true)} className="text-xs sm:text-sm">
              Sign Up
            </Button>
        </div>
        )}
      </div>
      
      {currentConversation.messages.length === 0 ? (
        <div className="flex-1 flex flex-col">
          <div className="flex items-start justify-center pt-8 sm:pt-16 md:pt-32">
            <div className="w-full max-w-3xl px-3 sm:px-4">
              <div className="text-center mb-6 sm:mb-8 max-w-md mx-auto">
                <h2 className="text-lg sm:text-xl font-semibold mb-2">How can I help you today?</h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Ask me anything and I'll do my best to provide helpful, detailed responses.
                </p>
              </div>
              <InputBar onSetInputRef={(setInput) => { setInputRef.current = setInput; }} />
              
              {/* Recommendations */}
              <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2 justify-center">
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
                    className="rounded-full text-xs px-2 sm:px-3"
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
            <div className="py-2 sm:py-4 pt-12 sm:pt-16">
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
