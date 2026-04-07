import React from "react";
import { LogOut, Activity, Menu } from "lucide-react";
import { logout } from "../services/auth";

const Topbar = ({ onMenuClick }) => (
  <header className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-blue-900 border-b border-blue-800 shadow-sm">
    {/* Left Section */}
    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
      {/* Hamburger Menu - Mobile Only */}
      <button 
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-blue-800 text-blue-100 flex-shrink-0"
      >
        <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
      
      {/* Logo - Mobile */}
      <img 
        src="/logo.png" 
        alt="Logo" 
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shadow-sm lg:hidden flex-shrink-0" 
      />
      
      {/* Title */}
      <div className="min-w-0">
        <p className="text-xs text-blue-200 items-center gap-1 hidden sm:flex">
          <Activity className="w-3 h-3" />
          Live Monitoring
        </p>
        <h2 className="text-sm sm:text-lg lg:text-xl font-semibold text-white truncate">
          <span className="sm:hidden">IEMS</span>
          <span className="hidden sm:inline">Industrial Energy Monitoring System</span>
        </h2>
      </div>
    </div>

    {/* Right Section */}
    <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
      {/* Status Badge */}
      <div className="hidden sm:flex px-3 py-1.5 rounded-full text-xs text-blue-100 bg-blue-800 border border-blue-700 items-center gap-2">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        <span className="hidden md:inline">System Online</span>
      </div>
      
      {/* Mobile Status Dot */}
      <div className="sm:hidden w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      
      {/* Sign Out Button */}
      <button
        type="button"
        onClick={logout}
        className="px-2 sm:px-4 py-2 rounded-lg bg-blue-800 hover:bg-blue-700 text-blue-50 text-sm font-medium flex items-center gap-2 transition"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Sign Out</span>
      </button>
    </div>
  </header>
);

export default Topbar;
