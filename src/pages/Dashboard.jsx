import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import DashboardNavbar from "../components/DashboardNavbar";
import { clearAuthSession, isAuthenticated, validateToken } from "../api/authApi";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const verifySession = async () => {
      if (!isAuthenticated()) {
        navigate("/login");
        return;
      }

      const result = await validateToken();

      if (!result?.ok) {
        clearAuthSession();
        navigate("/login");
      }
    };

    verifySession();
  }, [navigate]);

  return (
    <div className="bg-black min-h-screen text-white">
      <DashboardNavbar />

      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* 🔥 TABS */}
        <div className="flex gap-4 bg-[#111] p-2 rounded-xl w-fit">
          

          
        </div>

        {/* 🔥 PAGE CONTENT */}
        <Outlet />

      </div>
    </div>
  );
}
