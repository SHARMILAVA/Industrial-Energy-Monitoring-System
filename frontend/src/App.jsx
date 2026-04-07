import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Devices from "./pages/Devices";
import Reports from "./pages/Reports";
import HistoricalAnalysis from "./pages/HistoricalAnalysis";
import AutomatedControl from "./pages/AutomatedControl";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import { getToken } from "./services/auth";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-[260px_1fr]">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar - Mobile Slide-in */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
        
        {/* Main Content */}
        <div className="flex flex-col flex-1 min-w-0 bg-slate-100">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden bg-slate-100">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

const RequireAuth = ({ children }) => {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => (
  <AnimatePresence mode="wait">
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout>
              <Dashboard />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/devices"
        element={
          <RequireAuth>
            <Layout>
              <Devices />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/reports"
        element={
          <RequireAuth>
            <Layout>
              <Reports />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/historical-analysis"
        element={
          <RequireAuth>
            <Layout>
              <HistoricalAnalysis />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/automated-control"
        element={
          <RequireAuth>
            <Layout>
              <AutomatedControl />
            </Layout>
          </RequireAuth>
        }
      />
    </Routes>
  </AnimatePresence>
);

export default App;
