import { useState, useEffect } from "react";
import api from "../api/axios";

const About = () => {
  const [aboutData, setAboutData] = useState({
    title: "",
    description: "",
    image: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 🟢 Fetch About Data
  const fetchAboutData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/about");

      if (res.data.success) {
        setAboutData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load about data" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutData();
  }, []);

  // 🟢 Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setAboutData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 🟢 Update About Section (title + description)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const body = {
        title: aboutData.title,
        description: aboutData.description,
      };

      const res = await api.put("/about/update", body);

      if (res.data.success) {
        setMessage({ type: "success", text: res.data.message });
        setAboutData(res.data.data); // updated data
      }
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update about section",
      });
    } finally {
      setSaving(false);
    }
  };

  // 🟢 Upload Image
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await api.post("/about/upload-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        setMessage({ type: "success", text: res.data.message });

        // Update image in UI
        setAboutData((prev) => ({
          ...prev,
          image: res.data.image, // returned from backend
        }));
      }
    } catch (error) {
      console.error(error);
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Image upload failed",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl">Loading About Data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">About Section</h1>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow">

        {/* Title */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={aboutData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Full Stack Developer"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={aboutData.description}
            onChange={handleChange}
            rows={5}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Write about yourself..."
            required
          />
        </div>

        {/* Existing Image Preview */}
        {aboutData.image && (
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Profile Image
            </label>
            <img
              src={aboutData.image}
              alt="profile"
              className="w-32 h-32 object-cover rounded-full border"
            />
            <p className="text-sm text-gray-500 mt-2">
              (Image comes from your User Profile)
            </p>
          </div>
        )}

        {/* Upload New Image */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            Upload New Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full border p-2 rounded-lg"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ${
            saving ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default About;
