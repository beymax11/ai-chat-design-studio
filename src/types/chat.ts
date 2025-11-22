export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64 encoded data
  url?: string; // optional URL for display
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isEditing?: boolean;
  model?: string;
  attachments?: FileAttachment[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  model?: string;
}
