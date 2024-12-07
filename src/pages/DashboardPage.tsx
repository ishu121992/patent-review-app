import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../types/project';
import { api } from '../services/api';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const projectsData = await api.getProjects();
      setProjects(projectsData);
      setError(null);
    } catch (error) {
      console.error('Error loading projects:', error);
      setError('Failed to connect to server. Please make sure the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteProject(projectId);
      setProjects(projects.filter(project => project.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  if (error) {
    return (
      <div className="text-center p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => loadProjects()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <div>Loading projects...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Projects</h1>
        <Link
          to="/projects/new"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          New Project
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">{project.name}</h2>
              <button
                onClick={() => handleDeleteProject(project.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Last updated: {new Date(project.lastUpdated).toLocaleDateString()}
            </p>
            <Link
              to={`/projects/${project.id}`}
              className="text-blue-600 hover:text-blue-800"
            >
              View Details →
            </Link>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No projects found. Create a new project to get started.
        </div>
      )}
    </div>
  );
}