import { Message, FileAttachment } from '@/types/chat';
import { Copy, RotateCw, Edit2, Check, File, Download } from 'lucide-react';
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`group w-full ${isUser ? 'bg-gray-50 dark:bg-transparent' : 'bg-transparent'}`}
    >
      <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6">
        <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
          {/* Content */}
          <div className={`flex flex-col ${isUser ? 'max-w-[70%] sm:max-w-[65%] items-end' : 'max-w-[90%] sm:max-w-[85%] items-start'}`}>
            {/* Display attachments */}
            {message.attachments && message.attachments.length > 0 && (
              <div className={`mb-3 flex flex-wrap gap-2 w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
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
            
            {/* Message Content */}
            {isEditing ? (
              <div className="space-y-2 w-full">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[100px] resize-none w-full"
                  autoFocus
                />
                <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
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
              <div className="prose prose-sm dark:prose-invert max-w-none w-full">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }: any) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeString = String(children).replace(/\n$/, '');
                      
                      return !inline && match ? (
                        <div className="relative group/code my-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="absolute right-2 top-2 opacity-0 group-hover/code:opacity-100 transition-opacity z-10"
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
                    p: ({ children }: any) => (
                      <p className="mb-4 last:mb-0 leading-7">{children}</p>
                    ),
                    h1: ({ children }: any) => (
                      <h1 className="text-2xl font-bold mb-3 mt-4 first:mt-0">{children}</h1>
                    ),
                    h2: ({ children }: any) => (
                      <h2 className="text-xl font-bold mb-2 mt-3 first:mt-0">{children}</h2>
                    ),
                    h3: ({ children }: any) => (
                      <h3 className="text-lg font-bold mb-2 mt-3 first:mt-0">{children}</h3>
                    ),
                    h4: ({ children }: any) => (
                      <h4 className="text-base font-bold mb-2 mt-2 first:mt-0">{children}</h4>
                    ),
                    h5: ({ children }: any) => (
                      <h5 className="text-sm font-bold mb-1 mt-2 first:mt-0">{children}</h5>
                    ),
                    h6: ({ children }: any) => (
                      <h6 className="text-sm font-bold mb-1 mt-2 first:mt-0">{children}</h6>
                    ),
                    strong: ({ children }: any) => (
                      <strong className="font-bold">{children}</strong>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}

            {/* Action Buttons - Below Message */}
            {!isEditing && (
              <div className={`mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ${isUser ? 'justify-end' : 'justify-start'}`}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(message.content)}
                  className="h-8 px-3 text-xs"
                >
                  {copied ? (
                    <Check className="w-3 h-3 mr-1" />
                  ) : (
                    <Copy className="w-3 h-3 mr-1" />
                  )}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
                
                {!isUser && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => regenerateResponse(message.id)}
                    className="h-8 px-3 text-xs"
                  >
                    <RotateCw className="w-3 h-3 mr-1" />
                    Regenerate
                  </Button>
                )}
                
                {isUser && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleEdit}
                    className="h-8 px-3 text-xs"
                  >
                    <Edit2 className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
