import { useEffect, useState, useRef } from 'react';
import { ChatProvider, useChat } from '@/contexts/ChatContext';
import { useAuth } from '@/contexts/AuthContext';
import { KeyboardShortcutsProvider } from '@/contexts/KeyboardShortcutsContext';
import { Sidebar } from '@/components/chat/Sidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { InputBar } from '@/components/chat/InputBar';
import { ThemeProvider } from 'next-themes';
import { useIsMobile } from '@/hooks/use-mobile';
import { useKeyboardShortcutsHandler } from '@/hooks/use-keyboard-shortcuts';

const ChatApp = () => {
  const { createNewChat, conversations, currentConversation } = useChat();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);
  const focusInputRef = useRef<(() => void) | null>(null);
  const fileUploadRef = useRef<(() => void) | null>(null);

  // Setup keyboard shortcuts
  useKeyboardShortcutsHandler(
    () => setIsSidebarCollapsed(!isSidebarCollapsed),
    () => focusInputRef.current?.(),
    () => fileUploadRef.current?.()
  );

  useEffect(() => {
    // Only create a new chat if we've checked storage and there are no conversations
    if (hasCheckedStorage && conversations.length === 0 && !currentConversation) {
      createNewChat();
    }
    // Mark that we've checked storage after a brief delay to allow localStorage to load
    if (!hasCheckedStorage) {
      const timer = setTimeout(() => {
        setHasCheckedStorage(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [conversations, currentConversation, hasCheckedStorage, createNewChat]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {user && (
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          isMobile={isMobile}
          isOpen={isSidebarOpen}
          onOpenChange={setIsSidebarOpen}
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatWindow 
          onMenuClick={() => setIsSidebarOpen(true)}
          onSetFocusInputRef={(fn) => { focusInputRef.current = fn; }}
          onSetFileUploadRef={(fn) => { fileUploadRef.current = fn; }}
        />
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <ChatProvider>
        <KeyboardShortcutsProvider>
          <ChatApp />
        </KeyboardShortcutsProvider>
      </ChatProvider>
    </ThemeProvider>
  );
};

export default Index;
