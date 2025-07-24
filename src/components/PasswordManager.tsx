import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Dashboard } from "./Dashboard";
import { PasswordList } from "./PasswordList";
import { AddPasswordModal } from "./AddPasswordModal";
import { PasswordGenerator } from "./PasswordGenerator";

export function PasswordManager() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddModal, setShowAddModal] = useState(false);

  const user = useQuery(api.auth.loggedInUser);

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊", description: "Security overview" },
    { id: "passwords", label: "Passwords", icon: "🔐", description: "Manage passwords" },
    { id: "generator", label: "Generator", icon: "⚡", description: "Create strong passwords" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back{user?.name ? `, ${user.name}` : ''}! 👋
        </h1>
        <p className="text-gray-600">
          Manage your passwords securely and get intelligent security insights
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <nav className="flex flex-wrap gap-2 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-gray-200/50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50/80"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{tab.icon}</span>
                <div className="text-left">
                  <div className="font-semibold">{tab.label}</div>
                  <div className={`text-xs ${activeTab === tab.id ? 'text-blue-100' : 'text-gray-500'}`}>
                    {tab.description}
                  </div>
                </div>
              </div>
              {activeTab === tab.id && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
              )}
            </button>
          ))}
        </nav>

        <button
          onClick={() => setShowAddModal(true)}
          className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">+</span>
            <span>Add Password</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[600px] transition-all duration-500 ease-in-out">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "passwords" && <PasswordList />}
        {activeTab === "generator" && <PasswordGenerator />}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddPasswordModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
