import { useEffect, useState } from "react";
import api from "../api/axios";

const CONTACT_FIELDS = [
  { key: "email", label: "Email Address", type: "email", required: true },
  { key: "phone", label: "Phone Number", type: "tel" },
  { key: "whatsapp", label: "WhatsApp Number", type: "tel" },
  { key: "address", label: "Address", type: "textarea" },
  { key: "location", label: "Location (for map)", type: "text" },
  { key: "github", label: "GitHub", type: "url" },
  { key: "linkedin", label: "LinkedIn", type: "url" },
  { key: "twitter", label: "Twitter", type: "url" },
  { key: "instagram", label: "Instagram", type: "url" },
];

const Contact = () => {
  const [contact, setContact] = useState({
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    location: "",
    github: "",
    linkedin: "",
    twitter: "",
    instagram: "",
  });

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingContact, setLoadingContact] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchContactDetails();
    fetchMessages();
  }, []);

  /* ================= CONTACT DETAILS ================= */

  const fetchContactDetails = async () => {
    try {
      const res = await api.get("/contact-details");
      if (res.data?.contact) {
        const cleanData = {};
        CONTACT_FIELDS.forEach(
          (field) => (cleanData[field.key] = res.data.contact[field.key] || "")
        );
        setContact(cleanData);
      }
    } catch (err) {
      console.error("Contact fetch error", err);
      setMessage({ type: 'error', text: 'Failed to load contact details' });
    } finally {
      setLoadingContact(false);
    }
  };

  const saveContactDetails = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      await api.put("/contact-details", contact);
      setMessage({ type: 'success', text: 'Contact details updated successfully!' });
    } catch (err) {
      console.error("Save contact error", err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to save contact details' 
      });
    } finally {
      setSaving(false);
    }
  };

  /* ================= MESSAGES ================= */

  const fetchMessages = async () => {
    try {
      const res = await api.get("/contact");
      setMessages(res.data?.data || []);
    } catch (err) {
      console.error("Messages fetch error", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/contact/${id}/read`);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, read: true } : m))
      );
    } catch (err) {
      console.error("Mark as read error", err);
    }
  };

  const deleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    
    try {
      await api.delete(`/contact/${id}`);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Delete message error", err);
    }
  };

  // 🟢 Get status badge
  const getStatusBadge = (read) => {
    return read ? (
      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">Read</span>
    ) : (
      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">New</span>
    );
  };

  // 🟢 Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loadingContact && loadingMessages) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Contact Management</h1>

      {/* Success/Error Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Contact Information Form */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold mb-6">Contact Information</h2>

          <form onSubmit={saveContactDetails}>
            {/* Basic Contact Info */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4 text-gray-800">Basic Information</h3>
              
              <div className="space-y-4">
                {CONTACT_FIELDS.slice(0, 5).map((field) => (
                  <div key={field.key}>
                    <label className="block text-gray-700 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    
                    {field.type === 'textarea' ? (
                      <textarea
                        value={contact[field.key]}
                        onChange={(e) =>
                          setContact({ ...contact, [field.key]: e.target.value })
                        }
                        rows="2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={field.key}
                        required={field.required}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={contact[field.key]}
                        onChange={(e) =>
                          setContact({ ...contact, [field.key]: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={field.key}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media Links */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4 text-gray-800">Social Media Links</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CONTACT_FIELDS.slice(5).map((field) => (
                  <div key={field.key}>
                    <label className="block text-gray-700 mb-2">{field.label}</label>
                    <input
                      type={field.type}
                      value={contact[field.key]}
                      onChange={(e) =>
                        setContact({ ...contact, [field.key]: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={field.key}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3">Preview</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> {contact.email || 'Not set'}</p>
                <p><strong>Phone:</strong> {contact.phone || 'Not set'}</p>
                <p><strong>WhatsApp:</strong> {contact.whatsapp || 'Not set'}</p>
                <p><strong>Location:</strong> {contact.location || 'Not set'}</p>
                <div className="flex gap-2 mt-2">
                  {contact.github && (
                    <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                      GitHub
                    </span>
                  )}
                  {contact.linkedin && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                      LinkedIn
                    </span>
                  )}
                  {contact.twitter && (
                    <span className="px-2 py-1 bg-sky-100 text-sky-700 rounded text-xs">
                      Twitter
                    </span>
                  )}
                  {contact.instagram && (
                    <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs">
                      Instagram
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className={`px-6 py-3 rounded-lg font-medium ${
                  saving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white transition`}
              >
                {saving ? 'Saving...' : 'Save Contact Information'}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Contact Messages */}
        <div className="bg-white p-6 rounded-xl shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              Messages ({messages.length})
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({messages.filter(m => !m.read).length} new)
              </span>
            </h2>
            <button
              onClick={fetchMessages}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
            >
              Refresh
            </button>
          </div>

          {loadingMessages ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">Loading messages...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No messages yet. All messages from contact form will appear here.
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`p-4 border rounded-lg transition ${
                    msg.read 
                      ? 'border-gray-200 bg-gray-50' 
                      : 'border-blue-300 bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-800">
                          {msg.name}
                        </h4>
                        <span className="text-gray-500">•</span>
                        <a 
                          href={`mailto:${msg.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {msg.email}
                        </a>
                      </div>
                      <p className="text-sm text-gray-600">
                        {msg.subject || 'No subject'}
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        {getStatusBadge(msg.read)}
                        <span className="text-xs text-gray-500">
                          {formatDate(msg.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Message */}
                  <div className="mb-4">
                    <p className="text-gray-700 bg-white p-3 rounded border">
                      {msg.message}
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <a 
                        href={`mailto:${msg.email}?subject=Re: ${msg.subject || 'Your Message'}`}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                      >
                        Reply via Email
                      </a>
                      
                      {!msg.read && (
                        <button
                          onClick={() => markAsRead(msg.id)}
                          className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                    
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Statistics */}
          {messages.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold mb-3">Message Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{messages.length}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center p-3 bg-blue-100 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">
                    {messages.filter(m => !m.read).length}
                  </div>
                  <div className="text-sm text-gray-600">New</div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {messages.filter(m => m.read).length}
                  </div>
                  <div className="text-sm text-gray-600">Read</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {messages.filter(m => m.read).length}
                  </div>
                  <div className="text-sm text-gray-600">Processed</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;