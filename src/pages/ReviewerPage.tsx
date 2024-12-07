import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Project, ReviewParameter } from '../types/project';
import { api } from '../services/api';

export default function ReviewerPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [parameters, setParameters] = useState<ReviewParameter[]>([]);
  const [guidelines, setGuidelines] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activePrompt, setActivePrompt] = useState<ReviewParameter | null>(null);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);

  useEffect(() => {
    loadReviewData();
  }, [projectId]);

  const loadReviewData = async () => {
    try {
      const [projectData, parametersData] = await Promise.all([
        api.getProject(projectId!),
        api.getReviewParameters(),
      ]);
      setProject(projectData);
      setParameters(parametersData);
    } catch (error) {
      console.error('Error loading review data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleParameterToggle = (id: string) => {
    setParameters(prev =>
      prev.map(param =>
        param.id === id ? { ...param, isEnabled: !param.isEnabled } : param
      )
    );
  };

  const handlePromptEdit = (parameter: ReviewParameter) => {
    setActivePrompt(parameter);
    setIsPromptModalOpen(true);
  };

  const handlePromptSave = (customPrompt: string) => {
    if (!activePrompt) return;
    
    setParameters(prev =>
      prev.map(param =>
        param.id === activePrompt.id ? { ...param, customPrompt } : param
      )
    );
    setIsPromptModalOpen(false);
    setActivePrompt(null);
  };

  const handleStartReview = async () => {
    try {
      const config = {
        parameters: parameters.filter(p => p.isEnabled),
        guidelines,
      };
      await api.startReview(projectId!, config);
      navigate(`/projects/${projectId}/results`);
    } catch (error) {
      console.error('Error starting review:', error);
    }
  };

  if (isLoading) {
    return <div>Loading reviewer configuration...</div>;
  }

  if (!project) {
    return <div>Project not found</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Review Configuration</h1>
          <p className="text-gray-600">Project: {project.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Review Parameters */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold">Review Parameters</h2>
          <div className="space-y-4">
            {parameters.map((param) => (
              <div
                key={param.id}
                className="p-4 bg-white rounded-lg shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={`param-${param.id}`}
                      checked={param.isEnabled}
                      onChange={() => handleParameterToggle(param.id)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label htmlFor={`param-${param.id}`} className="font-medium">
                      {param.name}
                    </label>
                  </div>
                  <button
                    onClick={() => handlePromptEdit(param)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit Prompt
                  </button>
                </div>
                <p className="mt-2 text-sm text-gray-600">{param.description}</p>
                {param.customPrompt && (
                  <div className="mt-2 text-sm text-gray-800 bg-gray-50 p-2 rounded">
                    Custom prompt: {param.customPrompt}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Guidelines */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Review Guidelines</h2>
          <div>
            <label htmlFor="guidelines" className="block text-sm font-medium text-gray-700 mb-2">
              Additional Instructions
            </label>
            <textarea
              id="guidelines"
              value={guidelines}
              onChange={(e) => setGuidelines(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter any specific guidelines for the review..."
            />
          </div>

          <button
            onClick={handleStartReview}
            disabled={!parameters.some(p => p.isEnabled)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Start Review
          </button>
        </div>
      </div>

      {/* Edit Prompt Modal */}
      {isPromptModalOpen && activePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h3 className="text-lg font-bold mb-4">Edit Prompt for {activePrompt.name}</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Prompt
              </label>
              <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                {activePrompt.defaultPrompt}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Prompt
              </label>
              <textarea
                value={activePrompt.customPrompt || ''}
                onChange={(e) => setActivePrompt({
                  ...activePrompt,
                  customPrompt: e.target.value,
                })}
                rows={4}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Enter custom prompt..."
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsPromptModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePromptSave(activePrompt.customPrompt || '')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 