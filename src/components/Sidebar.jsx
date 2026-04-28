import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../services/slice/loginSlice";
import {
  Home,
  UserPlus,
  CheckCircle2,
  XCircle,
  FileText,
  LogOut,
  Users,
  Settings,
  ChevronRight
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.login);
  const username = userData?.user_name || "Admin";
  const pageAccess = userData?.page_access || "";

  const menuItems = [
    {
      title: "Dashboard",
      icon: <Home size={20} />,
      path: "/dashboard/quick-task",
    },
    {
      title: "All Visitors",
      icon: <FileText size={20} />,
      path: "/dashboard/reports",
    },
    {
      title: "Request Gate Pass",
      icon: <UserPlus size={20} />,
      path: "/dashboard/assign-task",
    },
    {
      title: "Approval Requests",
      icon: <CheckCircle2 size={20} />,
      path: "/dashboard/approval-request",
    },
    {
      title: "Close Gate Pass",
      icon: <XCircle size={20} />,
      path: "/dashboard/close-gate-pass",
    },
    {
      title: "Employee Status",
      icon: <Users size={20} />,
      path: "/dashboard/employee",
    },
  ];

  // Filter menu items based on page_access
  const filteredMenuItems = menuItems.filter((item) => {
    if (!pageAccess) return false;
    if (pageAccess.toLowerCase() === "all") return true;
    
    // Check if item.title is mentioned in the page_access string
    return pageAccess.toLowerCase().includes(item.title.toLowerCase());
  });

  const handleLogout = () => {
    dispatch(logoutUser());  // clears Redux + sessionStorage
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-sky-100 w-64 shadow-xl z-20">
      {/* Logo */}
      <div className="p-6 border-b border-sky-50">
        <div className="flex items-center gap-3">
          <div className="bg-sky-500 p-2 rounded-xl shadow-lg shadow-sky-200">
            <FileText className="text-white" size={24} />
          </div>
          <span className="font-bold text-xl text-gray-800 tracking-tight">GatePass</span>
        </div>
      </div>

      {/* User Profile Summary */}
      <div className="p-4 mx-4 my-6 bg-gradient-to-br from-sky-50 to-blue-50 rounded-2xl border border-sky-100/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold border-2 border-white shadow-sm">
            {username.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-gray-800 truncate">{username}</p>
            <p className="text-xs text-sky-600 font-medium capitalize">{userData?.role || "Administrator"}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 px-4 space-y-1 overflow-y-auto">
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 mb-2">Main Menu</p>
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center justify-between group px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-sky-500 text-white shadow-md shadow-sky-100"
                  : "text-gray-500 hover:bg-sky-50 hover:text-sky-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? "text-white" : "group-hover:text-sky-600 transition-colors"}>
                  {item.icon}
                </span>
                <span className="text-sm font-semibold">{item.title}</span>
              </div>
              {isActive && <ChevronRight size={14} className="text-white/70" />}
            </Link>
          );
        })}
      </div>

      {/* Footer / Logout */}
      <div className="p-4 mt-auto border-t border-sky-50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-red-500 font-semibold text-sm hover:bg-red-50 rounded-xl transition-all group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
