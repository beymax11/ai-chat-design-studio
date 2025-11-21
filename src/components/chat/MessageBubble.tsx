import { Message } from '@/types/chat';
import { Copy, RotateCw, Edit2, Check, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useChat } from '@/contexts/ChatContext';
import { useTheme } from 'next-themes';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/contexts/TranslationContext';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { regenerateResponse, editMessage } = useChat();
  const { theme } = useTheme();
  const { translateText, targetLanguage } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showOriginal, setShowOriginal] = useState(true);

  // Reset translation when message content changes
  useEffect(() => {
    setTranslatedContent(null);
    setShowOriginal(true);
  }, [message.content, message.id]);

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

  const handleTranslate = async () => {
    if (showOriginal && translatedContent === null) {
      setIsTranslating(true);
      try {
        const translated = await translateText(message.content, targetLanguage);
        setTranslatedContent(translated);
        setShowOriginal(false);
      } catch (error) {
        console.error('Translation failed:', error);
      } finally {
        setIsTranslating(false);
      }
    } else {
      setShowOriginal(!showOriginal);
    }
  };

  const isUser = message.role === 'user';
  const displayContent = showOriginal ? message.content : (translatedContent || message.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group py-6 px-4"
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
              ${isUser ? 'bg-primary/10 dark:bg-primary/20 rounded-lg px-4 py-3 inline-block' : ''}
            `}>
              <div className={`
                prose prose-sm dark:prose-invert max-w-none
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
                {displayContent}
              </ReactMarkdown>
              {translatedContent && (
                <div className="mt-2 text-xs text-muted-foreground italic">
                  {showOriginal ? 'Showing original text' : 'Showing translated text'}
                </div>
              )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {!isEditing && (
            <div className={`
              mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity
              ${isUser ? 'justify-end' : 'justify-start'}
            `}>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopy(displayContent)}
              >
                {copied ? (
                  <Check className="w-4 h-4 mr-1" />
                ) : (
                  <Copy className="w-4 h-4 mr-1" />
                )}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handleTranslate}
                disabled={isTranslating || targetLanguage === 'auto-detect'}
                title={targetLanguage === 'auto-detect' ? 'Select a target language in settings' : undefined}
              >
                <Languages className="w-4 h-4 mr-1" />
                {isTranslating 
                  ? 'Translating...' 
                  : translatedContent 
                    ? (showOriginal ? 'Show Translation' : 'Show Original') 
                    : 'Translate'}
              </Button>
              
              {!isUser && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => regenerateResponse(message.id)}
                >
                  <RotateCw className="w-4 h-4 mr-1" />
                  Regenerate
                </Button>
              )}
              
              {isUser && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEdit}
                >
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
