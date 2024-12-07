import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Project, Document, ChatMessage } from '../types/project';
import { api } from '../services/api';

export default function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key in Document['type']]?: File }>({});

  const loadProjectData = useCallback(async () => {
    try {
      const [projectData, documentsData, chatData] = await Promise.all([
        api.getProject(projectId!),
        api.getDocuments(projectId!),
        api.getChatHistory(projectId!),
      ]);
      setProject(projectData);
      setDocuments(documentsData);
      setChatMessages(chatData);
    } catch (error) {
      console.error('Error loading project data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId, loadProjectData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleFileUpload = async (file: File, type: Document['type']) => {
    try {
      const newDocument = await api.uploadDocument(projectId!, file, type);
      setDocuments(prev => [...prev, newDocument]);
      setUploadedFiles(prev => ({ ...prev, [type]: undefined }));
      
      const fileInput = document.querySelector(`input[data-type="${type}"]`) as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error('Error uploading document:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const userMessage = await api.sendChatMessage(projectId!, newMessage);
      setChatMessages(prev => [...prev, userMessage]);
      setNewMessage('');
      
      // Simulate assistant response
      const assistantMessage: ChatMessage = {
        id: String(Date.now() + 1),
        content: 'I received your message and am processing it...',
        sender: 'assistant',
        timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteProject(projectId!);
      navigate('/dashboard'); // Redirect to dashboard after deletion
    } catch (error) {
      console.error('Error deleting project:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleRemoveDocument = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to remove this document?')) {
      return;
    }

    try {
      await api.removeDocument(projectId!, documentId);
      setDocuments(documents.filter(doc => doc.id !== documentId));
    } catch (error) {
      console.error('Error removing document:', error);
      // You might want to show an error message to the user here
    }
  };

  if (isLoading) {
    return <div>Loading project details...</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <p className="text-gray-600">Last updated: {new Date(project.lastUpdated).toLocaleDateString()}</p>
        </div>
        <div className="space-x-4">
          <button
            onClick={handleDeleteProject}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Delete Project
          </button>
          <button
            onClick={() => navigate(`/projects/${projectId}/reviewer`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Configure Review
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Document Upload Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Documents</h2>
          
          {/* Upload Buttons */}
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Patent Specification</label>
              <input
                type="file"
                accept=".doc,.docx"
                data-type="specification"
                aria-label="Upload Patent Specification"
                title="Upload Patent Specification"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'specification')}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div>
              <label className="block mb-2">Disclosure Document</label>
              <input
                type="file"
                accept=".doc,.docx,.pdf,.ppt,.pptx"
                data-type="disclosure"
                aria-label="Upload Disclosure Document"
                title="Upload Disclosure Document"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'disclosure')}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div>
              <label className="block mb-2">Drawings</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                data-type="drawing"
                aria-label="Upload Drawings"
                title="Upload Drawings"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'drawing')}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          {/* Document List */}
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
              >
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-gray-500">
                    Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-x-2">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View
                  </a>
                  <button
                    onClick={() => handleRemoveDocument(doc.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Section */}
        <div className="flex flex-col h-[600px] bg-white rounded-lg shadow">
          <div className="flex-1 p-4 overflow-y-auto">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${
                  message.sender === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  className={`inline-block max-w-[80%] p-4 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 