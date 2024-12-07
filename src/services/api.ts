import { Project, Document, ChatMessage, ReviewParameter, ReviewConfig, ReviewResult } from '../types/project';

// Use environment variable for API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create a reusable fetch function with authentication
const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Don't include Content-Type for FormData (file uploads)
  const headers = options.body instanceof FormData
    ? { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    : defaultHeaders;

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `API error: ${response.statusText}`);
    }

    // Check if the response is empty
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return null;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export const api = {
  // Projects
  getProjects: async (): Promise<Project[]> => {
    return await authenticatedFetch('/api/projects');
  },

  createProject: async (name: string): Promise<Project> => {
    return await authenticatedFetch('/api/projects', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  },

  getProject: async (id: string): Promise<Project> => {
    return await authenticatedFetch(`/api/projects/${id}`);
  },

  deleteProject: async (projectId: string): Promise<void> => {
    await authenticatedFetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
    });
  },

  // Documents
  uploadDocument: async (projectId: string, file: File, type: Document['type']): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return await authenticatedFetch(`/api/projects/${projectId}/documents`, {
      method: 'POST',
      body: formData,
    });
  },

  getDocuments: async (projectId: string): Promise<Document[]> => {
    return await authenticatedFetch(`/api/projects/${projectId}/documents`);
  },

  removeDocument: async (projectId: string, documentId: string): Promise<void> => {
    await authenticatedFetch(`/api/projects/${projectId}/documents/${documentId}`, {
      method: 'DELETE',
    });
  },

  // Chat
  getChatHistory: async (projectId: string): Promise<ChatMessage[]> => {
    return await authenticatedFetch(`/api/projects/${projectId}/chat`);
  },

  sendChatMessage: async (projectId: string, content: string): Promise<ChatMessage> => {
    return await authenticatedFetch(`/api/projects/${projectId}/chat`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  // Review
  getReviewParameters: async (): Promise<ReviewParameter[]> => {
    return await authenticatedFetch('/api/review/parameters');
  },

  startReview: async (projectId: string, config: ReviewConfig): Promise<void> => {
    await authenticatedFetch(`/api/projects/${projectId}/review`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  },

  getReviewResults: async (projectId: string): Promise<ReviewResult> => {
    return await authenticatedFetch(`/api/projects/${projectId}/review/results`);
  },
}; 