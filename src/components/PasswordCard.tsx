import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useToast } from "./ui/use-toast";

interface PasswordCardProps {
  password: any;
  onEdit: () => void;
}

export function PasswordCard({ password, onEdit }: PasswordCardProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const updatePassword = useMutation(api.passwords.updatePassword);
  const deletePassword = useMutation(api.passwords.deletePassword);

  const getStrengthColor = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-600";
    if (score >= 60) return "from-yellow-500 to-orange-500";
    if (score >= 40) return "from-orange-500 to-red-500";
    return "from-red-500 to-red-600";
  };

  const getStrengthBg = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    if (score >= 40) return "bg-orange-50 border-orange-200";
    return "bg-red-50 border-red-200";
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied! ✨",
        description: `${type} copied to clipboard`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const toggleFavorite = async () => {
    setIsLoading(true);
    try {
      await updatePassword({
        id: password._id,
        isFavorite: !password.isFavorite,
      });
      toast({
        title: password.isFavorite ? "Removed from favorites" : "Added to favorites ⭐",
        description: `${password.siteName} has been ${password.isFavorite ? "removed from" : "added to"} your favorites`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Update failed",
        description: "Failed to update favorite status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this password?")) return;
    
    setIsDeleting(true);
    try {
      await deletePassword({ id: password._id });
      toast({
        title: "Password deleted 🗑️",
        description: `${password.siteName} password has been permanently deleted`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Delete failed",
        description: "Failed to delete password",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const openSite = () => {
    if (password.siteUrl) {
      window.open(password.siteUrl.startsWith('http') ? password.siteUrl : `https://${password.siteUrl}`, '_blank');
      toast({
        title: "Opening website 🌐",
        description: `Redirecting to ${password.siteName}`,
        variant: "default",
      });
    }
  };

  return (
    <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-lg">
                {password.siteName.charAt(0).toUpperCase()}
              </span>
            </div>
            {password.isFavorite && (
              <div className="absolute -top-1 -right-1">
                <span className="text-yellow-500 text-lg animate-pulse">⭐</span>
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{password.siteName}</h3>
            <p className="text-gray-500">{password.username}</p>
            {password.category && (
              <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                {password.category}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFavorite}
            disabled={isLoading}
            className={`p-2 rounded-xl transition-all duration-300 ${
              password.isFavorite 
                ? "text-yellow-500 bg-yellow-50 hover:bg-yellow-100" 
                : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {password.isFavorite ? "⭐" : "☆"}
          </button>
          {password.siteUrl && (
            <button
              onClick={openSite}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all duration-300"
              title="Open website"
            >
              🔗
            </button>
          )}
        </div>
      </div>

      {/* Password Field */}
      <div className="mb-6">
        <div className="flex items-center gap-3 p-4 bg-gray-50/80 rounded-xl border border-gray-200/50">
          <input
            type={showPassword ? "text" : "password"}
            value={password.password}
            readOnly
            className="flex-1 bg-transparent text-gray-900 font-mono text-sm focus:outline-none"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-lg transition-all duration-300"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
            <button
              onClick={() => copyToClipboard(password.password, "Password")}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-300"
              title="Copy password"
            >
              📋
            </button>
          </div>
        </div>
      </div>

      {/* Strength Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-gray-700">Password Strength</span>
          <span className="text-sm font-bold text-gray-900">{password.strength.score}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${getStrengthColor(password.strength.score)} transition-all duration-500 ease-out`}
            style={{ width: `${password.strength.score}%` }}
          ></div>
        </div>
        
        {password.strength.issues.length > 0 && (
          <div className={`mt-3 p-3 rounded-xl border ${getStrengthBg(password.strength.score)}`}>
            <p className="text-xs font-semibold text-gray-700 mb-2">Security Issues:</p>
            <ul className="text-xs text-gray-600 space-y-1">
              {password.strength.issues.slice(0, 2).map((issue: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">⚠️</span>
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Notes */}
      {password.notes && (
        <div className="mb-6 p-3 bg-blue-50/50 rounded-xl border border-blue-200/50">
          <p className="text-sm text-gray-700 leading-relaxed">{password.notes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
        <button
          onClick={() => copyToClipboard(password.username, "Username")}
          className="text-sm text-gray-500 hover:text-blue-600 font-medium transition-colors duration-300"
        >
          Copy Username
        </button>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium transition-all duration-300"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
