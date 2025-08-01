"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";

interface Favorite {
  id: string;
  title: string;
  content: string;
  created_at?: string;
  user_id?: string;
  image_url?: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<Favorite | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/");
        return;
      }
      setSession(data.session);
      setAuthChecked(true);

      const { data: favs, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", data.session.user.id)
        .order("created_at", { ascending: false });

      if (!error && favs) setFavorites(favs as Favorite[]);
      setLoading(false);
    };

    fetchFavorites();
  }, [router]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await supabase.from("favorites").delete().eq("id", confirmDelete.id);
    setFavorites((prev) => prev.filter((fav) => fav.id !== confirmDelete.id));
    setConfirmDelete(null);
  };

  const filteredFavorites = favorites.filter((fav) =>
    fav.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="animate-spin h-8 w-8 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">⭐ My Favorites</h1>
        <button
          onClick={() => router.push("/recipes")}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-medium shadow-lg"
        >
          ⬅ Back
        </button>
      </div>

      <input
        type="text"
        placeholder="🔍 Search favorites..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 mb-6 rounded-lg bg-gray-800 border border-purple-500/30 focus:outline-none"
      />

      {loading ? (
        <p className="text-center text-gray-400">Loading favorites...</p>
      ) : filteredFavorites.length === 0 ? (
        <p className="text-center text-gray-400">No favorites found.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredFavorites.map((fav) => (
            <FavoriteCard
              key={fav.id}
              fav={fav}
              onDelete={() => setConfirmDelete(fav)}
              onView={() =>
                router.push(
                  `/recipes?title=${encodeURIComponent(
                    fav.title
                  )}&content=${encodeURIComponent(fav.content)}`
                )
              }
            />
          ))}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
            <p className="text-sm text-gray-300 mb-6">
              Are you sure you want to remove{" "}
              <b>{confirmDelete.title}</b> from favorites?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600"
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FavoriteCard({
  fav,
  onDelete,
  onView,
}: {
  fav: Favorite;
  onDelete: () => void;
  onView: () => void;
}) {
  return (
    <div className="bg-gray-800 border border-purple-500/30 rounded-lg p-5 shadow-lg hover:shadow-purple-500/20 transition-shadow duration-300">
      <img
        src={fav.image_url || "https://via.placeholder.com/300x150?text=No+Image"}
        alt={fav.title}
        className="w-full h-40 object-cover rounded-lg mb-4"
      />
      <h2 className="text-lg font-semibold mb-2">{fav.title}</h2>
      <div
        className="prose prose-invert max-w-none text-sm"
        dangerouslySetInnerHTML={{ __html: fav.content }}
      />
      <div className="flex justify-between mt-4">
        <button
          onClick={onDelete}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-lg text-sm"
        >
          ❌ Remove
        </button>
        <button
          onClick={onView}
          className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-lg text-sm"
        >
          👀 View Full
        </button>
      </div>
    </div>
  );
}
