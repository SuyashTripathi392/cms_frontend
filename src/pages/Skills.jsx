import { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  FaReact, FaNodeJs, FaPython, FaJava, FaJs, FaHtml5, 
  FaCss3Alt, FaDatabase, FaGitAlt, FaDocker, FaAws,
  FaLanguage, FaTools, FaCode, FaServer, FaCloud
} from 'react-icons/fa';
import { 
  SiNextdotjs, SiMongodb, SiPostgresql, SiMysql, 
  SiRedis, SiGraphql, SiTypescript, SiTailwindcss,
  SiExpress, SiDjango, SiFlask, SiSpringboot
} from 'react-icons/si';
import { GiProcessor } from 'react-icons/gi';

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Form values
  const [formData, setFormData] = useState({
    name: "",
    icon: "",  // This will store icon library name like "FaReact"
    category: "Technical",
    level: 50,
    display_order: 1
  });

  const [editingId, setEditingId] = useState(null);

  const categories = [
    "Technical",
    "Soft Skills",
    "Languages",
    "Framework",
    "Database",
    "Tools",
    "Cloud"
  ];

  // Icon mapping - matches icon names to actual components
  const iconComponents = {
    // React Icons
    "FaReact": FaReact,
    "FaNodeJs": FaNodeJs,
    "FaPython": FaPython,
    "FaJava": FaJava,
    "FaJs": FaJs,
    "FaHtml5": FaHtml5,
    "FaCss3Alt": FaCss3Alt,
    "FaDatabase": FaDatabase,
    "FaGitAlt": FaGitAlt,
    "FaDocker": FaDocker,
    "FaAws": FaAws,
    "FaLanguage": FaLanguage,
    "FaTools": FaTools,
    "FaCode": FaCode,
    "FaServer": FaServer,
    "FaCloud": FaCloud,
    
    // Simple Icons
    "SiNextdotjs": SiNextdotjs,
    "SiMongodb": SiMongodb,
    "SiPostgresql": SiPostgresql,
    "SiMysql": SiMysql,
    "SiRedis": SiRedis,
    "SiGraphql": SiGraphql,
    "SiTypescript": SiTypescript,
    "SiTailwindcss": SiTailwindcss,
    "SiExpress": SiExpress,
    "SiDjango": SiDjango,
    "SiFlask": SiFlask,
    "SiSpringboot": SiSpringboot,
    
    // Game Icons
    "GiProcessor": GiProcessor,
    
    // Default fallback
    "default": FaCode
  };

  // Popular icons for dropdown
  const popularIcons = [
    { name: "React", value: "FaReact", color: "text-blue-500" },
    { name: "JavaScript", value: "FaJs", color: "text-yellow-500" },
    { name: "Node.js", value: "FaNodeJs", color: "text-green-500" },
    { name: "Python", value: "FaPython", color: "text-blue-400" },
    { name: "Java", value: "FaJava", color: "text-red-500" },
    { name: "HTML5", value: "FaHtml5", color: "text-orange-500" },
    { name: "CSS3", value: "FaCss3Alt", color: "text-blue-300" },
    { name: "TypeScript", value: "SiTypescript", color: "text-blue-600" },
    { name: "MongoDB", value: "SiMongodb", color: "text-green-600" },
    { name: "PostgreSQL", value: "SiPostgresql", color: "text-blue-700" },
    { name: "MySQL", value: "SiMysql", color: "text-blue-800" },
    { name: "Git", value: "FaGitAlt", color: "text-orange-600" },
    { name: "Docker", value: "FaDocker", color: "text-blue-400" },
    { name: "AWS", value: "FaAws", color: "text-orange-400" },
    { name: "Next.js", value: "SiNextdotjs", color: "text-black" },
    { name: "Tailwind", value: "SiTailwindcss", color: "text-teal-500" },
    { name: "Express", value: "SiExpress", color: "text-gray-600" },
    { name: "Database", value: "FaDatabase", color: "text-purple-500" },
    { name: "Cloud", value: "FaCloud", color: "text-blue-300" },
    { name: "Server", value: "FaServer", color: "text-gray-500" }
  ];

  // Fetch Skills
  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await api.get("/skills");
      if (res.data?.data) {
        setSkills(res.data.data);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load skills" });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: 
        e.target.name === "level" || e.target.name === "display_order"
          ? Number(e.target.value)
          : e.target.value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      icon: "",
      category: "Technical",
      level: 50,
      display_order: 1
    });
    setEditingId(null);
  };

  const handleEdit = (skill) => {
    setEditingId(skill.id);
    setFormData({
      name: skill.name,
      icon: skill.icon || "",
      category: skill.category,
      level: skill.level,
      display_order: skill.display_order
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete skill?")) return;

    try {
      const res = await api.delete(`/skills/${id}`);
      if (res.data.success) {
        setSkills(prev => prev.filter(s => s.id !== id));
        setMessage({ type: "success", text: "Skill deleted!" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to delete" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        // Update
        const res = await api.put(`/skills/${editingId}`, formData);
        if (res.data.success) {
          setSkills(prev =>
            prev.map(s => (s.id === editingId ? res.data.data : s))
          );
          setMessage({ type: "success", text: "Skill updated!" });
        }
      } else {
        // Create
        const res = await api.post("/skills/create", formData);
        if (res.data.success) {
          setSkills(prev => [...prev, res.data.data]);
          setMessage({ type: "success", text: "Skill added!" });
        }
      }

      resetForm();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to save"
      });
    } finally {
      setSaving(false);
    }
  };

  // Function to render icon component
  const renderIcon = (iconName, size = 24, className = "") => {
    const IconComponent = iconComponents[iconName] || iconComponents.default;
    return <IconComponent size={size} className={className} />;
  };

  if (loading)
    return <div className="text-center text-xl py-20">Loading…</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Skills Management</h1>

      {message.text && (
        <div
          className={`p-3 mb-4 rounded ${
            message.type === "success"
              ? "bg-green-200 text-green-800"
              : "bg-red-200 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ---------- LEFT: FORM ---------- */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-6">
            {editingId ? "Edit Skill" : "Add Skill"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Skill Name */}
            <div>
              <label className="font-medium block mb-2">Skill Name *</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="React.js, Node.js, Python"
              />
            </div>

            {/* Category */}
            <div>
              <label className="font-medium block mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Icon Selection */}
            <div>
              <label className="font-medium block mb-2">Select Icon</label>
              <div className="mb-3">
                {formData.icon && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-3">
                    <span className="font-medium">Selected Icon:</span>
                    <div className="flex items-center gap-2">
                      {renderIcon(formData.icon, 24, "text-blue-600")}
                      <span className="text-sm text-gray-600">{formData.icon}</span>
                    </div>
                  </div>
                )}
                
                <select
                  name="icon"
                  value={formData.icon}
                  onChange={handleChange}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                >
                  <option value="">-- Select an Icon --</option>
                  {popularIcons.map((icon) => (
                    <option key={icon.value} value={icon.value}>
                      {icon.name} ({icon.value})
                    </option>
                  ))}
                </select>
              </div>

              {/* Icon Preview Grid */}
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Quick Pick:</p>
                <div className="grid grid-cols-5 md:grid-cols-8 gap-3 p-3 bg-gray-50 rounded-lg">
                  {popularIcons.map((icon) => (
                    <button
                      key={icon.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon: icon.value }))}
                      className={`p-2 rounded-lg flex flex-col items-center justify-center hover:bg-white transition ${
                        formData.icon === icon.value ? 'bg-white border-2 border-blue-500' : 'bg-gray-100'
                      }`}
                      title={icon.name}
                    >
                      {renderIcon(icon.value, 20, icon.color)}
                      <span className="text-xs mt-1 truncate w-full text-center">
                        {icon.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Level */}
            <div>
              <label className="font-medium block mb-2">
                Proficiency Level: <span className="text-blue-600 font-bold">{formData.level}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Beginner</span>
                <span>Intermediate</span>
                <span>Advanced</span>
                <span>Expert</span>
              </div>
            </div>

            {/* Display Order */}
            <div>
              <label className="font-medium block mb-2">Display Order</label>
              <input
                type="number"
                min="1"
                max="100"
                name="display_order"
                value={formData.display_order}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Preview */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">Preview</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                  {formData.icon ? (
                    renderIcon(formData.icon, 28, "text-blue-600")
                  ) : (
                    <FaCode size={28} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold">{formData.name || "Skill Name"}</h4>
                  <p className="text-sm text-gray-600">{formData.category}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full" 
                        style={{ width: `${formData.level}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{formData.level}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between pt-4">
              {editingId && (
                <button
                  onClick={resetForm}
                  type="button"
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel Edit
                </button>
              )}

              <button
                type="submit"
                disabled={saving}
                className={`px-6 py-3 rounded-lg font-medium transition ${
                  saving 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Skill"
                  : "Add Skill"}
              </button>
            </div>
          </form>
        </div>

        {/* ---------- RIGHT: SKILL LIST ---------- */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              All Skills ({skills.length})
            </h2>
            <button
              onClick={fetchSkills}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
            >
              Refresh
            </button>
          </div>

          {skills.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No skills added yet. Add your first skill!
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {skills.sort((a, b) => a.display_order - b.display_order).map(skill => (
                <div
                  key={skill.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                      {skill.icon ? (
                        renderIcon(skill.icon, 22, "text-blue-600")
                      ) : (
                        <FaCode size={22} className="text-gray-400" />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-lg">{skill.name}</strong>
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          {skill.category}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full" 
                            style={{ width: `${skill.level}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{skill.level}%</span>
                        <span className="text-sm text-gray-500">
                          Order: {skill.display_order}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(skill)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(skill.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
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

export default Skills;