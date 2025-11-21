import { useState } from 'react';
import { Folder, Plus, Trash2, MessageSquare, MoreHorizontal, X } from 'lucide-react';
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
      <DialogContent className="sm:max-w-[700px] max-w-[95vw] mx-4 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Projects</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Create New Project */}
          <div className="flex gap-2 flex-col sm:flex-row">
            {isCreating ? (
              <>
                <Input
                  placeholder="Project name..."
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
                />
                <Button onClick={handleCreateProject} size="sm">
                  Create
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false);
                    setNewProjectName('');
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsCreating(true)}
                variant="outline"
                className="w-full justify-start gap-2"
              >
                <Plus className="w-4 h-4" />
                Create New Project
              </Button>
            )}
          </div>

          {/* Projects List */}
          <ScrollArea className="flex-1 min-h-0">
            {projects.length > 0 ? (
              <div className="space-y-3 pr-2">
                {projects.map((project) => {
                  const projectConversations = getProjectConversations(project);
                  return (
                    <div
                      key={project.id}
                      className="border border-border rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                          <Folder className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                          <h3 className="font-semibold text-sm sm:text-base truncate">{project.name}</h3>
                          <span className="text-xs text-muted-foreground shrink-0">
                            ({projectConversations.length} conversation{projectConversations.length !== 1 ? 's' : ''})
                          </span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => deleteProject(project.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* Conversations in Project */}
                      <div className="space-y-1 pl-7">
                        {projectConversations.length > 0 ? (
                          projectConversations.map((conversation) => (
                            <div
                              key={conversation.id}
                              className="flex items-center justify-between group"
                            >
                              <button
                                onClick={() => {
                                  switchConversation(conversation.id);
                                  onOpenChange(false);
                                }}
                                className="flex items-center gap-2 flex-1 text-left p-2 rounded hover:bg-accent hover:text-accent-foreground transition-colors"
                              >
                                <MessageSquare className="w-3 h-3 text-muted-foreground" />
                                <span className="text-sm truncate">{conversation.title}</span>
                              </button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                onClick={() => removeConversationFromProject(project.id, conversation.id)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground italic">
                            No conversations in this project
                          </p>
                        )}
                      </div>

                      {/* Add Conversation to Project */}
                      {conversations.length > 0 && (
                        <div className="pl-7">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start gap-2 text-xs"
                              >
                                <Plus className="w-3 h-3" />
                                Add Conversation
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                              {conversations
                                .filter(conv => !project.conversationIds.includes(conv.id))
                                .map((conversation) => (
                                  <DropdownMenuItem
                                    key={conversation.id}
                                    onClick={() => handleAddToProject(project.id, conversation.id)}
                                  >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    {conversation.title}
                                  </DropdownMenuItem>
                                ))}
                              {conversations.filter(conv => !project.conversationIds.includes(conv.id)).length === 0 && (
                                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                                  All conversations are in this project
                                </div>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No projects yet. Create one to organize your conversations!</p>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

