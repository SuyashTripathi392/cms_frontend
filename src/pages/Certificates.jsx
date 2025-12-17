import { useState, useEffect } from 'react';
import api from '../api/axios';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: '',
    image: null,
    skills: '', // Comma separated
  });
  
  const [editingId, setEditingId] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);

  // 🟢 Fetch all certificates
  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      console.log('🟢 Fetching certificates...');
      const response = await api.get('/certificates');
      console.log('🟢 Certificates response:', response.data);
      
      if (response.data?.certificates) {
        // Transform data to match frontend expectations
        const transformedCerts = response.data.certificates.map(cert => ({
          _id: cert.id,
          title: cert.title,
          issuer: cert.issuer,
          issueDate: cert.issue_date,
          expiryDate: cert.expiry_date,
          credentialId: cert.credential_id,
          credentialUrl: cert.credential_url,
          image: cert.image_url,
          skills: cert.skills || [],
          createdAt: cert.created_at,
          updatedAt: cert.updated_at
        }));
        
        console.log('🟢 Transformed certificates:', transformedCerts);
        setCertificates(transformedCerts);
      }
    } catch (error) {
      console.error('🔴 Error fetching certificates:', error);
      setMessage({ type: 'error', text: 'Failed to load certificates' });
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 🟢 Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('📁 Image selected:', file.name, file.type);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  // 🟢 Reset form
  const resetForm = () => {
    console.log('🔄 Resetting form');
    setFormData({
      title: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: '',
      image: null,
      skills: '',
    });
    setEditingId(null);
    setImagePreview('');
    setImageFile(null);
  };

  // 🟢 Handle edit
  const handleEdit = (certificate) => {
    console.log('✏️ Editing certificate:', certificate);
    setFormData({
      title: certificate.title,
      issuer: certificate.issuer,
      issueDate: certificate.issueDate?.split('T')[0] || '',
      expiryDate: certificate.expiryDate?.split('T')[0] || '',
      credentialId: certificate.credentialId || '',
      credentialUrl: certificate.credentialUrl || '',
      image: null,
      skills: certificate.skills?.join(', ') || '',
    });
    
    if (certificate.image) {
      console.log('🖼️ Setting image preview:', certificate.image);
      // Remove any base URL prefix if present
      const imageUrl = certificate.image.startsWith('http') 
        ? certificate.image 
        : `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${certificate.image}`;
      setImagePreview(imageUrl);
    }
    
    setEditingId(certificate._id);
  };

  // 🟢 Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this certificate?')) {
      return;
    }

    console.log('🗑️ Deleting certificate:', id);

    try {
      const response = await api.delete(`/certificates/${id}`);
      
      if (response.data.success) {
        console.log('✅ Certificate deleted successfully');
        setCertificates(prev => prev.filter(cert => cert._id !== id));
        setMessage({ type: 'success', text: 'Certificate deleted successfully!' });
      }
    } catch (error) {
      console.error('🔴 Error deleting certificate:', error);
      setMessage({ type: 'error', text: 'Failed to delete certificate' });
    }
  };

  // 🟢 Check if certificate is expired
  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  // 🟢 Handle form submit (Create or Update) - FIXED VERSION
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    console.log('📤 Submitting form data:', formData);
    console.log('✏️ Editing ID:', editingId);

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key !== 'image' && formData[key] !== null && formData[key] !== '') {
          console.log(`📝 Adding field ${key}:`, formData[key]);
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add image file if exists
      if (formData.image && formData.image instanceof File) {
        console.log('📁 Adding image file:', formData.image.name);
        formDataToSend.append('image', formData.image);
      }

      // ✅ FIXED: Convert skills string to array
      let skillsArray = [];
      if (formData.skills && formData.skills.trim() !== '') {
        skillsArray = formData.skills
          .split(',')
          .map(skill => skill.trim())
          .filter(skill => skill.length > 0);
      }
      
      console.log('🎯 Skills array:', skillsArray);
      
      // Send as proper JSON string
      formDataToSend.set('skills', JSON.stringify(skillsArray));
      console.log('🎯 Skills JSON:', JSON.stringify(skillsArray));

      // Debug: Check FormData content
      console.log('📦 FormData content:');
      for (let pair of formDataToSend.entries()) {
        console.log(`  ${pair[0]}: ${pair[1]}`);
      }

      if (editingId) {
        // Update existing certificate
        console.log('🔄 Updating certificate with ID:', editingId);
        const response = await api.put(`/certificates/${editingId}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log('✅ Update response:', response.data);
        
        if (response.data.success) {
          // Update the certificate in state
          const updatedCert = {
            _id: response.data.certificate.id,
            title: response.data.certificate.title,
            issuer: response.data.certificate.issuer,
            issueDate: response.data.certificate.issue_date,
            expiryDate: response.data.certificate.expiry_date,
            credentialId: response.data.certificate.credential_id,
            credentialUrl: response.data.certificate.credential_url,
            image: response.data.certificate.image_url,
            skills: response.data.certificate.skills || [],
            createdAt: response.data.certificate.created_at,
            updatedAt: response.data.certificate.updated_at
          };
          
          console.log('✅ Updated certificate object:', updatedCert);
          
          setCertificates(prev => 
            prev.map(cert => 
              cert._id === editingId ? updatedCert : cert
            )
          );
          setMessage({ type: 'success', text: 'Certificate updated successfully!' });
          resetForm();
        }
      } else {
        // Create new certificate
        console.log('🆕 Creating new certificate');
        const response = await api.post('/certificates', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log('✅ Create response:', response.data);
        
        if (response.data.success) {
          // Add new certificate to state
          const newCert = {
            _id: response.data.certificate.id,
            title: response.data.certificate.title,
            issuer: response.data.certificate.issuer,
            issueDate: response.data.certificate.issue_date,
            expiryDate: response.data.certificate.expiry_date,
            credentialId: response.data.certificate.credential_id,
            credentialUrl: response.data.certificate.credential_url,
            image: response.data.certificate.image_url,
            skills: response.data.certificate.skills || [],
            createdAt: response.data.certificate.created_at,
            updatedAt: response.data.certificate.updated_at
          };
          
          console.log('✅ New certificate object:', newCert);
          
          setCertificates(prev => [...prev, newCert]);
          setMessage({ type: 'success', text: 'Certificate added successfully!' });
          resetForm();
        }
      }
    } catch (error) {
      console.error('🔴 Error saving certificate:', error);
      console.error('🔴 Error response:', error.response?.data);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to save certificate. Check console for details.' 
      });
    } finally {
      setSaving(false);
    }
  };

  // 🟢 Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // 🟢 Get status badge
  const getStatusBadge = (expiryDate) => {
    if (!expiryDate) {
      return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">No Expiry</span>;
    }
    
    if (isExpired(expiryDate)) {
      return <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">Expired</span>;
    } else {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Active</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading certificates...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Certificates Management</h1>

      {/* Success/Error Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Form */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-6">
            {editingId ? 'Edit Certificate' : 'Add New Certificate'}
          </h2>

          <form onSubmit={handleSubmit}>
            {/* Certificate Title */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-medium">Certificate Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., AWS Certified Solutions Architect"
                required
              />
            </div>

            {/* Issuer */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-medium">Issuing Organization *</label>
              <input
                type="text"
                name="issuer"
                value={formData.issuer}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Amazon Web Services"
                required
              />
            </div>

            {/* Issue and Expiry Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Issue Date *</label>
                <input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Expiry Date (Optional)</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Credential Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Credential ID</label>
                <input
                  type="text"
                  name="credentialId"
                  value={formData.credentialId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., AWS-12345-ABCD"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Credential URL</label>
                <input
                  type="url"
                  name="credentialUrl"
                  value={formData.credentialUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.credential.net/..."
                />
              </div>
            </div>

            {/* Skills */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2 font-medium">Related Skills</label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., AWS, Cloud Computing, DevOps (comma separated)"
              />
              <p className="text-sm text-gray-500 mt-1">
                Skills will be sent as: {formData.skills ? JSON.stringify(formData.skills.split(',').map(s => s.trim()).filter(s => s)) : '[]'}
              </p>
            </div>

            {/* Image Upload */}
            <div className="mb-8">
              <label className="block text-gray-700 mb-2 font-medium">Certificate Image</label>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="mb-4">
                  <img 
                    src={imagePreview} 
                    alt="Certificate Preview" 
                    className="w-48 h-36 object-contain rounded-lg border border-gray-300 bg-gray-50 p-2"
                  />
                </div>
              )}

              <div className="flex items-center gap-4">
                <label className="cursor-pointer">
                  <div className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 transition">
                    {imageFile ? 'Change Image' : 'Upload Image'}
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                
                {imageFile && (
                  <span className="text-sm text-gray-600">
                    Selected: {imageFile.name}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-500 mt-2">
                Upload certificate image or PDF (recommended: 800x600px or PDF)
                {editingId && <span className="text-blue-600"> - Optional for update</span>}
              </p>
            </div>

            {/* Preview Status */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Preview Status</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Issued:</span>
                  <span className="ml-2 font-medium">
                    {formData.issueDate ? formatDate(formData.issueDate) : 'Not set'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Expires:</span>
                  <span className="ml-2 font-medium">
                    {formData.expiryDate ? formatDate(formData.expiryDate) : 'Never'}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Status:</span>
                  <span className="ml-2">
                    {getStatusBadge(formData.expiryDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between">
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel Edit
                </button>
              )}
              
              <button
                type="submit"
                disabled={saving}
                className={`px-6 py-3 rounded-lg font-medium ${
                  saving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white transition ml-auto`}
              >
                {saving ? 'Saving...' : editingId ? 'Update Certificate' : 'Add Certificate'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Certificates List */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              All Certificates ({certificates.length})
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({certificates.filter(c => !isExpired(c.expiryDate)).length} active)
              </span>
            </h2>
            <button
              onClick={fetchCertificates}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
            >
              Refresh
            </button>
          </div>

          {certificates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No certificates added yet. Add your first certificate!
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {certificates.map(certificate => (
                <div 
                  key={certificate._id} 
                  className={`p-4 border rounded-lg transition ${
                    isExpired(certificate.expiryDate)
                      ? 'border-red-200 bg-red-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Certificate Image */}
                    {certificate.image && (
                      <div className="flex-shrink-0">
                        <img 
                          src={certificate.image}
                          alt={certificate.title}
                          className="w-20 h-20 object-contain rounded-lg border border-gray-300 bg-white p-1"
                          onError={(e) => {
                            console.error('Image load error:', certificate.image);
                            e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                          }}
                        />
                      </div>
                    )}
                    
                    {/* Certificate Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {certificate.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Issued by: {certificate.issuer}
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(certificate.expiryDate)}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(certificate)}
                              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(certificate._id)}
                              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Dates and ID */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2 text-sm">
                        <div>
                          <span className="text-gray-600">Issued: </span>
                          <span className="font-medium">
                            {formatDate(certificate.issueDate)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Expires: </span>
                          <span className="font-medium">
                            {certificate.expiryDate ? formatDate(certificate.expiryDate) : 'Never'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">ID: </span>
                          <span className="font-medium">
                            {certificate.credentialId || 'N/A'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Skills */}
                      {certificate.skills && certificate.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {certificate.skills.slice(0, 3).map((skill, index) => (
                            <span 
                              key={index} 
                              className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {certificate.skills.length > 3 && (
                            <span className="px-2 py-1 text-xs text-gray-500">
                              +{certificate.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Links */}
                      <div className="flex justify-between items-center text-sm">
                        {certificate.credentialUrl ? (
                          <a 
                            href={certificate.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            Verify Certificate
                          </a>
                        ) : (
                          <span className="text-gray-500">No verification link</span>
                        )}
                        
                        {certificate.image && (
                          <a 
                            href={certificate.image}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-800"
                          >
                            View Full Image
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Certificates;