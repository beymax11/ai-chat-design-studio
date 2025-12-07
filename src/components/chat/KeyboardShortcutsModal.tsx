import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Shortcut {
  label: string;
  keys: string[];
}

interface ShortcutSection {
  title: string;
  shortcuts: Shortcut[];
}

const shortcutSections: ShortcutSection[] = [
  {
    title: '',
    shortcuts: [
      { label: 'Search chats', keys: ['Ctrl', 'K'] },
      { label: 'Open new chat', keys: ['Ctrl', 'Shift', 'O'] },
      { label: 'Toggle sidebar', keys: ['Ctrl', 'Shift', 'S'] },
    ],
  },
  {
    title: 'Chat',
    shortcuts: [
   
      { label: 'Delete chat', keys: ['Ctrl', 'Shift', 'Delete'] },
     
      { label: 'Add photos & files', keys: ['Ctrl', 'U'] },
    ],
  },
  {
    title: 'Settings',
    shortcuts: [
     
      { label: 'Show shortcuts', keys: ['Ctrl', '/'] },
   
    ],
  },
];

const KeyBadge = ({ keyText }: { keyText: string }) => {
  return (
    <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded shadow-sm">
      {keyText}
    </kbd>
  );
};

export const KeyboardShortcutsModal = ({ open, onOpenChange }: KeyboardShortcutsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(
          "fixed left-4 bottom-4 top-auto right-auto",
          "w-[400px] max-w-[calc(100vw-2rem)] max-h-[600px]",
          "p-0 border shadow-2xl overflow-hidden rounded-lg",
          "bg-background/95 backdrop-blur-xl",
          "translate-x-0 translate-y-0",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[state=closed]:slide-out-to-bottom-4 data-[state=open]:slide-in-from-bottom-4"
        )}
        style={{
          left: '1rem',
          bottom: '1rem',
          top: 'auto',
          right: 'auto',
          transform: 'none',
        }}
      >
        <div className="relative flex flex-col" style={{ maxHeight: '600px', height: 'auto' }}>
          {/* Header */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
            <DialogTitle className="text-xl font-semibold">
              Keyboard shortcuts
            </DialogTitle>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
            <AnimatePresence>
              {shortcutSections.map((section, sectionIndex) => (
                <motion.div
                  key={sectionIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.1 }}
                  className={cn(
                    "space-y-3",
                    sectionIndex > 0 && "mt-6"
                  )}
                >
                  {section.title && (
                    <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
                      {section.title}
                    </h3>
                  )}
                  <div className="space-y-2.5">
                    {section.shortcuts.map((shortcut, shortcutIndex) => (
                      <motion.div
                        key={shortcutIndex}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: sectionIndex * 0.1 + shortcutIndex * 0.05 }}
                        className="flex items-center justify-between py-2"
                      >
                        <span className="text-sm text-muted-foreground">
                          {shortcut.label}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {shortcut.keys.map((key, keyIndex) => (
                            <div key={keyIndex} className="flex items-center gap-1.5">
                              <KeyBadge keyText={key} />
                              {keyIndex < shortcut.keys.length - 1 && (
                                <span className="text-xs text-muted-foreground">+</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

