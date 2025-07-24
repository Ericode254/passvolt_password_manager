import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export function Dashboard() {
  const insights = useQuery(api.passwords.getUserInsights);
  const passwords = useQuery(api.passwords.getPasswords, {});

  if (!insights || !passwords) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Loading your security dashboard...</span>
        </div>
      </div>
    );
  }

  const recentPasswords = passwords
    .sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))
    .slice(0, 4);

  const favoritePasswords = passwords.filter(p => p.isFavorite).slice(0, 4);

  const getStrengthColor = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-600";
    if (score >= 60) return "from-yellow-500 to-orange-500";
    if (score >= 40) return "from-orange-500 to-red-500";
    return "from-red-500 to-red-600";
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const securityScore = Math.round(insights.averageStrength);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-3">Security Overview</h2>
              <p className="text-blue-100 text-lg">
                Your digital security at a glance
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold mb-1">{securityScore}%</div>
              <div className="text-blue-200 text-sm">Security Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Total Passwords",
            value: insights.totalPasswords,
            icon: "🔐",
            color: "from-blue-500 to-blue-600",
            bgColor: "bg-blue-50",
            textColor: "text-blue-600"
          },
          {
            label: "Weak Passwords",
            value: insights.weakPasswords,
            icon: "⚠️",
            color: "from-red-500 to-red-600",
            bgColor: "bg-red-50",
            textColor: "text-red-600"
          },
          {
            label: "Duplicates",
            value: insights.duplicatePasswords,
            icon: "📋",
            color: "from-orange-500 to-orange-600",
            bgColor: "bg-orange-50",
            textColor: "text-orange-600"
          },
          {
            label: "Old Passwords",
            value: insights.oldPasswords,
            icon: "⏰",
            color: "from-yellow-500 to-yellow-600",
            bgColor: "bg-yellow-50",
            textColor: "text-yellow-600"
          }
        ].map((stat, index) => (
          <div key={index} className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
              </div>
              <div className={`w-14 h-14 ${stat.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Security Alerts */}
      {(insights.weakPasswords > 0 || insights.duplicatePasswords > 0 || insights.oldPasswords > 0) && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <span className="text-red-600 text-xl">🚨</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Security Alerts</h3>
              <p className="text-gray-600">Issues that need your attention</p>
            </div>
          </div>
          
          <div className="grid gap-4">
            {insights.weakPasswords > 0 && (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200 rounded-xl">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">⚠️</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-red-900">
                    {insights.weakPasswords} weak password{insights.weakPasswords > 1 ? 's' : ''} detected
                  </p>
                  <p className="text-sm text-red-700">
                    These passwords are vulnerable to attacks. Update them immediately.
                  </p>
                </div>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                  Fix Now
                </button>
              </div>
            )}
            
            {insights.duplicatePasswords > 0 && (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100/50 border border-orange-200 rounded-xl">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">📋</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-orange-900">
                    {insights.duplicatePasswords} duplicate password{insights.duplicatePasswords > 1 ? 's' : ''} found
                  </p>
                  <p className="text-sm text-orange-700">
                    Using unique passwords for each account improves security.
                  </p>
                </div>
                <button className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors">
                  Review
                </button>
              </div>
            )}

            {insights.oldPasswords > 0 && (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100/50 border border-yellow-200 rounded-xl">
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">⏰</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-yellow-900">
                    {insights.oldPasswords} password{insights.oldPasswords > 1 ? 's' : ''} need updating
                  </p>
                  <p className="text-sm text-yellow-700">
                    These passwords haven't been changed in over 90 days.
                  </p>
                </div>
                <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors">
                  Update
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity & Favorites */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Passwords */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-blue-600 text-xl">🕒</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Recently Used</h3>
              <p className="text-gray-600">Your most recent password activity</p>
            </div>
          </div>
          
          {recentPasswords.length > 0 ? (
            <div className="space-y-3">
              {recentPasswords.map((password, index) => (
                <div key={password._id} className="group flex items-center gap-4 p-4 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 transition-all duration-300">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold">
                        {password.siteName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{password.siteName}</p>
                    <p className="text-sm text-gray-500">{password.username}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getStrengthColor(password.strength.score)} text-white`}>
                    {password.strength.score}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">🔐</span>
              </div>
              <p className="text-gray-500">No passwords yet</p>
            </div>
          )}
        </div>

        {/* Favorite Passwords */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <span className="text-yellow-600 text-xl">⭐</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Favorites</h3>
              <p className="text-gray-600">Your most important passwords</p>
            </div>
          </div>
          
          {favoritePasswords.length > 0 ? (
            <div className="space-y-3">
              {favoritePasswords.map((password) => (
                <div key={password._id} className="group flex items-center gap-4 p-4 bg-yellow-50/80 rounded-xl hover:bg-yellow-100/80 transition-all duration-300">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold">
                        {password.siteName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -top-1 -right-1">
                      <span className="text-yellow-500 text-lg">⭐</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{password.siteName}</p>
                    <p className="text-sm text-gray-500">{password.username}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getStrengthColor(password.strength.score)} text-white`}>
                    {password.strength.score}%
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-yellow-400 text-2xl">⭐</span>
              </div>
              <p className="text-gray-500">No favorites yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Security Tips */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl p-8 border border-indigo-200/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-xl">💡</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-indigo-900">Security Tips</h3>
            <p className="text-indigo-700">Best practices for password security</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: "🔒",
              title: "Use Strong Passwords",
              description: "Create passwords with at least 12 characters, mixing letters, numbers, and symbols"
            },
            {
              icon: "🔄",
              title: "Regular Updates",
              description: "Change your passwords regularly, especially for important accounts"
            },
            {
              icon: "🎯",
              title: "Unique Passwords",
              description: "Never reuse passwords across multiple accounts"
            },
            {
              icon: "🛡️",
              title: "Two-Factor Auth",
              description: "Enable 2FA whenever possible for extra security"
            }
          ].map((tip, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-white/60 rounded-xl">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">{tip.icon}</span>
              </div>
              <div>
                <p className="font-semibold text-indigo-900 mb-1">{tip.title}</p>
                <p className="text-sm text-indigo-700">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
