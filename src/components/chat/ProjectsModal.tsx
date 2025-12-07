import { useState } from 'react';
import { Folder, Plus, Trash2, MessageSquare, MoreHorizontal, X, FolderOpen, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat, Project } from '@/contexts/ChatContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ProjectsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProjectsModal = ({ open, onOpenChange }: ProjectsModalProps) => {
  const { projects, createProject, deleteProject, addConversationToProject, removeConversationFromProject, conversations, switchConversation } = useChat();
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName.trim());
      setNewProjectName('');
      setIsCreating(false);
    }
  };

  const handleAddToProject = (projectId: string, conversationId: string) => {
    addConversationToProject(projectId, conversationId);
  };

  const getProjectConversations = (project: Project) => {
    return conversations.filter(conv => project.conversationIds.includes(conv.id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] max-w-[95vw] mx-4 max-h-[90vh] flex flex-col p-0 border-0 shadow-2xl overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-background to-primary/5" />
        
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </div>

        <div className="relative bg-background/80 backdrop-blur-xl flex flex-col h-full">
          {/* Header with Icon */}
          <div className="p-6 sm:p-8 pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="flex justify-center mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-primary/20 rounded-full blur-xl" />
                
              </div>
            </motion.div>

            <DialogHeader className="space-y-2 mb-0">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <DialogTitle className="text-3xl font-bold text-center bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Projects
                </DialogTitle>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="text-center text-sm text-muted-foreground"
              >
                Organize your conversations into projects
              </motion.p>
            </DialogHeader>
          </div>

          <div className="space-y-4 flex-1 overflow-hidden flex flex-col px-6 sm:px-8 pb-6 sm:pb-8">
          {/* Create New Project */}
          <AnimatePresence mode="wait">
            {isCreating ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-2 flex-col sm:flex-row overflow-hidden"
              >
                <div className="relative flex-1">
                  <Folder className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter project name..."
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCreateProject();
                      } else if (e.key === 'Escape') {
                        setIsCreating(false);
                        setNewProjectName('');
                      }
                    }}
                    autoFocus
                    className={cn(
                      "h-11 pl-10 rounded-xl border-2",
                      "focus:border-primary focus:ring-4 focus:ring-primary/10",
                      "transition-all duration-300"
                    )}
                  />
                </div>
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="flex gap-2"
                >
                  <Button 
                    onClick={handleCreateProject} 
                    size="sm"
                    className={cn(
                      "h-11 px-6 rounded-xl",
                      "bg-gradient-to-r from-primary to-blue-600",
                      "hover:shadow-lg hover:shadow-primary/25",
                      "font-semibold transition-all duration-300"
                    )}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsCreating(false);
                      setNewProjectName('');
                    }}
                    className="h-11 rounded-xl hover:bg-accent/50"
                  >
                    Cancel
                  </Button>
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => setIsCreating(true)}
                  variant="outline"
                  className={cn(
                    "w-full justify-start gap-3 h-12 rounded-xl",
                    "border-2 border-dashed hover:border-primary/50",
                    "hover:bg-accent/50 transition-all duration-300",
                    "text-base font-medium group relative overflow-hidden"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <Plus className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">Create New Project</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Projects List */}
          <ScrollArea className="flex-1 min-h-0">
            {projects.length > 0 ? (
              <div className="space-y-4 pr-2">
                {projects.map((project, index) => {
                  const projectConversations = getProjectConversations(project);
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div
                        className={cn(
                          "relative border-2 border-border rounded-2xl p-4 sm:p-5 space-y-3 sm:space-y-4",
                          "bg-background/50 backdrop-blur-sm",
                          "transition-all duration-300",
                          "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="relative">
                              <div className="absolute inset-0 bg-primary/20 rounded-lg blur-md" />
                              <div className="relative bg-gradient-to-br from-primary/10 to-blue-500/10 p-2 rounded-lg">
                                <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-bold text-base sm:text-lg truncate">{project.name}</h3>
                              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <MessageSquare className="w-3 h-3" />
                                {projectConversations.length} conversation{projectConversations.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className={cn(
                                  "h-9 w-9 rounded-xl",
                                  "hover:bg-accent/50 transition-colors"
                                )}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl">
                              <DropdownMenuItem
                                onClick={() => deleteProject(project.id)}
                                className="text-destructive focus:text-destructive rounded-lg"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Project
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                      {/* Conversations in Project */}
                      <div className="space-y-1.5 pl-2 sm:pl-3">
                        {projectConversations.length > 0 ? (
                          projectConversations.map((conversation, convIndex) => (
                            <motion.div
                              key={conversation.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2, delay: convIndex * 0.05 }}
                              className="flex items-center justify-between group/conv"
                            >
                              <motion.button
                                onClick={() => {
                                  switchConversation(conversation.id);
                                  onOpenChange(false);
                                }}
                                whileHover={{ x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                  "flex items-center gap-2.5 flex-1 text-left p-2.5 rounded-xl",
                                  "hover:bg-accent hover:text-accent-foreground",
                                  "transition-all duration-200",
                                  "border border-transparent hover:border-primary/20"
                                )}
                              >
                                <div className="p-1 rounded-md bg-primary/10">
                                  <MessageSquare className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <span className="text-sm truncate font-medium">{conversation.title}</span>
                              </motion.button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                  "h-7 w-7 rounded-lg opacity-0 group-hover/conv:opacity-100",
                                  "transition-opacity hover:bg-destructive/10 hover:text-destructive"
                                )}
                                onClick={() => removeConversationFromProject(project.id, conversation.id)}
                              >
                                <X className="w-3.5 h-3.5" />
                              </Button>
                            </motion.div>
                          ))
                        ) : (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={cn(
                              "text-center py-6 px-4 rounded-xl",
                              "bg-muted/30 border-2 border-dashed border-muted"
                            )}
                          >
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                            <p className="text-xs text-muted-foreground">
                              No conversations yet
                            </p>
                          </motion.div>
                        )}
                      </div>

                      {/* Add Conversation to Project */}
                      {conversations.length > 0 && (
                        <div className="pl-2 sm:pl-3 pt-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className={cn(
                                    "w-full justify-start gap-2.5 h-10 rounded-xl",
                                    "border-2 border-dashed hover:border-primary/50",
                                    "hover:bg-accent/50 transition-all duration-300",
                                    "text-sm font-medium group/add relative overflow-hidden"
                                  )}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover/add:translate-x-[100%] transition-transform duration-1000" />
                                  <Plus className="w-4 h-4 relative z-10" />
                                  <span className="relative z-10">Add Conversation</span>
                                </Button>
                              </motion.div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-64 rounded-xl">
                              {conversations
                                .filter(conv => !project.conversationIds.includes(conv.id))
                                .map((conversation) => (
                                  <DropdownMenuItem
                                    key={conversation.id}
                                    onClick={() => handleAddToProject(project.id, conversation.id)}
                                    className="rounded-lg cursor-pointer"
                                  >
                                    <div className="p-1 rounded-md bg-primary/10 mr-2">
                                      <MessageSquare className="w-4 h-4 text-primary" />
                                    </div>
                                    <span className="truncate">{conversation.title}</span>
                                  </DropdownMenuItem>
                                ))}
                              {conversations.filter(conv => !project.conversationIds.includes(conv.id)).length === 0 && (
                                <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                                  All conversations are in this project
                                </div>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "text-center py-12 px-4 text-muted-foreground",
                  "rounded-2xl border-2 border-dashed border-muted/50",
                  "bg-muted/10"
                )}
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                    <Folder className="relative w-16 h-16 mx-auto mb-4 text-primary/50" />
                  </div>
                </motion.div>
                <p className="text-base font-medium mb-1">No projects yet</p>
                <p className="text-sm text-muted-foreground/70">
                  Create your first project to organize conversations!
                </p>
              </motion.div>
            )}
          </ScrollArea>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

