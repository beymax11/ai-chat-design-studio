import { useEffect } from 'react';
import { ChatProvider, useChat } from '@/contexts/ChatContext';
import { Sidebar } from '@/components/chat/Sidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { InputBar } from '@/components/chat/InputBar';
import { ThemeProvider } from 'next-themes';

const ChatApp = () => {
  const { createNewChat, conversations } = useChat();

  useEffect(() => {
    if (conversations.length === 0) {
      createNewChat();
    }
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatWindow />
        <InputBar />
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <ChatProvider>
        <ChatApp />
      </ChatProvider>
    </ThemeProvider>
  );
};

export default Index;
