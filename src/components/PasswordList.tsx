import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PasswordCard } from "./PasswordCard";
import { EditPasswordModal } from "./EditPasswordModal";

export function PasswordList() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [editingPassword, setEditingPassword] = useState<any>(null);

  const passwords = useQuery(api.passwords.getPasswords, {
    category: selectedCategory === "All" ? undefined : selectedCategory,
    search: searchQuery || undefined,
  });

  const categories = ["All", "General", "Social Media", "Banking", "Work", "Shopping", "Entertainment"];

  if (!passwords) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading passwords...</div>
      </div>
    );
  }

  // Sort passwords
  const sortedPasswords = [...passwords].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return (b.lastUsed || 0) - (a.lastUsed || 0);
      case "name":
        return a.siteName.localeCompare(b.siteName);
      case "strength":
        return b.strength.score - a.strength.score;
      case "favorites":
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return (b.lastUsed || 0) - (a.lastUsed || 0);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Passwords</h2>
          <p className="text-gray-600">
            {passwords.length} password{passwords.length !== 1 ? 's' : ''} stored securely
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search passwords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="recent">Recently Used</option>
              <option value="name">Name (A-Z)</option>
              <option value="strength">Strength</option>
              <option value="favorites">Favorites First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Password Grid */}
      {sortedPasswords.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedPasswords.map((password) => (
            <PasswordCard
              key={password._id}
              password={password}
              onEdit={() => setEditingPassword(password)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-12 shadow-sm border text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-gray-400 text-2xl">🔐</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery || selectedCategory !== "All" ? "No passwords found" : "No passwords yet"}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || selectedCategory !== "All"
              ? "Try adjusting your search or filter criteria"
              : "Get started by adding your first password"}
          </p>
          {(!searchQuery && selectedCategory === "All") && (
            <button
              onClick={() => {
                // This would trigger the add password modal from the parent component
                // For now, we'll just show a message
                alert("Click the 'Add Password' button in the top navigation to get started!");
              }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
            >
              Add Your First Password
            </button>
          )}
        </div>
      )}

      {/* Statistics */}
      {sortedPasswords.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {sortedPasswords.filter(p => p.strength.score >= 80).length}
              </p>
              <p className="text-sm text-gray-600">Strong</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {sortedPasswords.filter(p => p.strength.score >= 60 && p.strength.score < 80).length}
              </p>
              <p className="text-sm text-gray-600">Good</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {sortedPasswords.filter(p => p.strength.score >= 40 && p.strength.score < 60).length}
              </p>
              <p className="text-sm text-gray-600">Fair</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {sortedPasswords.filter(p => p.strength.score < 40).length}
              </p>
              <p className="text-sm text-gray-600">Weak</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingPassword && (
        <EditPasswordModal
          password={editingPassword}
          onClose={() => setEditingPassword(null)}
        />
      )}
    </div>
  );
}
