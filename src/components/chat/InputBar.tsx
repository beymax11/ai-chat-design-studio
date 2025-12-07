import { useState, useRef, useEffect } from 'react';
import { Send, Plus, File, Image, X, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useChat } from '@/contexts/ChatContext';
import { FileAttachment } from '@/types/chat';
import { v4 as uuidv4 } from 'uuid';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface InputBarProps {
  onSetInputRef?: (setInput: (value: string) => void) => void;
  onSetFocusRef?: (fn: () => void) => void;
  onSetFileUploadRef?: (fn: () => void) => void;
}

export const InputBar = ({ onSetInputRef, onSetFocusRef, onSetFileUploadRef }: InputBarProps = {}) => {
  const { sendMessage, currentConversation, isTyping, selectedModel, setSelectedModel } = useChat();
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
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

  // Expose focus function
  useEffect(() => {
    if (onSetFocusRef) {
      onSetFocusRef(() => {
        textareaRef.current?.focus();
      });
    }
  }, [onSetFocusRef]);

  // Expose file upload function
  useEffect(() => {
    if (onSetFileUploadRef) {
      onSetFileUploadRef(() => {
        handleFileUpload();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onSetFileUploadRef]);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(',')[1] || result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newAttachments: FileAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const base64Data = await convertFileToBase64(file);
        const attachment: FileAttachment = {
          id: uuidv4(),
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64Data,
          url: file.type.startsWith('image/') ? `data:${file.type};base64,${base64Data}` : undefined,
        };
        newAttachments.push(attachment);
      } catch (error) {
        console.error('Error converting file to base64:', error);
      }
    }

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      handleFileSelect(target.files);
    };
    input.click();
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      handleFileSelect(target.files);
    };
    input.click();
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async () => {
    if ((!input.trim() && attachments.length === 0) || !currentConversation || isTyping) return;

    const message = input.trim() || 'Sent files';
    const messageAttachments = [...attachments];
    setInput('');
    setAttachments([]);
    await sendMessage(message, selectedModel, messageAttachments);
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

  useEffect(() => {
    if (onSetInputRef) {
      onSetInputRef((value: string) => {
        setInput(value);
        setTimeout(() => textareaRef.current?.focus(), 0);
      });
    }
  }, [onSetInputRef]);

  return (
    <div className="border-t border-border bg-background">
      <div className="max-w-3xl mx-auto p-3 sm:p-4">
        {/* Display selected attachments */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-3 flex flex-wrap gap-2"
            >
              {attachments.map((attachment, index) => (
                <motion.div
                  key={attachment.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={cn(
                    "relative group border border-border rounded-lg p-2.5",
                    "bg-muted/50",
                    "flex items-center gap-2.5 max-w-[220px]",
                    "hover:bg-muted transition-all duration-300"
                  )}
                >
                  {attachment.type.startsWith('image/') && attachment.url ? (
                    <img
                      src={attachment.url}
                      alt={attachment.name}
                      className="w-14 h-14 object-cover rounded border border-border"
                    />
                  ) : (
                    <div className="w-14 h-14 bg-muted rounded flex items-center justify-center border border-border">
                      <File className="w-7 h-7 text-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{attachment.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeAttachment(attachment.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <div className={cn(
          "relative flex items-end gap-1 sm:gap-2",
          "bg-background border border-border rounded-2xl sm:rounded-3xl",
          "shadow-sm hover:shadow-md transition-all duration-300"
        )}>
          {/* Attachment Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="ml-1.5 sm:ml-2 my-2 rounded-lg hover:bg-accent h-9 w-9 sm:h-10 sm:w-10"
                disabled={!currentConversation || isTyping}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 rounded-lg" align="start">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 hover:bg-accent"
                  onClick={handleFileUpload}
                >
                  <File className="w-4 h-4" />
                  <span>Upload Files</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 hover:bg-accent"
                  onClick={handleImageUpload}
                >
                  <Image className="w-4 h-4" />
                  <span>Upload Photo</span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Textarea */}
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={currentConversation ? "Ask anything..." : "Create a new chat to start"}
            disabled={!currentConversation || isTyping}
            className={cn(
              "flex-1 min-h-[44px] sm:min-h-[52px] max-h-[200px] resize-none",
              "border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0",
              "py-2 sm:py-3 pl-1 pr-2 sm:pr-4 text-sm sm:text-base"
            )}
            rows={1}
          />

          {/* Send Button */}
          <Button
            onClick={handleSubmit}
            disabled={(!input.trim() && attachments.length === 0) || !currentConversation || isTyping}
            size="icon"
            className={cn(
              "m-1.5 sm:m-2 rounded-lg",
              "bg-foreground hover:bg-foreground/90",
              "text-background",
              "disabled:opacity-50",
              "h-9 w-9 sm:h-10 sm:w-10",
              "transition-all duration-200"
            )}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        {/* Footer Note */}
        <p className="text-xs text-muted-foreground text-center mt-2 px-2">
          AI can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  );
};
