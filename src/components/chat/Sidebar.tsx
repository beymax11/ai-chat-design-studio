import { Plus, MessageSquare, MoreHorizontal, Trash2, Moon, Sun } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

export const Sidebar = () => {
  const { 
    conversations, 
    currentConversation, 
    createNewChat, 
    switchConversation, 
    deleteConversation 
  } = useChat();
  const { theme, setTheme } = useTheme();

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-64 bg-chat-sidebar-bg border-r border-border flex flex-col h-screen"
    >
      {/* Header */}
      <div className="p-3 border-b border-border">
        <Button
          onClick={createNewChat}
          className="w-full justify-start gap-2 bg-secondary hover:bg-secondary/80"
          variant="secondary"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1 px-2 py-2">
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className="group relative"
            >
              <button
                onClick={() => switchConversation(conversation.id)}
                className={`
                  w-full text-left px-3 py-2.5 rounded-lg text-sm
                  transition-colors duration-200
                  flex items-center gap-2
                  ${
                    currentConversation?.id === conversation.id
                      ? 'bg-chat-sidebar-active text-foreground'
                      : 'hover:bg-chat-sidebar-hover text-muted-foreground'
                  }
                `}
              >
                <MessageSquare className="w-4 h-4 flex-shrink-0" />
                <span className="truncate flex-1">{conversation.title}</span>
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`
                      absolute right-1 top-1/2 -translate-y-1/2
                      h-7 w-7 p-0 opacity-0 group-hover:opacity-100
                      transition-opacity
                    `}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => deleteConversation(conversation.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-full justify-start gap-2"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4" />
              Light Mode
            </>
          ) : (
            <>
              <Moon className="w-4 h-4" />
              Dark Mode
            </>
          )}
        </Button>
      </div>
    </motion.aside>
  );
};
