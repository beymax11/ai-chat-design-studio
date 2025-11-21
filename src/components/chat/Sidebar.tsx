import { Plus, MessageSquare, MoreHorizontal, Trash2, ChevronRight, Search, Folder, User, Crown, Palette, Settings, HelpCircle, LogOut, Menu } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { SettingsModal } from './SettingsModal';
import { LoginModal } from './LoginModal';
import { SignUpModal } from './SignUpModal';
import { SearchModal } from './SearchModal';
import { ProjectsModal } from './ProjectsModal';
import { useState } from 'react';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Sidebar = ({ isCollapsed = false, onToggle, isMobile = false, isOpen = false, onOpenChange }: SidebarProps) => {
  const { 
    conversations, 
    currentConversation, 
    createNewChat, 
    switchConversation, 
    deleteConversation,
    clearAllConversations
  } = useChat();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);

  const handleLogout = async () => {
    // Clear all conversations and create a new chat
    clearAllConversations();
    await signOut();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
  };

  const handleSwitchConversation = (id: string) => {
    switchConversation(id);
    if (isMobile && onOpenChange) {
      onOpenChange(false);
    }
  };

  const handleCreateNewChat = () => {
    createNewChat();
    if (isMobile && onOpenChange) {
      onOpenChange(false);
    }
  };

  const userName = user?.user_metadata?.full_name || 'User';
  const userEmail = user?.email || 'user@example.com';

  const sidebarContent = (
    <>
      {/* Header */}
      <div className={`p-3 border-b border-border ${isCollapsed && !isMobile ? 'px-2' : ''}`}>
        {(!isCollapsed || isMobile) && (
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">BugBounty AI</h1>
            {!isMobile && onToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-8 w-8"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
        {isCollapsed && !isMobile && onToggle && (
          <div className="mb-3 flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
        <Button
          onClick={handleCreateNewChat}
          className={`w-full ${isCollapsed && !isMobile ? 'justify-center px-0' : 'justify-start gap-2'}`}
          variant="ghost"
          title={isCollapsed && !isMobile ? 'New Chat' : undefined}
        >
          <Plus className="w-4 h-4" />
          {(!isCollapsed || isMobile) && <span>New Chat</span>}
        </Button>
        <Button
          onClick={() => setIsSearchOpen(true)}
          className={`w-full mt-2 ${isCollapsed && !isMobile ? 'justify-center px-0' : 'justify-start gap-2'}`}
          variant="ghost"
          title={isCollapsed && !isMobile ? 'Search chat' : undefined}
        >
          <Search className="w-4 h-4" />
          {(!isCollapsed || isMobile) && <span>Search chat</span>}
        </Button>
        <Button
          onClick={() => setIsProjectsOpen(true)}
          className={`w-full mt-2 ${isCollapsed && !isMobile ? 'justify-center px-0' : 'justify-start gap-2'}`}
          variant="ghost"
          title={isCollapsed && !isMobile ? 'Projects' : undefined}
        >
          <Folder className="w-4 h-4" />
          {(!isCollapsed || isMobile) && <span>Projects</span>}
        </Button>
      </div>

      {/* Conversation List */}
      {(!isCollapsed || isMobile) && (
        <ScrollArea className="flex-1 px-2 py-2">
          <div className="px-3 py-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Chats History
            </h2>
          </div>
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="group relative"
              >
                <button
                  onClick={() => handleSwitchConversation(conversation.id)}
                  className={`
                    w-full text-left px-3 py-2.5 rounded-lg text-sm
                    transition-colors duration-200
                    flex items-center gap-2
                    ${
                      currentConversation?.id === conversation.id
                        ? 'text-foreground'
                        : 'text-muted-foreground'
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
      )}

      {/* Footer - Always visible at bottom */}
      <div className={`p-3 border-t border-border mt-auto ${isCollapsed && !isMobile ? 'px-2' : ''}`}>
        {/* Profile Section */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`group w-full flex items-center gap-2 p-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors data-[state=open]:bg-accent data-[state=open]:text-accent-foreground ${isCollapsed && !isMobile ? 'justify-center' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-primary/10 group-hover:bg-accent-foreground/20 flex items-center justify-center flex-shrink-0 transition-colors">
                <User className="w-4 h-4 text-foreground group-hover:text-accent-foreground transition-colors" />
              </div>
              {(!isCollapsed || isMobile) && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-foreground group-hover:text-accent-foreground truncate transition-colors">{userName}</p>
                  <p className="text-xs text-muted-foreground group-hover:text-accent-foreground/80 truncate transition-colors">{userEmail}</p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Plan
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Palette className="w-4 h-4 mr-2" />
              Personalization
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsSettingsOpen(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HelpCircle className="w-4 h-4 mr-2" />
              Help
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user ? (
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem onClick={() => setIsLoginOpen(true)}>
                  <User className="w-4 h-4 mr-2" />
                  Login
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsSignUpOpen(true)}>
                  <User className="w-4 h-4 mr-2" />
                  Sign Up
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <SettingsModal open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
        <LoginModal open={isLoginOpen} onOpenChange={setIsLoginOpen} />
        <SignUpModal open={isSignUpOpen} onOpenChange={setIsSignUpOpen} />
        <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
        <ProjectsModal open={isProjectsOpen} onOpenChange={setIsProjectsOpen} />
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0">
          <div className="bg-chat-sidebar-bg flex flex-col h-full">
            {sidebarContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className={`${isCollapsed ? 'w-16' : 'w-64'} bg-chat-sidebar-bg border-r border-border flex flex-col h-screen relative transition-all duration-300 hidden md:flex`}
    >
      {sidebarContent}
    </motion.aside>
  );
};
