import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/about', label: 'About', icon: '👤' },
    { path: '/skills', label: 'Skills', icon: '⚡' },
    { path: '/projects', label: 'Projects', icon: '📁' },
    { path: '/certificates', label: 'Certificates', icon: '🏅' },
    { path: '/contact', label: 'Contact', icon: '📞' },
  ];

  return (
    <div className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">CMS Admin</h1>
        {user && (
          <p className="text-sm text-gray-300 mt-1">
            {user.name || user.email}
          </p>
        )}
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-3 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-gray-800'
                  }`
                }
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;