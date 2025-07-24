import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "./components/ui/toaster";
import { PasswordManager } from "./components/PasswordManager";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
                PassVault
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Secure & Smart</p>
            </div>
          </div>
          <Authenticated>
            <SignOutButton />
          </Authenticated>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Unauthenticated>
          <div className="max-w-md mx-auto mt-20">
            <div className="text-center mb-8">
              <div className="relative mx-auto mb-6 w-20 h-20">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-3">
                  <span className="text-white font-bold text-2xl transform -rotate-3">P</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-lg animate-pulse"></div>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent mb-3">
                PassVault
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                Your intelligent password manager with<br />
                <span className="font-semibold text-blue-600">advanced security insights</span>
              </p>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
              <SignInForm />
            </div>
          </div>
        </Unauthenticated>

        <Authenticated>
          <PasswordManager />
        </Authenticated>
      </main>

      <Toaster />
    </div>
  );
}
