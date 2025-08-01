"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

export default function RecipesPage() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/");
      } else {
        setSession(data.session);
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, [router]);

  const getRecipe = async () => {
    if (!input.trim()) return;
    try {
      setLoading(true);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });
      if (!res.ok) throw new Error("Failed to generate recipe");
      const data = await res.json();
      setRecipe(data.html);
    } catch {
      alert("❌ Error fetching recipe");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recipe.replace(/<[^>]*>?/gm, ""));
    alert("✅ Recipe copied!");
  };

  const toggleFavorite = async () => {
    if (!session?.user?.id || !recipe) return;
    try {
      const { data: existing } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("title", input || "Untitled Recipe")
        .single();

      if (existing) {
        await supabase.from("favorites").delete().eq("id", existing.id);
        alert("❌ Removed from favorites");
      } else {
        const { error } = await supabase.from("favorites").insert([
          {
            user_id: session.user.id,
            title: input || "Untitled Recipe",
            content: recipe,
          },
        ]);
        if (error) throw error;
        alert("⭐ Recipe saved to favorites!");
      }
    } catch {
      alert("❌ Error updating favorites");
    }
  };

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="animate-spin h-10 w-10 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-yellow-400 to-purple-500 bg-clip-text text-transparent drop-shadow-lg">
          🍳 Recipe Generator
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/favorites")}
            className="bg-yellow-500 hover:shadow-[0_0_15px_rgba(255,215,0,0.7)] px-4 py-2 rounded-lg font-medium transition-all duration-300"
          >
            ⭐ Favorites
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:shadow-[0_0_15px_rgba(255,0,0,0.6)] px-4 py-2 rounded-lg font-medium transition-all duration-300"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Enter recipe name..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full max-w-lg px-4 py-3 bg-gray-800/60 backdrop-blur-lg border border-gray-700 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-md"
        />
        <button
          onClick={getRecipe}
          className="bg-purple-600 hover:bg-purple-700 hover:shadow-[0_0_15px_rgba(138,43,226,0.7)] px-6 py-3 rounded-r-lg font-medium transition-all duration-300"
        >
          Generate
        </button>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center mt-6">
          <div className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Output */}
      {recipe && (
        <div className="max-w-3xl mx-auto bg-gray-900/70 backdrop-blur-lg border border-purple-500/40 rounded-xl shadow-2xl p-6 mt-6 transition-all duration-500">
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: recipe }}
          ></div>

          {/* Action buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <button
              onClick={copyToClipboard}
              className="bg-gray-800 hover:bg-gray-700 hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] px-4 py-2 rounded-lg shadow-md transition-all duration-300"
            >
              📋 Copy
            </button>
            <button
              onClick={toggleFavorite}
              className="bg-yellow-500 hover:bg-yellow-600 hover:shadow-[0_0_15px_rgba(255,215,0,0.6)] px-4 py-2 rounded-lg shadow-md transition-all duration-300"
            >
              ⭐ Toggle Favorite
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
