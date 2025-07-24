import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useToast } from "./ui/use-toast";

export function PasswordGenerator() {
  const [settings, setSettings] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: true,
  });
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [strength, setStrength] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generatePassword = useMutation(api.passwords.generatePassword);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generatePassword(settings);
      setGeneratedPassword(result.password);
      setStrength(result.strength);
      toast({
        title: "Password generated! ⚡",
        description: `Generated a ${result.strength.level} password with ${settings.length} characters`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Generation failed",
        description: "Failed to generate password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      toast({
        title: "Copied to clipboard! 📋",
        description: "Password has been copied to your clipboard",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy password to clipboard",
        variant: "destructive",
      });
    }
  };

  const getStrengthColor = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-600";
    if (score >= 60) return "from-yellow-500 to-orange-500";
    if (score >= 40) return "from-orange-500 to-red-500";
    return "from-red-500 to-red-600";
  };

  const getStrengthBg = (score: number) => {
    if (score >= 80) return "bg-green-50 border-green-200 text-green-800";
    if (score >= 60) return "bg-yellow-50 border-yellow-200 text-yellow-800";
    if (score >= 40) return "bg-orange-50 border-orange-200 text-orange-800";
    return "bg-red-50 border-red-200 text-red-800";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-white text-2xl">⚡</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Password Generator</h2>
        <p className="text-gray-600 text-lg">Create strong, secure passwords with customizable options</p>
      </div>

      {/* Settings */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <span className="text-2xl">⚙️</span>
          Generator Settings
        </h3>
        
        <div className="space-y-8">
          {/* Length Slider */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-semibold text-gray-700">Password Length</label>
              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                {settings.length} characters
              </div>
            </div>
            <div className="relative">
              <input
                type="range"
                min="8"
                max="64"
                value={settings.length}
                onChange={(e) => setSettings({ ...settings, length: parseInt(e.target.value) })}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((settings.length - 8) / (64 - 8)) * 100}%, #e5e7eb ${((settings.length - 8) / (64 - 8)) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>8</span>
                <span>16</span>
                <span>32</span>
                <span>64</span>
              </div>
            </div>
          </div>

          {/* Character Types */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Character Types</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'includeUppercase', label: 'Uppercase Letters', example: 'A-Z', icon: '🔤' },
                { key: 'includeLowercase', label: 'Lowercase Letters', example: 'a-z', icon: '🔡' },
                { key: 'includeNumbers', label: 'Numbers', example: '0-9', icon: '🔢' },
                { key: 'includeSymbols', label: 'Symbols', example: '!@#$%', icon: '🔣' }
              ].map((option) => (
                <label key={option.key} className="group flex items-center gap-4 p-4 bg-gray-50/80 rounded-xl border border-gray-200/50 hover:bg-gray-100/80 cursor-pointer transition-all duration-300">
                  <input
                    type="checkbox"
                    checked={settings[option.key as keyof typeof settings] as boolean}
                    onChange={(e) => setSettings({ ...settings, [option.key]: e.target.checked })}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xl">{option.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.example}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-4">Advanced Options</h4>
            <label className="flex items-center gap-4 p-4 bg-gray-50/80 rounded-xl border border-gray-200/50 hover:bg-gray-100/80 cursor-pointer transition-all duration-300">
              <input
                type="checkbox"
                checked={settings.excludeSimilar}
                onChange={(e) => setSettings({ ...settings, excludeSimilar: e.target.checked })}
                className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <div className="flex items-center gap-3">
                <span className="text-xl">👁️</span>
                <div>
                  <div className="font-medium text-gray-900">Exclude Similar Characters</div>
                  <div className="text-sm text-gray-500">Avoid confusing characters like i, l, 1, L, o, 0, O</div>
                </div>
              </div>
            </label>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || (!settings.includeUppercase && !settings.includeLowercase && !settings.includeNumbers && !settings.includeSymbols)}
            className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <span className="text-xl">⚡</span>
                Generate Secure Password
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Generated Password */}
      {generatedPassword && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            Generated Password
          </h3>
          
          <div className="space-y-6">
            {/* Password Display */}
            <div className="relative">
              <div className="flex items-center gap-4 p-4 bg-gray-50/80 rounded-xl border border-gray-200/50">
                <input
                  type="text"
                  value={generatedPassword}
                  readOnly
                  className="flex-1 bg-transparent text-gray-900 font-mono text-lg font-bold focus:outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="flex items-center gap-2">
                    <span>📋</span>
                    Copy
                  </div>
                </button>
              </div>
            </div>

            {/* Strength Analysis */}
            {strength && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Password Strength</span>
                  <div className={`px-4 py-2 rounded-full text-sm font-bold border ${getStrengthBg(strength.score)}`}>
                    {strength.score}% - {strength.level.charAt(0).toUpperCase() + strength.level.slice(1)}
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getStrengthColor(strength.score)} transition-all duration-1000 ease-out`}
                    style={{ width: `${strength.score}%` }}
                  ></div>
                </div>

                {strength.issues.length > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <p className="text-sm font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                      <span>💡</span>
                      Recommendations for even better security:
                    </p>
                    <ul className="text-sm text-yellow-700 space-y-2">
                      {strength.issues.map((issue: string, index: number) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-600 mt-0.5">•</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Security Tips */}
      <div className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl p-8 border border-indigo-200/50">
        <h3 className="text-xl font-bold text-indigo-900 mb-6 flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          Password Security Best Practices
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: "🔒",
              title: "Length Matters",
              description: "Longer passwords are exponentially harder to crack. Aim for at least 12 characters."
            },
            {
              icon: "🎲",
              title: "Use Randomness",
              description: "Avoid predictable patterns, dictionary words, or personal information."
            },
            {
              icon: "🔄",
              title: "Regular Updates",
              description: "Change passwords regularly, especially after security breaches."
            },
            {
              icon: "🎯",
              title: "Unique for Each Account",
              description: "Never reuse passwords across multiple accounts or services."
            }
          ].map((tip, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-white/70 rounded-xl">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <span className="text-xl">{tip.icon}</span>
              </div>
              <div>
                <p className="font-semibold text-indigo-900 mb-2">{tip.title}</p>
                <p className="text-sm text-indigo-700 leading-relaxed">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
