import { useState, useEffect } from 'react';
import api from '../api/axios';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tech_stack: '', // comma separated
    github: '',
    link: '',
    image: null,
    featured: false,
  });

  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);

  // Fetch projects
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get('/projects');
      if (response.data?.success) setProjects(response.data.data || []);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load projects' });
    } finally {
      setLoading(false);
    }
  };

  // Input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      tech_stack: '',
      github: '',
      link: '',
      image: null,
      featured: false,
    });
    setEditingId(null);
    setImagePreview('');
    setImageFile(null);
  };

  // Edit project
  const handleEdit = (project) => {
    setFormData({
      title: project.title,
      description: project.description,
      tech_stack: project.tech_stack?.join(', ') || '',
      github: project.github || '',
      link: project.link || '',
      image: null,
      featured: project.featured || false,
    });
    if (project.image) setImagePreview(project.image);
    setEditingId(project.id);
  };

  // Delete project
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) return;
    try {
      const response = await api.delete(`/projects/${id}`);
      if (response.data.success) {
        setProjects(prev => prev.filter(p => p.id !== id));
        setMessage({ type: 'success', text: 'Project deleted successfully!' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to delete project' });
    }
  };

  // Toggle featured
  const toggleFeatured = async (id, currentStatus) => {
    try {
      const response = await api.put(`/projects/${id}`, { featured: !currentStatus });
      if (response.data.success) {
        setProjects(prev =>
          prev.map(p => p.id === id ? { ...p, featured: !currentStatus } : p)
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const fd = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'image' || (key === 'image' && formData[key])) {
          fd.append(key, formData[key]);
        }
      });

      // Convert tech_stack to array
      if (formData.tech_stack) {
        const techArray = formData.tech_stack.split(',').map(t => t.trim()).filter(t => t);
        fd.set('tech_stack', JSON.stringify(techArray));
      }

      let response;
      if (editingId) {
        response = await api.put(`/projects/${editingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        response = await api.post('/projects/create', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      if (response.data.success) {
        if (editingId) {
          setProjects(prev => prev.map(p => p.id === editingId ? response.data.data : p));
          setMessage({ type: 'success', text: 'Project updated successfully!' });
        } else {
          setProjects(prev => [...prev, response.data.data]);
          setMessage({ type: 'success', text: 'Project added successfully!' });
        }
        resetForm();
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save project' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-xl">Loading projects...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Projects Management</h1>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-6">{editingId ? 'Edit Project' : 'Add New Project'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full border px-3 py-2 rounded" />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Description *</label>
              <textarea name="description" value={formData.description} onChange={handleChange} required className="w-full border px-3 py-2 rounded" rows={4} />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Tech Stack *</label>
              <input type="text" name="tech_stack" value={formData.tech_stack} onChange={handleChange} placeholder="React, Node.js, Supabase" required className="w-full border px-3 py-2 rounded" />
            </div>

            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="url" name="github" value={formData.github} onChange={handleChange} placeholder="GitHub URL" className="w-full border px-3 py-2 rounded" />
              <input type="url" name="link" value={formData.link} onChange={handleChange} placeholder="Live Demo URL" className="w-full border px-3 py-2 rounded" />
            </div>

            <div className="mb-4 flex items-center gap-4">
              <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} />
              <label>Featured Project</label>
            </div>

            <div className="mb-4">
              {imagePreview && <img src={imagePreview} alt="preview" className="w-48 h-32 object-cover mb-2 rounded" />}
              <label className="px-4 py-2 bg-gray-200 rounded cursor-pointer">
                {editingId && !imagePreview ? 'Choose File' : 'Change File'}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">
                {saving ? 'Saving...' : editingId ? 'Update Project' : 'Add Project'}
              </button>
              {editingId && <button type="button" onClick={resetForm} className="px-4 py-2 border rounded">Cancel</button>}
            </div>
          </form>
        </div>

        {/* Projects List */}
        <div className="bg-white p-6 rounded-xl shadow max-h-[600px] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">All Projects ({projects.length})</h2>
          {projects.length === 0 && <div className="text-gray-500">No projects added yet!</div>}
          {projects.map(project => (
            <div key={project.id} className={`p-4 border rounded mb-3 ${project.featured ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}>
              <div className="flex gap-4">
                {project.image && <img src={project.image} alt={project.title} className="w-24 h-20 object-cover rounded" />}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{project.title}</h3>
                      <p className="text-sm text-gray-600">{project.description.substring(0, 80)}...</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.tech_stack?.slice(0, 4).map((tech, i) => (
                          <span key={i} className="px-2 py-1 text-xs bg-gray-100 rounded">{tech}</span>
                        ))}
                        {project.tech_stack?.length > 4 && <span className="px-2 py-1 text-xs text-gray-500">+{project.tech_stack.length - 4} more</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => toggleFeatured(project.id, project.featured)} className={`px-2 py-1 text-xs rounded ${project.featured ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                        {project.featured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button onClick={() => handleEdit(project)} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Edit</button>
                      <button onClick={() => handleDelete(project.id)} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">Delete</button>
                    </div>
                  </div>
                  <div className="mt-1 text-sm flex gap-3">
                    {project.github && <a href={project.github} target="_blank" className="text-blue-600 hover:underline">GitHub</a>}
                    {project.link && <a href={project.link} target="_blank" className="text-green-600 hover:underline">Live</a>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
