import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Total Sections</h3>
          <p className="text-3xl font-bold text-blue-600">6</p>
          <p className="text-gray-500 mt-2">About, Skills, Projects, etc.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Your Role</h3>
          <p className="text-2xl font-bold text-green-600">Admin</p>
          <p className="text-gray-500 mt-2">Full access</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Last Login</h3>
          <p className="text-2xl font-bold text-purple-600">Today</p>
          <p className="text-gray-500 mt-2">Welcome back!</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8 bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <a 
            href="/about" 
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
          >
            Edit About
          </a>
          <a 
            href="/projects" 
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
          >
            Add Project
          </a>
          <a 
            href="/skills" 
            className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition"
          >
            Manage Skills
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;