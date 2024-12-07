import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Project, ReviewResult } from '../types/project';
import { api } from '../services/api';

export default function ReviewResultsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [results, setResults] = useState<ReviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [projectId]);

  const loadResults = async () => {
    try {
      const [projectData, resultsData] = await Promise.all([
        api.getProject(projectId!),
        api.getReviewResults(projectId!),
      ]);
      setProject(projectData);
      setResults(resultsData);
    } catch (error) {
      console.error('Error loading review results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading review results...</div>;
  }

  if (!project || !results) {
    return <div>Results not found</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Review Results</h1>
          <p className="text-gray-600">Project: {project.name}</p>
        </div>
        <button
          onClick={() => navigate(`/projects/${projectId}`)}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Back to Project
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Review Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600">Total Changes</p>
            <p className="text-2xl font-bold text-blue-700">
              {results.summary.totalChanges}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600">Status</p>
            <p className="text-2xl font-bold text-green-700 capitalize">
              {results.status}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-purple-600">Completed</p>
            <p className="text-2xl font-bold text-purple-700">
              {new Date(results.completedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Changes by Category */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Changes by Category</h2>
        <div className="space-y-4">
          {results.summary.categories.map((category) => (
            <div key={category.name} className="flex items-center">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {category.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {category.changes} changes
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${(category.changes / results.summary.totalChanges) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Download Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Download Files</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href={results.updatedSpecification.url}
            download={results.updatedSpecification.name}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
          >
            <div>
              <p className="font-medium">Updated Specification</p>
              <p className="text-sm text-gray-500">{results.updatedSpecification.name}</p>
            </div>
            <span className="text-blue-600">
              Download →
            </span>
          </a>
          <a
            href={results.changeLog.url}
            download={results.changeLog.name}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
          >
            <div>
              <p className="font-medium">Change Log</p>
              <p className="text-sm text-gray-500">{results.changeLog.name}</p>
            </div>
            <span className="text-blue-600">
              Download →
            </span>
          </a>
        </div>
      </div>
    </div>
  );
} 