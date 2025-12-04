import { Message, FileAttachment } from '@/types/chat';
import { Copy, RotateCw, Edit2, Check, File, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useTheme } from 'next-themes';
import { Textarea } from '@/components/ui/textarea';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { regenerateResponse, editMessage } = useChat();
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() !== message.content) {
      editMessage(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const downloadFile = (attachment: FileAttachment) => {
    try {
      const base64Data = attachment.data;
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: attachment.type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group py-3 sm:py-6 px-3 sm:px-4"
    >
      <div className={`
        max-w-3xl mx-auto flex
        ${isUser ? 'flex-row-reverse' : 'flex-row'}
      `}>
        {/* Content */}
        <div className={`
          flex-1 min-w-0
          ${isUser ? 'flex items-end flex-col' : 'flex items-start flex-col'}
        `}>
          {/* Display attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className={`
              mb-2 flex flex-wrap gap-2 w-full
              ${isUser ? 'justify-end' : 'justify-start'}
            `}>
              {message.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="relative group/attachment border border-border rounded-lg p-2 bg-muted/50 max-w-[300px]"
                >
                  {attachment.type.startsWith('image/') && attachment.url ? (
                    <div className="relative">
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="max-w-full max-h-64 object-contain rounded"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 bg-background/80 hover:bg-background"
                        onClick={() => downloadFile(attachment)}
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <File className="w-8 h-8 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{attachment.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => downloadFile(attachment)}
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {isEditing ? (
            <div className={`
              space-y-2 w-full
              ${isUser ? 'flex items-end flex-col' : 'flex items-start flex-col'}
            `}>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[100px] resize-none w-full"
                autoFocus
              />
              <div className={`
                flex gap-2
                ${isUser ? 'justify-end' : 'justify-start'}
              `}>
                <Button size="sm" onClick={handleSaveEdit}>
                  <Check className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className={`
              ${isUser ? 'bg-primary/10 dark:bg-primary/20 rounded-lg px-3 py-2 sm:px-4 sm:py-3 inline-block' : ''}
            `}>
              <div className={`
                prose prose-sm dark:prose-invert max-w-none text-sm sm:text-base
                ${isUser ? 'text-right' : 'text-left'}
              `}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');
                    
                    return !inline && match ? (
                      <div className="relative group/code">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute right-2 top-2 opacity-0 group-hover/code:opacity-100 transition-opacity"
                          onClick={() => handleCopy(codeString)}
                        >
                          {copied ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                        <SyntaxHighlighter
                          style={theme === 'dark' ? oneDark : oneLight}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-lg"
                          {...props}
                        >
                          {codeString}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isEditing && (
            <div className={`
              mt-2 sm:mt-3 flex flex-wrap gap-1 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity
              ${isUser ? 'justify-end' : 'justify-start'}
            `}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopy(message.content)}
                className="text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
              >
                {copied ? (
                  <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                ) : (
                  <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                )}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
              </Button>
              
              {!isUser && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => regenerateResponse(message.id)}
                  className="text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
                >
                  <RotateCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">Regenerate</span>
                </Button>
              )}
              
              {isUser && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEdit}
                  className="text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3"
                >
                  <Edit2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
