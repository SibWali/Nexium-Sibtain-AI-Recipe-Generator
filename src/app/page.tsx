"use client";

import { useState } from "react";
import { supabase } from "./lib/supabaseClient";

export default function HomePage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleLogin = async () => {
    if (!email) return;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("❌ Error sending magic link");
    } else {
      setStatus("✅ Check your email for the magic link!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 relative overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-700/20 rounded-full blur-[150px] animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-700/20 rounded-full blur-[150px] animate-pulse delay-1000"></div>

      {/* Glass card */}
      <div className="backdrop-blur-xl bg-white/5 border border-purple-500/30 shadow-2xl rounded-2xl p-8 w-full max-w-md text-center transition-all transform hover:scale-[1.03] duration-500">
        
        {/* Title */}
        <h1 className="text-4xl font-extrabold text-white mb-2 tracking-wide">
          🍳 AI Recipe Generator
        </h1>
        <p className="text-gray-400 mb-6 text-sm">
          Created by <span className="font-semibold text-purple-400">Sibtain Wali</span>
        </p>

        {/* Email Input */}
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-gray-900/70 border border-gray-700 rounded-lg mb-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
        />

        {/* Button */}
        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-pink-500/30"
        >
          🚀 Send Magic Link
        </button>

        {/* Status */}
        {status && (
          <p className={`mt-4 text-sm font-medium ${status.includes("✅") ? "text-green-400" : "text-red-400"}`}>
            {status}
          </p>
        )}

        {/* Decorative Line */}
        <div className="mt-6 h-[1px] w-full bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
        
        {/* Footer */}
        <p className="mt-4 text-xs text-gray-500">
          Secure login powered by <span className="text-purple-400 font-semibold">Supabase</span>
        </p>
      </div>
    </div>
  );
}
