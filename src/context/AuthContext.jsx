import { createContext, useState, useContext, useEffect } from "react";
import api from "../api/axios.js";
import toast from "react-hot-toast";


const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  // 🟢 Check Auth – backend cookie se user mil jayega
  const checkAuth = async () => {
    try {
      const res = await api.get("/auth/profile");
      setUser(res.data.profile);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 🟢 Login
  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      setUser(res.data.loginUser);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Login failed",
      };
    }
  };

  // 🟢 Logout
  const logout = async () => {
    try {
      const res=await api.post("/auth/logout");
      if(res.data.success){
        toast.success("Logout Successfully")
      }
    } catch {}
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};
