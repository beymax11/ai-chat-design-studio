import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { MessageBubble } from './MessageBubble';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Menu, Sparkles, Zap, MessageCircle, Pen, Lightbulb, Mail } from 'lucide-react';
import { ModelSelector } from './ModelSelector';
import { InputBar } from './InputBar';
import { Button } from '@/components/ui/button';
import { LoginModal } from './LoginModal';
import { SignUpModal } from './SignUpModal';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ChatWindowProps {
  onMenuClick?: () => void;
  onSetFocusInputRef?: (fn: () => void) => void;
  onSetFileUploadRef?: (fn: () => void) => void;
}

export const ChatWindow = ({ onMenuClick, onSetFocusInputRef, onSetFileUploadRef }: ChatWindowProps = {}) => {
  const { currentConversation, isTyping, selectedModel, setSelectedModel } = useChat();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const setInputRef = useRef<((value: string) => void) | null>(null);
  const focusInputRef = useRef<(() => void) | null>(null);
  const fileUploadRef = useRef<(() => void) | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  useEffect(() => {
    if (onSetFocusInputRef) {
      onSetFocusInputRef(() => {
        focusInputRef.current?.();
      });
    }
  }, [onSetFocusInputRef]);

  useEffect(() => {
    if (onSetFileUploadRef) {
      onSetFileUploadRef(() => {
        fileUploadRef.current?.();
      });
    }
  }, [onSetFileUploadRef]);

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
      <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-blue-500/5 pointer-events-none" />
        
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
              x: [0, -50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>

        {/* Header with Model Selector */}
        <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between gap-2 backdrop-blur-sm bg-background/50">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isMobile && user && onMenuClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="h-9 w-9 shrink-0 hover:bg-accent/50"
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
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsLoginOpen(true)} 
                className="text-xs sm:text-sm hover:bg-accent/50"
              >
                Login
              </Button>
              <Button 
                size="sm" 
                onClick={() => setIsSignUpOpen(true)} 
                className={cn(
                  "text-xs sm:text-sm",
                  "bg-black text-white hover:bg-black/90",
                  "hover:shadow-lg transition-all duration-300"
                )}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
        
        <div className="relative z-10 flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md w-full">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: 'spring', bounce: 0.5 }}
              className="relative inline-block mb-6 sm:mb-8"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-blue-500/20 rounded-full blur-2xl" />
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Bot className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
              </div>
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Sparkles className="w-3 h-3 text-white" />
              </motion.div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
            >
              Welcome to AI Chat
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-muted-foreground text-base sm:text-lg leading-relaxed"
            >
              Start a new conversation to begin chatting with AI
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-sm text-muted-foreground/70 mt-2"
            >
              Powered by advanced language models
            </motion.p>
          </div>
        </div>

        <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} />
        <SignUpModal open={isSignUpOpen} onOpenChange={setIsSignUpOpen} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden relative">
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background to-blue-500/3 pointer-events-none" />
      
      {/* Header with Model Selector */}
      <div className="relative z-10 p-3 sm:p-4 flex-shrink-0 flex items-center justify-between gap-2 backdrop-blur-sm bg-background/50 border-b border-border/50">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isMobile && user && onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="h-9 w-9 shrink-0 hover:bg-accent/50 transition-colors"
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
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsLoginOpen(true)} 
              className="text-xs sm:text-sm hover:bg-accent/50"
            >
              Login
            </Button>
            <Button 
              size="sm" 
              onClick={() => setIsSignUpOpen(true)} 
              className={cn(
                "text-xs sm:text-sm",
                "bg-black text-white hover:bg-black/90",
                "hover:shadow-lg transition-all duration-300"
              )}
            >
              Sign Up
            </Button>
        </div>
        )}
      </div>
      
      {currentConversation.messages.length === 0 ? (
        <div className="relative flex-1 flex flex-col">
          <div className="flex items-start justify-center pt-8 sm:pt-16 md:pt-32">
            <div className="w-full max-w-3xl px-3 sm:px-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-6 sm:mb-8 max-w-md mx-auto"
              >
                <div className="relative inline-block mb-4">
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                  />
                  <Sparkles className="relative w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  How can I help you today?
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                  Ask me anything and I'll do my best to provide helpful, detailed responses.
                </p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <InputBar 
                  onSetInputRef={(setInput) => { setInputRef.current = setInput; }}
                  onSetFocusRef={(fn) => { focusInputRef.current = fn; }}
                  onSetFileUploadRef={(fn) => { fileUploadRef.current = fn; }}
                />
              </motion.div>
              
              {/* Recommendations */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-4 sm:mt-6"
              >
                <p className="text-center text-xs text-muted-foreground mb-3">Try asking about:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    { text: 'Create an image', icon: Sparkles },
                    { text: 'Recommend a product', icon: Zap },
                    { text: 'Improve writing', icon: Pen },
                    { text: 'Write a first draft', icon: MessageCircle },
                    { text: 'Simplify a topic', icon: Lightbulb },
                    { text: 'Get advice', icon: Bot },
                    { text: 'Draft an email', icon: Mail },
                  ].map((recommendation, index) => {
                    const Icon = recommendation.icon;
                    return (
                      <motion.div
                        key={recommendation.text}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "rounded-full text-xs px-3 sm:px-4 h-8 sm:h-9",
                            "border-2 hover:border-primary/50",
                            "hover:bg-accent/50 transition-all duration-300",
                            "group relative overflow-hidden"
                          )}
                          onClick={() => {
                            if (setInputRef.current) {
                              setInputRef.current(recommendation.text);
                            }
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                          <Icon className="w-3 h-3 mr-1.5 relative z-10" />
                          <span className="relative z-10">{recommendation.text}</span>
                        </Button>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div 
            ref={scrollContainerRef}
            className="relative flex-1 overflow-y-auto overflow-x-hidden min-h-0"
          >
            <div className="py-2 sm:py-4 pt-12 sm:pt-16">
              {currentConversation.messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
                >
                  <MessageBubble message={message} />
                </motion.div>
              ))}

              <AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="py-6 px-4"
                  >
                    <div className="max-w-3xl mx-auto flex">
                      <div className="flex-1 min-w-0 flex items-start flex-col">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-4 py-3 rounded-2xl",
                          "bg-gradient-to-br from-accent/50 to-accent/30 backdrop-blur-sm",
                          "border border-border/50 shadow-sm"
                        )}>
                          <div className="flex gap-1.5">
                            <motion.div
                              animate={{ 
                                opacity: [0.3, 1, 0.3],
                                scale: [1, 1.2, 1],
                              }}
                              transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
                              className="w-2 h-2 bg-primary rounded-full"
                            />
                            <motion.div
                              animate={{ 
                                opacity: [0.3, 1, 0.3],
                                scale: [1, 1.2, 1],
                              }}
                              transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                              className="w-2 h-2 bg-primary rounded-full"
                            />
                            <motion.div
                              animate={{ 
                                opacity: [0.3, 1, 0.3],
                                scale: [1, 1.2, 1],
                              }}
                              transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                              className="w-2 h-2 bg-primary rounded-full"
                            />
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">AI is thinking</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={scrollRef} />
            </div>
          </div>
          <div className="flex-shrink-0">
            <InputBar 
              onSetFocusRef={(fn) => { focusInputRef.current = fn; }}
              onSetFileUploadRef={(fn) => { fileUploadRef.current = fn; }}
            />
          </div>
        </>
      )}

      <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} />
      <SignUpModal open={isSignUpOpen} onOpenChange={setIsSignUpOpen} />
    </div>
  );
};
