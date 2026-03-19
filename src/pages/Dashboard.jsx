import { useEffect } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import DashboardNavbar from "../components/DashboardNavbar";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const logged = localStorage.getItem("isLoggedIn");
    if (!logged) navigate("/login");
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