import { useState, useMemo } from 'react';
import { Search, MessageSquare, X, Sparkles, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/contexts/ChatContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SearchModal = ({ open, onOpenChange }: SearchModalProps) => {
  const { conversations, switchConversation } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }

    const query = searchQuery.toLowerCase();
    return conversations.filter(conv => {
      // Search in title
      if (conv.title.toLowerCase().includes(query)) {
        return true;
      }
      // Search in messages
      return conv.messages.some(msg => 
        msg.content.toLowerCase().includes(query)
      );
    });
  }, [conversations, searchQuery]);

  const handleSelectConversation = (conversationId: string) => {
    switchConversation(conversationId);
    onOpenChange(false);
    setSearchQuery('');
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={index} className="bg-primary/20 text-primary font-semibold">{part}</mark>
        : part
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-w-[95vw] mx-4 max-h-[90vh] flex flex-col p-0 border-0 shadow-2xl overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-background to-primary/5" />
        
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>

        <div className="relative bg-background/80 backdrop-blur-xl flex flex-col h-full">
          {/* Header with Icon */}
          <div className="p-6 sm:p-8 pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-primary/20 rounded-full blur-xl" />
                <div className="relative bg-gradient-to-br from-purple-500 via-primary to-purple-600 p-4 rounded-2xl shadow-lg">
                  <Search className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
            </motion.div>

            <DialogHeader className="space-y-2 mb-6">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Search Conversations
                </DialogTitle>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-center text-sm text-muted-foreground"
              >
                Find any conversation by title or message content
              </motion.p>
            </DialogHeader>

            {/* Search Input */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="relative group"
            >
              <Search className={cn(
                "absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-200",
                searchFocused ? "text-primary" : "text-muted-foreground"
              )} />
              <Input
                placeholder="Search by title or message content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={cn(
                  "h-14 pl-12 pr-12 text-base rounded-xl",
                  "border-2 transition-all duration-300",
                  "focus:border-primary focus:ring-4 focus:ring-primary/10",
                  "hover:border-primary/50",
                  "bg-background/50 backdrop-blur-sm"
                )}
                autoFocus
              />
              <AnimatePresence>
                {searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {searchFocused && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    exit={{ scaleX: 0 }}
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary to-primary/0"
                  />
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="space-y-4 flex-1 overflow-hidden flex flex-col px-6 sm:px-8 pb-6 sm:pb-8">

          <AnimatePresence mode="wait">
            {searchQuery ? (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-h-0 flex flex-col"
              >
                {/* Results Count */}
                {filteredConversations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-3 flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>
                      Found <span className="font-semibold text-foreground">{filteredConversations.length}</span> conversation{filteredConversations.length !== 1 ? 's' : ''}
                    </span>
                  </motion.div>
                )}

                <ScrollArea className="flex-1 min-h-0">
                  {filteredConversations.length > 0 ? (
                    <div className="space-y-3 pr-2">
                      {filteredConversations.map((conversation, index) => (
                        <motion.button
                          key={conversation.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          onClick={() => handleSelectConversation(conversation.id)}
                          whileHover={{ scale: 1.02, x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          className={cn(
                            "w-full text-left p-4 rounded-2xl relative group",
                            "border-2 border-border transition-all duration-300",
                            "hover:border-primary/30 hover:bg-accent/50",
                            "hover:shadow-lg hover:shadow-primary/5",
                            "bg-background/50 backdrop-blur-sm"
                          )}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="flex items-start gap-3 relative z-10">
                            <div className="relative mt-1">
                              <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="relative bg-gradient-to-br from-primary/10 to-purple-500/10 p-2 rounded-lg">
                                <MessageSquare className="w-4 h-4 text-primary flex-shrink-0" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-base truncate mb-1">
                                {highlightText(conversation.title, searchQuery)}
                              </p>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {conversation.messages.length > 0
                                  ? highlightText(
                                      conversation.messages[0].content.substring(0, 150),
                                      searchQuery
                                    )
                                  : 'No messages'}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                  <MessageSquare className="w-3 h-3" />
                                  {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''}
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-3 h-3" />
                                  {new Date(conversation.updatedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={cn(
                        "text-center py-12 px-4 text-muted-foreground",
                        "rounded-2xl border-2 border-dashed border-muted/50",
                        "bg-muted/10"
                      )}
                    >
                      <motion.div
                        animate={{
                          rotate: [0, 10, -10, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                      </motion.div>
                      <p className="text-base font-medium mb-1">No results found</p>
                      <p className="text-sm text-muted-foreground/70">
                        No conversations match "<span className="font-semibold text-foreground">{searchQuery}</span>"
                      </p>
                    </motion.div>
                  )}
                </ScrollArea>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "flex-1 flex items-center justify-center",
                  "text-center py-12 px-4 text-muted-foreground",
                  "rounded-2xl border-2 border-dashed border-muted/50",
                  "bg-muted/10"
                )}
              >
                <div>
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <div className="relative inline-block">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                      <Search className="relative w-16 h-16 mx-auto mb-4 text-primary/50" />
                    </div>
                  </motion.div>
                  <p className="text-base font-medium mb-1">Ready to search</p>
                  <p className="text-sm text-muted-foreground/70">
                    Start typing to find conversations...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

