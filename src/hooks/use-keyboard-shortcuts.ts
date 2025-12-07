import { useEffect, useRef } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useKeyboardShortcuts } from '@/contexts/KeyboardShortcutsContext';

export const useKeyboardShortcutsHandler = (
  onToggleSidebar?: () => void,
  onFocusInput?: () => void,
  onFileUpload?: () => void
) => {
  const { createNewChat, currentConversation, deleteConversation } = useChat();
  const { setIsSearchOpen, setIsKeyboardShortcutsOpen, setIsSettingsOpen } = useKeyboardShortcuts();
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for shortcuts that should work everywhere first
      // Ctrl + Shift + O: Open new chat
      if ((e.key === 'o' || e.key === 'O') && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        createNewChat();
        return;
      }

      // Ctrl + Shift + S: Toggle sidebar
      if ((e.key === 's' || e.key === 'S') && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        onToggleSidebar?.();
        return;
      }

      // Ctrl + K: Search chats (works everywhere)
      if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        setIsSearchOpen(true);
        return;
      }

      // Ctrl + /: Show shortcuts (works everywhere)
      if (e.key === '/' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        setIsKeyboardShortcutsOpen(true);
        return;
      }

      // Don't trigger other shortcuts when user is typing in input fields
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        (target.closest('[role="textbox"]') && !e.ctrlKey && !e.metaKey)
      ) {
        // Allow Shift+Esc to focus input
        if (e.key === 'Escape' && e.shiftKey) {
          e.preventDefault();
          onFocusInput?.();
          return;
        }
        // Allow Ctrl+U for file upload
        if ((e.key === 'u' || e.key === 'U') && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
          e.preventDefault();
          onFileUpload?.();
          return;
        }
        return;
      }

      // Ctrl + Shift + ;: Copy last code block
      if ((e.key === ';' || e.key === ':') && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        if (currentConversation) {
          // Find the last assistant message with code blocks
          const messages = currentConversation.messages;
          for (let i = messages.length - 1; i >= 0; i--) {
            const message = messages[i];
            if (message.role === 'assistant') {
              // Look for code blocks in the message
              const codeBlockRegex = /```[\s\S]*?```/g;
              const matches = message.content.match(codeBlockRegex);
              if (matches && matches.length > 0) {
                const lastCodeBlock = matches[matches.length - 1];
                // Remove the ``` markers
                const code = lastCodeBlock.replace(/```[\w]*\n?/g, '').trim();
                navigator.clipboard.writeText(code).then(() => {
                  // You could show a toast here
                });
                return;
              }
            }
          }
        }
        return;
      }

      // Ctrl + Shift + Delete: Delete chat
      if (e.key === 'Delete' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        if (currentConversation) {
          deleteConversation(currentConversation.id);
        }
        return;
      }

      // Shift + Esc: Focus chat input
      if (e.key === 'Escape' && e.shiftKey) {
        e.preventDefault();
        onFocusInput?.();
        return;
      }

      // Ctrl + U: Add photos & files
      if ((e.key === 'u' || e.key === 'U') && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        onFileUpload?.();
        return;
      }

      // Ctrl + .: Toggle dev mode (placeholder - can be implemented later)
      if ((e.key === '.' || e.key === '>') && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        // Toggle dev mode - can be implemented later
        console.log('Toggle dev mode');
        return;
      }

      // Ctrl + Shift + I: Set custom instructions (placeholder - can be implemented later)
      if ((e.key === 'i' || e.key === 'I') && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        setIsSettingsOpen(true);
        // Could navigate to custom instructions section if it exists
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    createNewChat,
    currentConversation,
    deleteConversation,
    setIsSearchOpen,
    setIsKeyboardShortcutsOpen,
    setIsSettingsOpen,
    onToggleSidebar,
    onFocusInput,
    onFileUpload,
  ]);
};

