import { Plus, MessageSquare, MoreHorizontal, Trash2, ChevronRight, Search, Folder, User, Crown, Settings, HelpCircle, LogOut, Menu, Sparkles, BookOpen, FileText, Keyboard } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { SettingsModal } from './SettingsModal';
import { LoginModal } from './LoginModal';
import { SignUpModal } from './SignUpModal';
import { SearchModal } from './SearchModal';
import { ProjectsModal } from './ProjectsModal';
import { UpgradePlanModal } from './UpgradePlanModal';
import { EditProfileModal } from './EditProfileModal';
import { HelpCenterModal } from './HelpCenterModal';
import { TermsAndPoliciesModal } from './TermsAndPoliciesModal';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';
import { useState, useEffect } from 'react';
import { useKeyboardShortcuts } from '@/contexts/KeyboardShortcutsContext';

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
  const { 
    isSearchOpen, setIsSearchOpen,
    isProjectsOpen, setIsProjectsOpen,
    isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen,
    isSettingsOpen, setIsSettingsOpen
  } = useKeyboardShortcuts();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [isUpgradePlanOpen, setIsUpgradePlanOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  const [isTermsAndPoliciesOpen, setIsTermsAndPoliciesOpen] = useState(false);
  const [termsAndPoliciesSection, setTermsAndPoliciesSection] = useState<'terms' | 'privacy'>('terms');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Load user profile picture
  useEffect(() => {
    const loadAvatar = async () => {
      if (!user) {
        setAvatarUrl(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading avatar:', error);
          return;
        }

        setAvatarUrl(data?.avatar_url || null);
      } catch (error) {
        console.error('Error loading avatar:', error);
      }
    };

    loadAvatar();

    // Listen for profile updates
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user?.id}`,
        },
        (payload) => {
          setAvatarUrl(payload.new.avatar_url || null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

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
      <div className={`p-4 border-b border-border/50 bg-gradient-to-b from-background to-transparent ${isCollapsed && !isMobile ? 'px-3' : ''}`}>
        {(!isCollapsed || isMobile) && (
          <div className="mb-4 flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              
              <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                BugBounty
              </h1>
            </motion.div>
            {!isMobile && onToggle && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="h-8 w-8 hover:bg-accent/50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
        {isCollapsed && !isMobile && onToggle && (
          <div className="mb-4 flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-10 w-10 hover:bg-accent/50 transition-colors"
              title="Expand sidebar"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
            </Button>
          </div>
        )}
        <div className="space-y-1.5">
          <Button
            onClick={handleCreateNewChat}
            className={`w-full group ${isCollapsed && !isMobile ? 'justify-center px-0' : 'justify-start gap-2.5'} hover:bg-accent/50 hover:text-accent-foreground transition-all duration-200`}
            variant="ghost"
            title={isCollapsed && !isMobile ? 'New Chat' : undefined}
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 90 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Plus className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            </motion.div>
            {(!isCollapsed || isMobile) && <span className="font-medium">New Chat</span>}
          </Button>
          <Button
            onClick={() => setIsSearchOpen(true)}
            className={`w-full group ${isCollapsed && !isMobile ? 'justify-center px-0' : 'justify-start gap-2.5'} hover:bg-accent/50 hover:text-accent-foreground transition-all duration-200`}
            variant="ghost"
            title={isCollapsed && !isMobile ? 'Search chat' : undefined}
          >
            <Search className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            {(!isCollapsed || isMobile) && <span>Search chat</span>}
          </Button>
          <Button
            onClick={() => setIsProjectsOpen(true)}
            className={`w-full group ${isCollapsed && !isMobile ? 'justify-center px-0' : 'justify-start gap-2.5'} hover:bg-accent/50 hover:text-accent-foreground transition-all duration-200`}
            variant="ghost"
            title={isCollapsed && !isMobile ? 'Projects' : undefined}
          >
            <Folder className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            {(!isCollapsed || isMobile) && <span>Projects</span>}
          </Button>
        </div>
      </div>

      {/* Conversation List */}
      {(!isCollapsed || isMobile) && (
        <ScrollArea className="flex-1 px-3 py-3">
          <div className="px-2 py-2 mb-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              <span>Chats History</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            </h2>
          </div>
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {conversations.map((conversation, index) => (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className="group relative"
                >
                  <button
                    onClick={() => handleSwitchConversation(conversation.id)}
                    className={`
                      w-full text-left px-3 py-2.5 rounded-lg text-sm
                      transition-all duration-200
                      flex items-center gap-2.5
                      relative overflow-hidden
                      cursor-pointer z-10
                      ${
                        currentConversation?.id === conversation.id
                          ? 'bg-primary/10 text-foreground font-medium shadow-sm'
                          : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                      }
                    `}
                  >
                    {currentConversation?.id === conversation.id && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <MessageSquare className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      currentConversation?.id === conversation.id ? 'text-primary' : ''
                    }`} />
                    <span className="truncate flex-1">{conversation.title}</span>
                  </button>

                  <div className="absolute right-1 top-1/2 -translate-y-1/2 z-20 pointer-events-none group-hover:pointer-events-auto">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`
                            h-7 w-7 p-0 opacity-0 group-hover:opacity-100
                            transition-all duration-200 hover:bg-accent/70
                          `}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteConversation(conversation.id);
                          }}
                          className="text-destructive focus:text-destructive focus:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {conversations.length === 0 && (
              <div className="px-3 py-8 text-center">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">No conversations yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      )}

      {/* Footer - Always visible at bottom */}
      <div className={`p-4 border-t border-border/50 bg-gradient-to-t from-background to-transparent mt-auto ${isCollapsed && !isMobile ? 'px-3' : ''}`}>
        {/* Profile Section */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={`group w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/50 hover:text-accent-foreground transition-all duration-200 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground ${isCollapsed && !isMobile ? 'justify-center' : ''}`}>
              <Avatar className="relative w-9 h-9 flex-shrink-0 shadow-sm group-hover:shadow-md transition-all duration-200 border-2 border-transparent group-hover:border-primary/20 group-data-[state=open]:border-primary/40">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={userName} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 group-data-[state=open]:from-primary/40 group-data-[state=open]:to-primary/30">
                  <User className="w-4 h-4 text-foreground group-hover:text-accent-foreground group-data-[state=open]:text-white transition-colors" />
                </AvatarFallback>
              </Avatar>
              {(!isCollapsed || isMobile) && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-semibold text-foreground group-hover:text-accent-foreground group-data-[state=open]:text-white truncate transition-colors">{userName}</p>
                  <p className="text-xs text-muted-foreground group-hover:text-accent-foreground/80 group-data-[state=open]:text-white/80 truncate transition-colors">Free Plan</p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {/* Profile Info Section */}
            {user && (
              <>
                <div 
                  onClick={() => setIsEditProfileOpen(true)}
                  className="px-2 py-2.5 border-b border-border/50 cursor-pointer hover:bg-accent/50 transition-colors rounded-t-md"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 flex-shrink-0 shadow-sm">
                      {avatarUrl ? (
                        <AvatarImage src={avatarUrl} alt={userName} className="object-cover" />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                        <User className="w-5 h-5 text-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
                      <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={() => setIsUpgradePlanOpen(true)} className="cursor-pointer">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Plan
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsSettingsOpen(true)} className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user ? (
              <>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent {...({ side: "top", align: "end", sideOffset: 12, alignOffset: -36 } as any)}>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => setIsHelpCenterOpen(true)}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Help Center
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => {
                        setTermsAndPoliciesSection('terms');
                        setIsTermsAndPoliciesOpen(true);
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Terms & Policies
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => setIsKeyboardShortcutsOpen(true)}
                    >
                      <Keyboard className="w-4 h-4 mr-2" />
                      Keyboard Shortcuts
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="cursor-pointer">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent {...({ side: "top", align: "end", sideOffset: 12, alignOffset: -36 } as any)}>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => setIsHelpCenterOpen(true)}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Help Center
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => {
                        setTermsAndPoliciesSection('terms');
                        setIsTermsAndPoliciesOpen(true);
                      }}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Terms & Policies
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => setIsKeyboardShortcutsOpen(true)}
                    >
                      <Keyboard className="w-4 h-4 mr-2" />
                      Keyboard Shortcuts
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
                <DropdownMenuItem onClick={() => setIsLoginOpen(true)} className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsSignUpOpen(true)} className="cursor-pointer">
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
        <UpgradePlanModal open={isUpgradePlanOpen} onOpenChange={setIsUpgradePlanOpen} />
        <EditProfileModal 
          open={isEditProfileOpen} 
          onOpenChange={(open) => {
            setIsEditProfileOpen(open);
            // Reload avatar when modal closes after saving
            if (!open && user) {
              supabase
                .from('profiles')
                .select('avatar_url')
                .eq('id', user.id)
                .single()
                .then(({ data }) => {
                  if (data) {
                    setAvatarUrl(data.avatar_url || null);
                  }
                });
            }
          }} 
        />
        <HelpCenterModal 
          open={isHelpCenterOpen} 
          onOpenChange={setIsHelpCenterOpen}
        />
        <TermsAndPoliciesModal 
          open={isTermsAndPoliciesOpen} 
          onOpenChange={setIsTermsAndPoliciesOpen}
          initialSection={termsAndPoliciesSection}
        />
        <KeyboardShortcutsModal 
          open={isKeyboardShortcutsOpen} 
          onOpenChange={setIsKeyboardShortcutsOpen}
        />
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 border-r border-border/50">
          <div className="bg-chat-sidebar-bg flex flex-col h-full backdrop-blur-sm">
            {sidebarContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <motion.aside
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`${isCollapsed ? 'w-16' : 'w-64'} bg-chat-sidebar-bg/95 backdrop-blur-sm border-r border-border/50 flex flex-col h-screen relative transition-all duration-300 hidden md:flex shadow-lg`}
    >
      {sidebarContent}
    </motion.aside>
  );
};
