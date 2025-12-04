import { useState } from 'react';
import { ChevronDown, Sparkles, Zap, Brain } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

export interface Model {
  id: string;
  name: string;
  description: string;
  icon?: React.ReactNode;
}

export const availableModels: Model[] = [
  {
    id: 'gpt-fast',
    name: 'Llama 3.1 8B',
    description: 'Fast & lightweight responses',
    icon: <Zap className="w-4 h-4" />,
  },
  {
    id: 'gpt-smart',
    name: 'Llama 3.1 70B',
    description: 'Smart & versatile reasoning',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: 'gpt-ultra',
    name: 'Mixtral 8x7B',
    description: 'Ultra capable, long context',
    icon: <Brain className="w-4 h-4" />,
  },
];

interface ModelSelectorProps {
  selectedModel: string;
  setSelectedModel: (modelId: string) => void;
}

export const ModelSelector = ({ selectedModel, setSelectedModel }: ModelSelectorProps) => {
  const [open, setOpen] = useState(false);
  const selectedModelData = availableModels.find((m) => m.id === selectedModel) || availableModels[1];

  const handleSelect = (modelId: string) => {
    setSelectedModel(modelId);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'group flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full',
            'text-xs sm:text-sm font-medium transition-all duration-200',
            'border border-border bg-background',
            'hover:bg-accent hover:text-accent-foreground',
            'data-[state=open]:bg-accent data-[state=open]:text-white',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'shrink-0'
          )}
        >
          {selectedModelData.icon && (
            <span className="text-muted-foreground group-hover:text-accent-foreground group-data-[state=open]:text-white transition-colors">{selectedModelData.icon}</span>
          )}
          <span className="text-foreground group-hover:text-accent-foreground group-data-[state=open]:text-white transition-colors hidden sm:inline">{selectedModelData.name}</span>
          <span className="text-foreground group-hover:text-accent-foreground group-data-[state=open]:text-white transition-colors sm:hidden">{selectedModelData.name.split(' ')[0]}</span>
          <ChevronDown
            className={cn(
              'w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground group-hover:text-accent-foreground group-data-[state=open]:text-white transition-all duration-200',
              open && 'transform rotate-180'
            )}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-56 sm:w-64 p-1.5"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {availableModels.map((model) => {
          const isSelected = model.id === selectedModel;
          return (
            <DropdownMenuItem
              key={model.id}
              onClick={() => handleSelect(model.id)}
              className={cn(
                'group flex items-start gap-3 px-3 py-2.5 rounded-md cursor-pointer',
                'transition-colors duration-150',
                'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                isSelected && 'bg-accent/10'
              )}
            >
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {model.icon && (
                  <span
                    className={cn(
                      'text-muted-foreground group-hover:text-accent-foreground shrink-0 mt-0.5 transition-colors',
                      isSelected && 'text-primary group-hover:text-accent-foreground'
                    )}
                  >
                    {model.icon}
                  </span>
                )}
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span className="text-sm font-medium text-foreground group-hover:text-accent-foreground transition-colors">
                    {model.name}
                  </span>
                  <span className="text-xs text-muted-foreground group-hover:text-accent-foreground/80 truncate transition-colors">
                    {model.description}
                  </span>
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-1.5 h-1.5 rounded-full bg-primary group-hover:bg-accent-foreground shrink-0 mt-1.5 transition-colors"
                  />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


