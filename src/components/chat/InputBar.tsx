import { useState, useRef, useEffect } from 'react';
import { Send, Plus, File, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChat } from '@/contexts/ChatContext';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface InputBarProps {
  onSetInputRef?: (setInput: (value: string) => void) => void;
}

export const InputBar = ({ onSetInputRef }: InputBarProps = {}) => {
  const { sendMessage, currentConversation, isTyping, selectedModel, setSelectedModel } = useChat();
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Expose setInput function to parent via ref callback
  useEffect(() => {
    if (onSetInputRef) {
      onSetInputRef((value: string) => {
        setInput(value);
        setTimeout(() => textareaRef.current?.focus(), 0);
      });
    }
  }, [onSetInputRef]);

  const handleSubmit = async () => {
    if (!input.trim() || !currentConversation || isTyping) return;

    const message = input.trim();
    setInput('');
    await sendMessage(message, selectedModel);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <div className="border-t border-border bg-background">
      <div className="max-w-3xl mx-auto p-3 sm:p-4">
        <div className="relative flex items-end gap-1 sm:gap-2 bg-chat-input-bg border border-border rounded-2xl sm:rounded-3xl shadow-sm">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="ml-1 sm:ml-2 my-1.5 sm:my-2 rounded-lg hover:bg-accent h-8 w-8 sm:h-10 sm:w-10"
                disabled={!currentConversation || isTyping}
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2" align="start">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    // Handle file upload
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = true;
                    input.click();
                  }}
                >
                  <File className="w-4 h-4" />
                  Files
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                  onClick={() => {
                    // Handle photo upload
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.multiple = true;
                    input.click();
                  }}
                >
                  <Image className="w-4 h-4" />
                  Photo
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentConversation ? "Ask anything" : "Create a new chat to start"}
            disabled={!currentConversation || isTyping}
            className="
              flex-1 min-h-[44px] sm:min-h-[52px] max-h-[200px] resize-none
              border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0
              py-2 sm:py-3 pl-1 pr-2 sm:pr-4 text-sm sm:text-base
            "
            rows={1}
          />
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || !currentConversation || isTyping}
            size="icon"
            className="m-1.5 sm:m-2 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 h-8 w-8 sm:h-10 sm:w-10"
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-1.5 sm:mt-2 px-2">
          AI can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
};
