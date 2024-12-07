export interface Project {
  id: string;
  name: string;
  lastUpdated: string;
  status: 'pending' | 'in_review' | 'completed';
  description?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'specification' | 'disclosure' | 'drawing';
  uploadedAt: string;
  url: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
}

export interface ReviewParameter {
  id: string;
  name: string;
  description: string;
  defaultPrompt: string;
  isEnabled: boolean;
  customPrompt?: string;
}

export interface ReviewConfig {
  parameters: ReviewParameter[];
  guidelines: string;
}

export interface ReviewResult {
  id: string;
  projectId: string;
  completedAt: string;
  status: 'completed' | 'failed';
  updatedSpecification: {
    url: string;
    name: string;
  };
  changeLog: {
    url: string;
    name: string;
  };
  summary: {
    totalChanges: number;
    categories: {
      name: string;
      changes: number;
    }[];
  };
} 