import { supabase } from './supabase';
import { Conversation, Message } from '@/types/chat';
import { Project } from '@/contexts/ChatContext';

// Database types (matching Supabase schema)
interface ConversationRow {
  id: string;
  user_id: string;
  title: string;
  model?: string;
  created_at: string;
  updated_at: string;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp: string;
  attachments?: string; // JSON string
  created_at: string;
}

interface ProjectRow {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface ProjectConversationRow {
  id: string;
  project_id: string;
  conversation_id: string;
  created_at: string;
}

/**
 * Load all conversations for the current user from Supabase
 */
export async function loadConversationsFromSupabase(userId: string): Promise<Conversation[]> {
  try {
    // Load conversations
    const { data: conversationsData, error: conversationsError } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (conversationsError) {
      console.error('Error loading conversations:', conversationsError);
      return [];
    }

    if (!conversationsData || conversationsData.length === 0) {
      return [];
    }

    // Load messages for all conversations
    const conversationIds = conversationsData.map(c => c.id);
    const { data: messagesData, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .in('conversation_id', conversationIds)
      .order('timestamp', { ascending: true });

    if (messagesError) {
      console.error('Error loading messages:', messagesError);
      // Return conversations without messages if messages fail to load
      return conversationsData.map(conv => ({
        id: conv.id,
        title: conv.title,
        messages: [],
        createdAt: new Date(conv.created_at),
        updatedAt: new Date(conv.updated_at),
        model: conv.model || undefined,
      }));
    }

    // Group messages by conversation_id
    const messagesByConversation = new Map<string, MessageRow[]>();
    if (messagesData) {
      messagesData.forEach(msg => {
        const existing = messagesByConversation.get(msg.conversation_id) || [];
        existing.push(msg);
        messagesByConversation.set(msg.conversation_id, existing);
      });
    }

    // Combine conversations with their messages
    const conversations: Conversation[] = conversationsData.map(conv => {
      const messages = (messagesByConversation.get(conv.id) || []).map(msg => {
        const message: Message = {
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          model: msg.model || undefined,
        };

        // Parse attachments if they exist
        if (msg.attachments) {
          try {
            message.attachments = JSON.parse(msg.attachments);
          } catch (e) {
            console.error('Error parsing attachments:', e);
          }
        }

        return message;
      });

      return {
        id: conv.id,
        title: conv.title,
        messages,
        createdAt: new Date(conv.created_at),
        updatedAt: new Date(conv.updated_at),
        model: conv.model || undefined,
      };
    });

    return conversations;
  } catch (error) {
    console.error('Error loading conversations from Supabase:', error);
    return [];
  }
}

/**
 * Save a conversation to Supabase (upsert)
 */
export async function saveConversationToSupabase(userId: string, conversation: Conversation): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('conversations')
      .upsert({
        id: conversation.id,
        user_id: userId,
        title: conversation.title,
        model: conversation.model || null,
        created_at: conversation.createdAt.toISOString(),
        updated_at: conversation.updatedAt.toISOString(),
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('Error saving conversation:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving conversation to Supabase:', error);
    return false;
  }
}

/**
 * Save all messages for a conversation to Supabase
 */
export async function saveMessagesToSupabase(conversationId: string, messages: Message[]): Promise<boolean> {
  try {
    if (messages.length === 0) {
      return true;
    }

    // Prepare messages for insertion
    const messagesToInsert = messages.map(msg => ({
      id: msg.id,
      conversation_id: conversationId,
      role: msg.role,
      content: msg.content,
      model: msg.model || null,
      timestamp: msg.timestamp.toISOString(),
      attachments: msg.attachments ? JSON.stringify(msg.attachments) : null,
      created_at: msg.timestamp.toISOString(),
    }));

    // Use upsert to handle duplicates gracefully
    // This will insert new messages or update existing ones based on the id
    const { error: upsertError } = await supabase
      .from('messages')
      .upsert(messagesToInsert, {
        onConflict: 'id'
      });

    if (upsertError) {
      console.error('Error saving messages:', upsertError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving messages to Supabase:', error);
    return false;
  }
}

/**
 * Save a single message to Supabase
 */
export async function saveMessageToSupabase(conversationId: string, message: Message): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('messages')
      .upsert({
        id: message.id,
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
        model: message.model || null,
        timestamp: message.timestamp.toISOString(),
        attachments: message.attachments ? JSON.stringify(message.attachments) : null,
        created_at: message.timestamp.toISOString(),
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('Error saving message:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error saving message to Supabase:', error);
    return false;
  }
}

/**
 * Delete a conversation and all its messages from Supabase
 */
export async function deleteConversationFromSupabase(conversationId: string): Promise<boolean> {
  try {
    // Delete messages first (due to foreign key constraint)
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    if (messagesError) {
      console.error('Error deleting messages:', messagesError);
      return false;
    }

    // Delete conversation
    const { error: conversationError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

    if (conversationError) {
      console.error('Error deleting conversation:', conversationError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting conversation from Supabase:', error);
    return false;
  }
}

/**
 * Delete all conversations and messages for a user from Supabase
 */
export async function clearAllConversationsFromSupabase(userId: string): Promise<boolean> {
  try {
    // Get all conversation IDs for this user
    const { data: conversations, error: conversationsError } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId);

    if (conversationsError) {
      console.error('Error fetching conversations:', conversationsError);
      return false;
    }

    if (conversations && conversations.length > 0) {
      const conversationIds = conversations.map(c => c.id);

      // Delete all messages
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .in('conversation_id', conversationIds);

      if (messagesError) {
        console.error('Error deleting messages:', messagesError);
        return false;
      }
    }

    // Delete all conversations
    const { error: conversationsDeleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('user_id', userId);

    if (conversationsDeleteError) {
      console.error('Error deleting conversations:', conversationsDeleteError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error clearing conversations from Supabase:', error);
    return false;
  }
}

/**
 * Load all projects for the current user from Supabase
 */
export async function loadProjectsFromSupabase(userId: string): Promise<Project[]> {
  try {
    // Load projects
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (projectsError) {
      console.error('Error loading projects:', projectsError);
      return [];
    }

    if (!projectsData || projectsData.length === 0) {
      return [];
    }

    // Load project_conversations for all projects
    const projectIds = projectsData.map(p => p.id);
    const { data: projectConversationsData, error: projectConversationsError } = await supabase
      .from('project_conversations')
      .select('*')
      .in('project_id', projectIds);

    if (projectConversationsError) {
      console.error('Error loading project_conversations:', projectConversationsError);
      // Return projects without conversations if project_conversations fail to load
      return projectsData.map(project => ({
        id: project.id,
        name: project.name,
        conversationIds: [],
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at),
      }));
    }

    // Group conversation IDs by project_id
    const conversationsByProject = new Map<string, string[]>();
    if (projectConversationsData) {
      projectConversationsData.forEach(pc => {
        const existing = conversationsByProject.get(pc.project_id) || [];
        existing.push(pc.conversation_id);
        conversationsByProject.set(pc.project_id, existing);
      });
    }

    // Combine projects with their conversation IDs
    const projects: Project[] = projectsData.map(project => ({
      id: project.id,
      name: project.name,
      conversationIds: conversationsByProject.get(project.id) || [],
      createdAt: new Date(project.created_at),
      updatedAt: new Date(project.updated_at),
    }));

    return projects;
  } catch (error) {
    console.error('Error loading projects from Supabase:', error);
    return [];
  }
}

/**
 * Save a project to Supabase (upsert)
 */
export async function saveProjectToSupabase(userId: string, project: Project): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('projects')
      .upsert({
        id: project.id,
        user_id: userId,
        name: project.name,
        created_at: project.createdAt.toISOString(),
        updated_at: project.updatedAt.toISOString(),
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('Error saving project:', error);
      return false;
    }

    // Update project_conversations junction table
    // First, delete all existing relationships for this project
    const { error: deleteError } = await supabase
      .from('project_conversations')
      .delete()
      .eq('project_id', project.id);

    if (deleteError) {
      console.error('Error deleting old project_conversations:', deleteError);
      // Continue anyway
    }

    // Then, insert new relationships
    if (project.conversationIds.length > 0) {
      const projectConversationsToInsert = project.conversationIds.map(conversationId => ({
        project_id: project.id,
        conversation_id: conversationId,
      }));

      const { error: insertError } = await supabase
        .from('project_conversations')
        .insert(projectConversationsToInsert);

      if (insertError) {
        console.error('Error saving project_conversations:', insertError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error saving project to Supabase:', error);
    return false;
  }
}

/**
 * Delete a project and all its project_conversations from Supabase
 */
export async function deleteProjectFromSupabase(projectId: string): Promise<boolean> {
  try {
    // Delete project_conversations first (due to foreign key constraint)
    const { error: projectConversationsError } = await supabase
      .from('project_conversations')
      .delete()
      .eq('project_id', projectId);

    if (projectConversationsError) {
      console.error('Error deleting project_conversations:', projectConversationsError);
      return false;
    }

    // Delete project
    const { error: projectError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (projectError) {
      console.error('Error deleting project:', projectError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting project from Supabase:', error);
    return false;
  }
}

/**
 * Add a conversation to a project in Supabase
 */
export async function addConversationToProjectInSupabase(projectId: string, conversationId: string): Promise<boolean> {
  try {
    // Check if the relationship already exists
    const { data: existing, error: checkError } = await supabase
      .from('project_conversations')
      .select('id')
      .eq('project_id', projectId)
      .eq('conversation_id', conversationId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing project_conversation:', checkError);
      return false;
    }

    // If it already exists, return true
    if (existing) {
      return true;
    }

    // Insert new relationship
    const { error } = await supabase
      .from('project_conversations')
      .insert({
        project_id: projectId,
        conversation_id: conversationId,
      });

    if (error) {
      console.error('Error adding conversation to project:', error);
      return false;
    }

    // Update project's updated_at timestamp
    const { error: updateError } = await supabase
      .from('projects')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', projectId);

    if (updateError) {
      console.error('Error updating project timestamp:', updateError);
      // Don't fail the whole operation if timestamp update fails
    }

    return true;
  } catch (error) {
    console.error('Error adding conversation to project in Supabase:', error);
    return false;
  }
}

/**
 * Remove a conversation from a project in Supabase
 */
export async function removeConversationFromProjectInSupabase(projectId: string, conversationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('project_conversations')
      .delete()
      .eq('project_id', projectId)
      .eq('conversation_id', conversationId);

    if (error) {
      console.error('Error removing conversation from project:', error);
      return false;
    }

    // Update project's updated_at timestamp
    const { error: updateError } = await supabase
      .from('projects')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', projectId);

    if (updateError) {
      console.error('Error updating project timestamp:', updateError);
      // Don't fail the whole operation if timestamp update fails
    }

    return true;
  } catch (error) {
    console.error('Error removing conversation from project in Supabase:', error);
    return false;
  }
}

